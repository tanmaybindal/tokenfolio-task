'use client';

import { MoreHorizontalIcon } from 'lucide-react';

import { useRefreshServices } from '@/app/(dashboard)/_hooks/get-services';
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
  onRename,
  onDelete,
}: {
  service: ServiceResponse;
  onRename: () => void;
  onDelete: () => void;
}) {
  'use no memo';
  const { mutateAsync: refreshServices, isPending: refreshing } =
    useRefreshServices();

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
              await refreshServices([service.id]);
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
