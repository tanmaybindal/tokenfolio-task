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
  const { mutateAsync: deleteServices, isPending: deleting } = useDeleteServices();

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
              await deleteServices([target.id]);
              onOpenChange(false);
              onDeleted();
            }}
            disabled={deleting}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
