import {
  type QueryKey,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { DASHBOARD_REFETCH_INTERVAL_MS } from '@/app/(dashboard)/_constants/dashboard';
import seeds from '@/config/seeds.json';
import {
  checkHealth,
  computeHealthScore,
  STATUS_WEIGHT,
} from '@/lib/health-checker';
import { DEFAULT_RATE_LIMIT_COOLDOWN_MS } from '@/lib/rate-limit';
import { Service, SERVICE_ERROR_KIND } from '@/types';

export const GET_SERVICES_QUERY_KEY = ['services'] as const satisfies QueryKey;

function isRateLimitActive(service: Service): boolean {
  if (!service.rateLimitedUntil) return false;
  return new Date(service.rateLimitedUntil).getTime() > Date.now();
}

function createSeedServices(): Service[] {
  const now = new Date().toISOString();
  return seeds.map((seed, index) => ({
    id: `seed-${index + 1}`,
    name: seed.name,
    url: seed.url,
    createdAt: now,
    status: 'PENDING',
    latencyMs: null,
    lastCheckedAt: null,
    healthScore: null,
    history: [],
    rateLimitedUntil: null,
    lastHttpStatus: null,
    lastErrorKind: null,
  }));
}

async function runHealthChecks(services: Service[]): Promise<Service[]> {
  const updated = await Promise.all(
    services.map(async (service): Promise<Service> => {
      if (isRateLimitActive(service)) {
        return {
          ...service,
          status: 'RATE_LIMITED' as const,
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
        latencyMs: result.status === 'RATE_LIMITED' ? null : result.latencyMs,
        lastCheckedAt: new Date().toISOString(),
        history,
        healthScore,
        lastHttpStatus: result.httpStatus ?? null,
        lastErrorKind: result.errorKind ?? null,
        rateLimitedUntil:
          result.status === 'RATE_LIMITED'
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

export function getServicesQueryOptions() {
  return queryOptions<Service[]>({
    queryKey: GET_SERVICES_QUERY_KEY,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS,
    staleTime: 0,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

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

export function useRefreshServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceIds: string[]) => {
      const services =
        queryClient.getQueryData<Service[]>(GET_SERVICES_QUERY_KEY) ?? [];
      const targets = services.filter((service) =>
        serviceIds.includes(service.id),
      );

      const updates = await Promise.all(
        targets.map(async (target) => {
          if (isRateLimitActive(target)) {
            return {
              id: target.id,
              status: 'RATE_LIMITED' as const,
              latencyMs: null,
              lastCheckedAt: target.lastCheckedAt,
              history: target.history,
              healthScore: target.healthScore,
              lastHttpStatus: 429,
              lastErrorKind: SERVICE_ERROR_KIND.HTTP,
              rateLimitedUntil: target.rateLimitedUntil,
            };
          }

          const result = await checkHealth(target.url);
          const weight = STATUS_WEIGHT[result.status];
          const { history, healthScore } = computeHealthScore(
            target.history,
            weight,
          );
          return {
            id: target.id,
            status: result.status,
            latencyMs:
              result.status === 'RATE_LIMITED' ? null : result.latencyMs,
            lastCheckedAt: new Date().toISOString(),
            history,
            healthScore,
            lastHttpStatus: result.httpStatus ?? null,
            lastErrorKind: result.errorKind ?? null,
            rateLimitedUntil:
              result.status === 'RATE_LIMITED'
                ? new Date(
                    Date.now() +
                      (result.retryAfterMs ?? DEFAULT_RATE_LIMIT_COOLDOWN_MS),
                  ).toISOString()
                : null,
          };
        }),
      );

      const updatesMap = new Map(updates.map((update) => [update.id, update]));
      return services.map((service) => {
        const patch = updatesMap.get(service.id);
        return patch ? { ...service, ...patch } : service;
      });
    },
    onSuccess: (updatedServices) => {
      queryClient.setQueryData<Service[]>(
        GET_SERVICES_QUERY_KEY,
        updatedServices,
      );
      const limitedCount = updatedServices.filter(
        (service) => service.status === 'RATE_LIMITED',
      ).length;
      if (limitedCount > 0) {
        toast.info('Some services are rate limited and temporarily paused.');
      }
    },
  });
}
