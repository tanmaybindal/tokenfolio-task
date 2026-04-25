import { BulkActionBar } from './bulk-action-bar';

interface ServiceTableCardHeaderProps {
  title: string;
  selectedIds: string[];
  onClearSelection: () => void;
}

export function ServiceTableCardHeader({
  title,
  selectedIds,
  onClearSelection,
}: ServiceTableCardHeaderProps) {
  return (
    <div className="flex min-h-15 items-center border-b px-4 py-3">
      {selectedIds.length > 0 ? (
        <BulkActionBar
          selectedIds={selectedIds}
          onClear={onClearSelection}
        />
      ) : (
        <h2 className="text-base font-semibold">{title}</h2>
      )}
    </div>
  );
}
