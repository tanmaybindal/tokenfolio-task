import type { RowData } from '@tanstack/react-table';

import type { ServiceResponse } from '@/types';

export {};

declare module '@tanstack/react-table' {
  // Must match `TableMeta<TData>` from @tanstack/table-core; `TData` is unused here.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onRefresh: () => void;
    onRename: (service: ServiceResponse) => void;
    onDelete: (service: ServiceResponse) => void;
  }
}
