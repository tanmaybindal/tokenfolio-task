import { ActivityIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { addServiceDialogHandle } from './service-dialog-handles';

export function EmptyServices() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ActivityIcon />
        </EmptyMedia>
        <EmptyTitle>No services monitored</EmptyTitle>
        <EmptyDescription>
          Add your first service to start monitoring its health and reliability.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <DialogTrigger
          handle={addServiceDialogHandle}
          render={<Button>+ Add Service</Button>}
        />
      </EmptyContent>
    </Empty>
  );
}
