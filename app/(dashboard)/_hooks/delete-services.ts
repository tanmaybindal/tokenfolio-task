import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { GET_SERVICES_QUERY_KEY } from './get-services';

async function deleteServicesRequest(serviceIds: string[]) {
  const res = await fetch('/api/services', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceIds }),
  });
  if (!res.ok) {
    throw new Error('Failed to delete selected services');
  }
}

export function useDeleteServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteServicesRequest,
    onSuccess: async (_data, serviceIds) => {
      const isSingle = serviceIds.length === 1;
      toast.success(
        isSingle ? 'Service removed' : `Deleted ${serviceIds.length} services`,
      );
      await queryClient.invalidateQueries({ queryKey: GET_SERVICES_QUERY_KEY });
    },
    onError: () => {
      toast.error('Failed to delete selected services');
    },
  });
}
