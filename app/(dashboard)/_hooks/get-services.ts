import { type QueryKey, queryOptions, useQuery } from '@tanstack/react-query';

import { DASHBOARD_REFETCH_INTERVAL_MS } from '@/app/(dashboard)/_constants/dashboard';
import { Service } from '@/types';

export const GET_SERVICES_QUERY_KEY = ['services'] as const satisfies QueryKey;

async function fetchServices(): Promise<Service[]> {
  const res = await fetch('/api/services');
  if (!res.ok) throw new Error('Failed to fetch services');
  return res.json();
}

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
