import { ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyServicesProps {
  onAdd: () => void;
}

export function EmptyServices({ onAdd }: EmptyServicesProps) {
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
        <Button onClick={onAdd}>+ Add Service</Button>
      </EmptyContent>
    </Empty>
  );
}
