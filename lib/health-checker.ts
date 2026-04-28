import { DEFAULT_RATE_LIMIT_COOLDOWN_MS } from '@/lib/rate-limit';
import { CheckResult, SERVICE_ERROR_KIND, SERVICE_STATUS } from '@/types';

export const STATUS_WEIGHT = {
  [SERVICE_STATUS.UP]: 1.0,
  [SERVICE_STATUS.SLOW]: 0.5,
  [SERVICE_STATUS.DOWN]: 0.0,
  [SERVICE_STATUS.RATE_LIMITED]: 0.0,
} as const;

const FETCH_TIMEOUT_ERROR_NAME = 'TimeoutError';

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

export async function checkHealth(url: string): Promise<CheckResult> {
  // mock:// URLs let devs simulate failure states without waiting for real outages.
  // Usage: add "mock://down", "mock://slow", or "mock://up" as a service URL in seeds.json.
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
    if (res.status === 429) {
      return {
        status: SERVICE_STATUS.RATE_LIMITED,
        latencyMs,
        retryAfterMs: parseRetryAfterMs(res.headers.get('retry-after')),
        httpStatus: res.status,
        errorKind: SERVICE_ERROR_KIND.HTTP,
      };
    }
    if (!res.ok || latencyMs >= 2000) {
      return {
        status: SERVICE_STATUS.DOWN,
        latencyMs,
        httpStatus: res.status,
        errorKind: SERVICE_ERROR_KIND.HTTP,
      };
    }
    if (latencyMs >= 500) return { status: SERVICE_STATUS.SLOW, latencyMs };
    return {
      status: SERVICE_STATUS.UP,
      latencyMs,
      httpStatus: null,
      errorKind: null,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
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
