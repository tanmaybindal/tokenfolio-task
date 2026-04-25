'use client';

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { parseAsIndex, parseAsInteger, useQueryStates } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';

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
  const [{ tablePageIndex, tablePageSize }, setPaginationState] =
    useQueryStates({
      tablePageIndex: parseAsIndex.withDefault(0),
      tablePageSize: parseAsInteger.withDefault(10),
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
    autoResetPageIndex: false,
    state: {
      sorting,
      rowSelection,
      pagination: { pageIndex: tablePageIndex, pageSize: tablePageSize },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const current = { pageIndex: tablePageIndex, pageSize: tablePageSize };
      const next = typeof updater === 'function' ? updater(current) : updater;
      void setPaginationState({
        tablePageIndex: next.pageIndex,
        tablePageSize: next.pageSize,
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    const maxPageIndex = Math.max(0, table.getPageCount() - 1);
    if (tablePageIndex > maxPageIndex) {
      void setPaginationState({ tablePageIndex: maxPageIndex });
    }
  }, [tablePageIndex, services.length, setPaginationState, table]);

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
