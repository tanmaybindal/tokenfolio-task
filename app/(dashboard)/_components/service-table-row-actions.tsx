'use client';

import { MoreHorizontalIcon } from 'lucide-react';

import { useRefreshService } from '@/app/(dashboard)/_hooks/refresh-services';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ServiceResponse } from '@/types';

export function ServiceTableRowActions({
  service,
  onRefresh,
  onRename,
  onDelete,
}: {
  service: ServiceResponse;
  onRefresh: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  'use no memo';
  const { mutateAsync: refreshService, isPending: refreshing } =
    useRefreshService();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7 cursor-pointer"
          />
        }
      >
        <MoreHorizontalIcon data-icon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={refreshing}
            onClick={async () => {
              await refreshService(service.id);
              onRefresh();
            }}
          >
            Refresh
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRename} className="cursor-pointer">
            Edit
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
