'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { GET_SERVICES_QUERY_KEY } from '@/app/(dashboard)/_constants/query-keys';
import { Service } from '@/types';

export function useDeleteServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceIds: string[]) => {
      const current =
        queryClient.getQueryData<Service[]>(GET_SERVICES_QUERY_KEY) ?? [];
      return current.filter((service) => !serviceIds.includes(service.id));
    },
    onSuccess: (updatedServices, serviceIds) => {
      queryClient.setQueryData<Service[]>(GET_SERVICES_QUERY_KEY, updatedServices);
      toast.success(
        serviceIds.length === 1
          ? 'Service removed'
          : `Deleted ${serviceIds.length} services`,
      );
    },
  });
}
