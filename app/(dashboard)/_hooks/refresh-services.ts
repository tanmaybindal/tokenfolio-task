import { useMutation, useQueryClient } from '@tanstack/react-query';

import { GET_SERVICES_QUERY_KEY } from './get-services';

async function refreshServicesRequest(serviceIds?: string[]) {
  const isBulkRefresh = Array.isArray(serviceIds) && serviceIds.length > 0;

  const res = await fetch('/api/services/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(isBulkRefresh ? { serviceIds } : {}),
  });

  if (!res.ok) {
    throw new Error(
      isBulkRefresh
        ? 'Failed to refresh selected services'
        : 'Failed to refresh all services',
    );
  }
}

export function useRefreshServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshServicesRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GET_SERVICES_QUERY_KEY });
    },
  });
}

export function useRefreshService() {
  const { mutateAsync, ...rest } = useRefreshServices();

  return {
    ...rest,
    mutateAsync: (serviceId: string) => mutateAsync([serviceId]),
  };
}
