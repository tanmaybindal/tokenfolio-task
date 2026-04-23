import { CheckResult } from '@/types';

export const STATUS_WEIGHT = { UP: 1.0, SLOW: 0.5, DOWN: 0.0 } as const;

export async function checkHealth(url: string): Promise<CheckResult> {
  // mock:// URLs let devs simulate failure states without waiting for real outages.
  // Usage: add "mock://down", "mock://slow", or "mock://up" as a service URL in seeds.json.
  if (url.startsWith('mock://')) {
    const s = url.slice(7).toUpperCase();
    const status = s === 'UP' || s === 'SLOW' || s === 'DOWN' ? s : 'DOWN';
    const latencyMs = status === 'SLOW' ? 800 : status === 'DOWN' ? 2000 : 50;
    return { status, latencyMs };
  }

  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    const latencyMs = Date.now() - start;
    if (!res.ok || latencyMs >= 2000) return { status: 'DOWN', latencyMs };
    if (latencyMs >= 500) return { status: 'SLOW', latencyMs };
    return { status: 'UP', latencyMs };
  } catch {
    return { status: 'DOWN', latencyMs: Date.now() - start };
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
