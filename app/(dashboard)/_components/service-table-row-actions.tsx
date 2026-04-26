'use client';

import { MoreHorizontalIcon } from 'lucide-react';

import {
  deleteServiceDialogHandle,
  editServiceDialogHandle,
} from '@/app/(dashboard)/_components/service-dialog-handles';
import { useRefreshServices } from '@/app/(dashboard)/_hooks/get-services';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
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
}: {
  service: ServiceResponse;
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
          <DialogTrigger
            handle={editServiceDialogHandle}
            nativeButton={false}
            payload={service}
            render={<DropdownMenuItem className="cursor-pointer" />}
          >
            Edit
          </DialogTrigger>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <AlertDialogTrigger
            handle={deleteServiceDialogHandle}
            nativeButton={false}
            payload={service}
            render={
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" />
            }
          >
            Delete
          </AlertDialogTrigger>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
