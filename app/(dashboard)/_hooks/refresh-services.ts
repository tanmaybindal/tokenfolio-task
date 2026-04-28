'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { GET_SERVICES_QUERY_KEY } from '@/app/(dashboard)/_constants/query-keys';
import { isRateLimitActive } from '@/app/(dashboard)/_libs/service-rate-limit';
import { DEFAULT_RATE_LIMIT_COOLDOWN_MS } from '@/constants/rate-limit';
import { STATUS_WEIGHT } from '@/constants/status-weight';
import { checkHealth, computeHealthScore } from '@/lib/health-checker';
import { Service, SERVICE_ERROR_KIND, SERVICE_STATUS } from '@/types';

/** Refresh only the given service ids: merges partial updates back into the full cached list. */

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
              status: SERVICE_STATUS.RATE_LIMITED,
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
              result.status === SERVICE_STATUS.RATE_LIMITED
                ? null
                : result.latencyMs,
            lastCheckedAt: new Date().toISOString(),
            history,
            healthScore,
            lastHttpStatus: result.httpStatus ?? null,
            lastErrorKind: result.errorKind ?? null,
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

      const updatesMap = new Map(updates.map((update) => [update.id, update]));
      // Rebuild full array: unchanged rows keep their objects; refreshed ids get merged fields.
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
        (service) => service.status === SERVICE_STATUS.RATE_LIMITED,
      ).length;
      if (limitedCount > 0) {
        // User-visible hint: those rows will skip checks until Retry-After passes.
        toast.info('Some services are rate limited and temporarily paused.');
      }
    },
  });
}
