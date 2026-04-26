import { BulkActionBar } from './bulk-action-bar';
import { ServiceResponse } from '@/types';

interface ServiceTableHeaderProps {
  title: string;
  selectedServices: ServiceResponse[];
  onClearSelection: () => void;
}

export function ServiceTableHeader({
  title,
  selectedServices,
  onClearSelection,
}: ServiceTableHeaderProps) {
  return (
    <div className="flex min-h-15 items-center border-b px-4 py-3">
      {selectedServices.length > 0 ? (
        <BulkActionBar
          selectedServices={selectedServices}
          onClear={onClearSelection}
        />
      ) : (
        <h2 className="text-base font-semibold">{title}</h2>
      )}
    </div>
  );
}
