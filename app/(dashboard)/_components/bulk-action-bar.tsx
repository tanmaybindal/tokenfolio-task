'use client';

import { toast } from 'sonner';

import { useDeleteServices } from '@/app/(dashboard)/_hooks/delete-services';
import { useRefreshServices } from '@/app/(dashboard)/_hooks/refresh-services';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  onRefresh: () => void;
}

export function BulkActionBar({
  selectedIds,
  onClear,
  onRefresh,
}: BulkActionBarProps) {
  const {
    mutateAsync: deleteServices,
    isPending: isDeleting,
  } = useDeleteServices();
  const {
    mutateAsync: refreshServices,
    isPending: isRefreshing,
  } = useRefreshServices();

  if (selectedIds.length === 0) return null;

  async function handleBulkRefresh() {
    try {
      await refreshServices(selectedIds);
      toast.success(
        `Refreshed ${selectedIds.length} service${selectedIds.length > 1 ? 's' : ''}`,
      );
      onRefresh();
      onClear();
    } catch {
      toast.error('Failed to refresh selected services');
    }
  }

  async function handleBulkDelete() {
    try {
      await deleteServices(selectedIds);
      onRefresh();
      onClear();
    } catch {
      // Error toast is handled in the mutation hook.
    }
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
          disabled={isRefreshing || isDeleting}
          className="cursor-pointer"
        >
          {isRefreshing && <Spinner className="mr-2 size-4" />}
          Refresh Selected
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleBulkDelete}
          disabled={isDeleting || isRefreshing}
          className="cursor-pointer"
        >
          {isDeleting && <Spinner className="mr-2 size-4" />}
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
