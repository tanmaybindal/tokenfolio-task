import { CheckResult, Service, SERVICE_STATUS } from '@/types';

export function applyCheckResult(
  service: Service,
  result: CheckResult,
  history: number[],
  healthScore: number,
): Service {
  return {
    ...service,
    status: result.status,
    latencyMs: result.latencyMs,
    lastCheckedAt: new Date().toISOString(),
    healthScore,
    history,
    lastHttpStatus: result.httpStatus ?? null,
    lastErrorKind: result.errorKind ?? null,
    rateLimitedUntil:
      result.status === SERVICE_STATUS.RATE_LIMITED &&
      result.retryAfterMs != null
        ? new Date(Date.now() + result.retryAfterMs).toISOString()
        : null,
  };
}
