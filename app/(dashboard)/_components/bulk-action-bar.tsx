'use client';

import { useIsFetching } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  deleteServiceDialogHandle,
} from '@/app/(dashboard)/_components/service-dialog-handles';
import {
  GET_SERVICES_QUERY_KEY,
} from '@/app/(dashboard)/_hooks/get-services';
import { useRefreshServices } from '@/app/(dashboard)/_hooks/refresh-services';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ServiceResponse } from '@/types';

interface BulkActionBarProps {
  selectedServices: ServiceResponse[];
  onClear: () => void;
}

export function BulkActionBar({
  selectedServices,
  onClear,
}: BulkActionBarProps) {
  const {
    mutateAsync: refreshServices,
    isPending: isBulkRefreshing,
  } = useRefreshServices();
  const isRefreshing = useIsFetching({ queryKey: GET_SERVICES_QUERY_KEY }) > 0;
  const selectedIds = selectedServices.map((service) => service.id);

  if (selectedIds.length === 0) return null;

  async function handleBulkRefresh() {
    await refreshServices(selectedIds);
    toast.success(
      `Refreshed ${selectedIds.length} service${selectedIds.length > 1 ? 's' : ''}`,
    );
    onClear();
  }

  return (
    <div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2 sm:justify-between">
      <span className="text-base font-semibold">
        {selectedIds.length} selected
      </span>
      <div className="flex flex-wrap items-center gap-2 sm:flex-1 sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkRefresh}
          disabled={isRefreshing || isBulkRefreshing}
          className="cursor-pointer"
        >
          {(isRefreshing || isBulkRefreshing) && (
            <Spinner className="mr-2 size-4" />
          )}
          Refresh Selected
        </Button>
        <AlertDialogTrigger
          handle={deleteServiceDialogHandle}
          payload={selectedServices}
          render={
            <Button
              variant="destructive"
              size="sm"
              disabled={isRefreshing}
              className="cursor-pointer"
            />
          }
        >
          Delete Selected
        </AlertDialogTrigger>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="cursor-pointer"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
