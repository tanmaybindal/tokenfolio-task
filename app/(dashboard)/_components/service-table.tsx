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
import { useEffect, useState } from 'react';

import { ServiceResponse } from '@/types';

import { serviceTableColumns } from './service-table-columns';
import { ServiceTableData } from './service-table-data';
import { ServiceTableHeader } from './service-table-header';
import { ServiceTablePagination } from './service-table-pagination';

interface ServiceTableProps {
  services: ServiceResponse[];
}

export function ServiceTable({ services }: ServiceTableProps) {
  'use no memo';

  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [{ tablePageIndex, tablePageSize }, setPaginationState] =
    useQueryStates({
      tablePageIndex: parseAsIndex.withDefault(0),
      tablePageSize: parseAsInteger.withDefault(10),
    });

  const table = useReactTable({
    data: services,
    columns: serviceTableColumns,
    getRowId: (row) => row.id,
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

  const selectedServices = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg border bg-card">
        <ServiceTableHeader
          title="Monitored APIs"
          selectedServices={selectedServices}
          onClearSelection={() => setRowSelection({})}
        />

        <ServiceTableData table={table} />

        <ServiceTablePagination table={table} />
      </div>
    </div>
  );
}
