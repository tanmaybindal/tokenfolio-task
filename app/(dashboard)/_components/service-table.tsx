'use client';

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import { ServiceResponse } from '@/types';

import { ServiceDialog } from './service-dialog';
import { ServiceTableCardHeader } from './service-table-card-header';
import { serviceTableColumns } from './service-table-columns';
import { ServiceTableData } from './service-table-data';
import { ServiceTableDeleteDialog } from './service-table-delete-dialog';
import { ServiceTablePagination } from './service-table-pagination';

interface ServiceTableProps {
  services: ServiceResponse[];
  onRefresh: () => void;
}

export function ServiceTable({ services, onRefresh }: ServiceTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deleteTarget, setDeleteTarget] = useState<ServiceResponse | null>(
    null,
  );
  const [renameTarget, setRenameTarget] = useState<ServiceResponse | null>(
    null,
  );

  const tableMeta = useMemo(
    () => ({
      onRefresh,
      onRename: setRenameTarget,
      onDelete: setDeleteTarget,
    }),
    [onRefresh],
  );

  const table = useReactTable({
    data: services,
    columns: serviceTableColumns,
    meta: tableMeta,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((r) => r.original.id);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border bg-card">
        <ServiceTableCardHeader
          title="Monitored APIs"
          selectedIds={selectedIds}
          onClearSelection={() => setRowSelection({})}
          onRefresh={onRefresh}
        />

        <ServiceTableData table={table} />

        <ServiceTablePagination table={table} />
      </div>

      <ServiceTableDeleteDialog
        target={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDeleted={onRefresh}
      />

      <ServiceDialog
        open={!!renameTarget}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        mode="edit"
        service={renameTarget ?? undefined}
        onSuccess={onRefresh}
      />
    </div>
  );
}
