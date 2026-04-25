'use client';

import { toast } from 'sonner';

import { useDeleteServices } from '@/app/(dashboard)/_hooks/delete-services';
import {
  useGetServices,
  useRefreshServices,
} from '@/app/(dashboard)/_hooks/get-services';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const { mutate: deleteServices } = useDeleteServices();
  const {
    mutateAsync: refreshServices,
    isPending: isBulkRefreshing,
  } = useRefreshServices();
  const { isFetching: isRefreshing } = useGetServices();

  if (selectedIds.length === 0) return null;

  async function handleBulkRefresh() {
    await refreshServices(selectedIds);
    toast.success(
      `Refreshed ${selectedIds.length} service${selectedIds.length > 1 ? 's' : ''}`,
    );
    onClear();
  }

  function handleBulkDelete() {
    deleteServices(selectedIds);
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
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
          disabled={isRefreshing}
          className="cursor-pointer"
        >
          Delete Selected
        </Button>
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
