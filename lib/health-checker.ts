import { DEFAULT_RATE_LIMIT_COOLDOWN_MS } from '@/constants/rate-limit';
import { CheckResult, SERVICE_ERROR_KIND, SERVICE_STATUS } from '@/types';

const FETCH_TIMEOUT_ERROR_NAME = 'TimeoutError';

/**
 * Turns the Retry-After header into milliseconds to wait.
 * It can be a small number (seconds) or a full date string; bad or missing → use default from config.
 */
function parseRetryAfterMs(retryAfterHeader: string | null): number {
  if (!retryAfterHeader) return DEFAULT_RATE_LIMIT_COOLDOWN_MS;
  const seconds = Number(retryAfterHeader);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds * 1000;
  }

  const targetAt = new Date(retryAfterHeader).getTime();
  if (Number.isNaN(targetAt)) return DEFAULT_RATE_LIMIT_COOLDOWN_MS;
  return Math.max(0, targetAt - Date.now()) || DEFAULT_RATE_LIMIT_COOLDOWN_MS;
}

/**
 * Performs one GET with a 2 second cap on total time.
 * Rules: HTTP 429 → rate limited (with optional wait hint). Any other non-success, or ≥2s to respond → DOWN.
 * Success in under 500ms → UP; 500ms up to (but not including) 2s → SLOW.
 */
export async function checkHealth(url: string): Promise<CheckResult> {
  // For tests: mock://up, mock://slow, mock://down — no real request, fixed fake latencies.
  if (url.startsWith('mock://')) {
    const s = url.slice(7).toUpperCase();
    const status =
      s === SERVICE_STATUS.UP ||
      s === SERVICE_STATUS.SLOW ||
      s === SERVICE_STATUS.DOWN
        ? s
        : SERVICE_STATUS.DOWN;
    const latencyMs =
      status === SERVICE_STATUS.SLOW
        ? 800
        : status === SERVICE_STATUS.DOWN
          ? 2000
          : 50;
    return { status, latencyMs };
  }

  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    const latencyMs = Date.now() - start;
    // Too many requests: server may send when to retry in Retry-After.
    if (res.status === 429) {
      return {
        status: SERVICE_STATUS.RATE_LIMITED,
        latencyMs,
        retryAfterMs: parseRetryAfterMs(res.headers.get('retry-after')),
        httpStatus: res.status,
        errorKind: SERVICE_ERROR_KIND.HTTP,
      };
    }
    // Bad status code, or response only finished at or after 2s (treat as failed).
    if (!res.ok || latencyMs >= 2000) {
      return {
        status: SERVICE_STATUS.DOWN,
        latencyMs,
        httpStatus: res.status,
        errorKind: SERVICE_ERROR_KIND.HTTP,
      };
    }
    // Still a 2xx, but slow: between 500ms and 2000ms (UP is strictly under 500ms).
    if (latencyMs >= 500) return { status: SERVICE_STATUS.SLOW, latencyMs };
    return {
      status: SERVICE_STATUS.UP,
      latencyMs,
      httpStatus: null,
      errorKind: null,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    // Distinguish "hit the 2s cap" from other failures (DNS, refused connection, etc.).
    const isTimeoutError =
      error instanceof DOMException && error.name === FETCH_TIMEOUT_ERROR_NAME;
    return {
      status: SERVICE_STATUS.DOWN,
      latencyMs,
      httpStatus: null,
      errorKind: isTimeoutError
        ? SERVICE_ERROR_KIND.TIMEOUT
        : SERVICE_ERROR_KIND.NETWORK,
    };
  }
}

/**
 * Adds the latest check’s weight to the list, keeps only the 10 most recent values,
 * and returns a percentage: average of those weights × 100 (rounded).
 */
export function computeHealthScore(
  history: number[],
  newWeight: number,
): { history: number[]; healthScore: number } {
  const updated = [...history, newWeight].slice(-10);
  const healthScore = Math.round(
    (updated.reduce((a, b) => a + b, 0) / updated.length) * 100,
  );
  return { history: updated, healthScore };
}
