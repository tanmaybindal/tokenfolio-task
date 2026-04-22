import { toast } from 'sonner';

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

interface ServiceTableDeleteDialogProps {
  target: ServiceResponse | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function ServiceTableDeleteDialog({
  target,
  onOpenChange,
  onDeleted,
}: ServiceTableDeleteDialogProps) {
  return (
    <AlertDialog open={!!target} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {target?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the service and all its health history. This cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={async () => {
              if (!target) return;
              await fetch(`/api/services/${target.id}`, {
                method: 'DELETE',
              });
              toast.success(`${target.name} removed`);
              onOpenChange(false);
              onDeleted();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
