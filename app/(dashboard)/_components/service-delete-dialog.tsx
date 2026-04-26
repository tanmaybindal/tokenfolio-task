'use client';

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { useDeleteServices } from '@/app/(dashboard)/_hooks/delete-services';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ServiceResponse } from '@/types';

interface ServiceDeleteDialogProps {
  handle: AlertDialogPrimitive.Root.Props['handle'];
}

export function ServiceDeleteDialog({ handle }: ServiceDeleteDialogProps) {
  const dialogHandle = handle as { close?: () => void };
  const { mutateAsync: deleteServices, isPending: deleting } =
    useDeleteServices();

  return (
    <AlertDialog handle={handle}>
      {({ payload }) => {
        const targets = Array.isArray(payload)
          ? (payload as ServiceResponse[])
          : payload
            ? [payload as ServiceResponse]
            : [];
        const targetCount = targets.length;
        const firstTargetName = targets[0]?.name;

        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {targetCount > 1
                  ? `Delete ${targetCount} services?`
                  : `Delete ${firstTargetName}?`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {targetCount > 1
                  ? 'This removes the selected services and all their health history. This cannot be undone.'
                  : 'This removes the service and all its health history. This cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={async () => {
                  if (targetCount === 0) return;
                  await deleteServices(targets.map((target) => target.id));
                  dialogHandle.close?.();
                }}
                disabled={deleting || targetCount === 0}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        );
      }}
    </AlertDialog>
  );
}
