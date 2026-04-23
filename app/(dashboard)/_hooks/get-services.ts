import { type QueryKey, queryOptions, useQuery } from '@tanstack/react-query';

import { DASHBOARD_REFETCH_INTERVAL_MS } from '@/app/(dashboard)/_constants/dashboard';
import { fetchServices } from '@/app/(dashboard)/_libs/dashboard-client-store';
import { Service } from '@/types';

export const GET_SERVICES_QUERY_KEY = ['services'] as const satisfies QueryKey;

export function getServicesQueryOptions(initialServices?: Service[]) {
  return queryOptions({
    queryKey: GET_SERVICES_QUERY_KEY,
    queryFn: fetchServices,
    refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: true,
    ...(initialServices ? { initialData: initialServices } : {}),
  });
}

export function useGetServices(initialServices?: Service[]) {
  return useQuery(getServicesQueryOptions(initialServices));
}
