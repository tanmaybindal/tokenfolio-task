import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { DASHBOARD_REFETCH_INTERVAL_MS } from '@/app/(dashboard)/_constants/dashboard';
import { GET_SERVICES_QUERY_KEY } from '@/app/(dashboard)/_constants/query-keys';
import { isRateLimitActive } from '@/app/(dashboard)/_libs/service-rate-limit';
import seeds from '@/config/seeds.json';
import { DEFAULT_RATE_LIMIT_COOLDOWN_MS } from '@/constants/rate-limit';
import { STATUS_WEIGHT } from '@/constants/status-weight';
import { checkHealth, computeHealthScore } from '@/lib/health-checker';
import { Service, SERVICE_ERROR_KIND, SERVICE_STATUS } from '@/types';

/** Placeholder rows from config when the client cache has no services yet (e.g. first load). */
function createSeedServices(): Service[] {
  const now = new Date().toISOString();
  return seeds.map((seed, index) => ({
    id: `seed-${index + 1}`,
    name: seed.name,
    url: seed.url,
    createdAt: now,
    status: SERVICE_STATUS.PENDING,
    latencyMs: null,
    lastCheckedAt: null,
    healthScore: null,
    history: [],
    rateLimitedUntil: null,
    lastHttpStatus: null,
    lastErrorKind: null,
  }));
}

/**
 * Runs checkHealth for each row; updates status, latency, rolling history, score, and rate-limit expiry.
 * If still in cooldown after a 429, skips the fetch and keeps the row marked rate limited.
 */
async function runHealthChecks(services: Service[]): Promise<Service[]> {
  const updated = await Promise.all(
    services.map(async (service): Promise<Service> => {
      if (isRateLimitActive(service)) {
        return {
          ...service,
          status: SERVICE_STATUS.RATE_LIMITED,
          lastHttpStatus: 429,
          lastErrorKind: SERVICE_ERROR_KIND.HTTP,
        };
      }

      const result = await checkHealth(service.url);
      const weight = STATUS_WEIGHT[result.status];
      const { history, healthScore } = computeHealthScore(
        service.history,
        weight,
      );
      return {
        ...service,
        status: result.status,
        latencyMs:
          result.status === SERVICE_STATUS.RATE_LIMITED
            ? null
            : result.latencyMs,
        lastCheckedAt: new Date().toISOString(),
        history,
        healthScore,
        lastHttpStatus: result.httpStatus ?? null,
        lastErrorKind: result.errorKind ?? null,
        // After 429: when we are allowed to probe again (from Retry-After or default).
        rateLimitedUntil:
          result.status === SERVICE_STATUS.RATE_LIMITED
            ? new Date(
                Date.now() +
                  (result.retryAfterMs ?? DEFAULT_RATE_LIMIT_COOLDOWN_MS),
              ).toISOString()
            : null,
      };
    }),
  );
  return updated;
}

/** Options shared by useGetServices: polling interval and always treat as stale (refetch picks up checks). */
export function getServicesQueryOptions() {
  return queryOptions<Service[]>({
    queryKey: GET_SERVICES_QUERY_KEY,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS,
    staleTime: 0,
  });
}

/**
 * Live list hook: on each interval, uses whatever is already in cache (else seeds) and re-runs checks.
 */
export function useGetServices() {
  const queryClient = useQueryClient();
  return useQuery({
    ...getServicesQueryOptions(),
    queryFn: async () => {
      const current =
        queryClient.getQueryData<Service[]>(GET_SERVICES_QUERY_KEY) ??
        createSeedServices();
      return runHealthChecks(current);
    },
  });
}
