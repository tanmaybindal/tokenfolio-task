import '@/app/(dashboard)/_types/tanstack-table-meta';

import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { formatLatencyLabel } from '@/app/(dashboard)/_libs/format-latency-label';
import { cn } from '@/lib/utils';
import { ServiceResponse } from '@/types';

import { HealthHistoryBars } from './health-history-bars';
import { ServiceTableRowActions } from './service-table-row-actions';

const STATUS_ORDER: Record<string, number> = {
  UP: 0,
  SLOW: 1,
  DOWN: 2,
  PENDING: 3,
};

const STATUS_BADGE: Record<string, string> = {
  UP: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800',
  SLOW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  DOWN: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  PENDING: 'bg-muted text-muted-foreground border-border',
};

const STATUS_DOT: Record<string, string> = {
  UP: 'bg-green-500',
  SLOW: 'bg-amber-500',
  DOWN: 'bg-red-500',
  PENDING: 'bg-muted-foreground',
};

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ArrowUpIcon className="ml-1 size-3" />;
  if (sorted === 'desc') return <ArrowDownIcon className="ml-1 size-3" />;
  return <ArrowUpDownIcon className="ml-1 size-3 opacity-40" />;
}

export const serviceTableColumns: ColumnDef<ServiceResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() &&
          !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center text-xs font-semibold tracking-wider uppercase"
        onClick={() => column.toggleSorting()}
      >
        Service Name <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">
          {new URL(row.original.url).hostname}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-center text-xs font-semibold tracking-wider uppercase"
        onClick={() => column.toggleSorting()}
      >
        Status <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="flex justify-center">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
              STATUS_BADGE[status],
            )}
          >
            <span className={cn('size-1.5 rounded-full', STATUS_DOT[status])} />
            {status}
          </span>
        </div>
      );
    },
    sortingFn: (a, b) =>
      STATUS_ORDER[a.original.status] - STATUS_ORDER[b.original.status],
  },
  {
    accessorKey: 'latencyMs',
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center text-xs font-semibold tracking-wider uppercase"
        onClick={() => column.toggleSorting()}
      >
        Latency <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => (
      <span
        className={cn(
          'font-medium tabular-nums',
          row.original.status === 'DOWN' && 'text-destructive',
        )}
      >
        {row.original.latencyMs != null
          ? formatLatencyLabel(row.original.latencyMs)
          : 'Timeout'}
      </span>
    ),
  },
  {
    id: 'trend',
    header: () => (
      <span className="text-xs font-semibold tracking-wider uppercase">
        Trend
      </span>
    ),
    cell: ({ row }) => (
      <div className="w-32">
        <HealthHistoryBars history={row.original.history ?? []} className="h-9" />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'lastCheckedAt',
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center text-xs font-semibold tracking-wider uppercase"
        onClick={() => column.toggleSorting()}
      >
        Last Checked <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) =>
      row.original.lastCheckedAt
        ? formatDistanceToNow(new Date(row.original.lastCheckedAt), {
            addSuffix: true,
          })
        : 'Never',
  },
  {
    accessorKey: 'healthScore',
    header: ({ column }) => (
      <button
        type="button"
        className="flex cursor-pointer items-center text-xs font-semibold tracking-wider uppercase"
        onClick={() => column.toggleSorting()}
      >
        Health Score <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => {
      const score = row.original.healthScore;
      const pct = score ?? 0;
      const barColor =
        pct >= 70
          ? 'bg-green-500'
          : pct >= 40
            ? 'bg-amber-500'
            : 'bg-gray-300 dark:bg-gray-600';
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-all', barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-7 text-right text-sm font-semibold tabular-nums">
            {score ?? '—'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => (
      <span className="block text-center text-xs font-semibold tracking-wider uppercase">
        Actions
      </span>
    ),
    cell: ({ row, table }) => {
      const meta = table.options.meta;
      if (!meta) return null;
      return (
        <div className="flex justify-center">
          <ServiceTableRowActions
            service={row.original}
            onRefresh={meta.onRefresh}
            onRename={() => meta.onRename(row.original)}
            onDelete={() => meta.onDelete(row.original)}
          />
        </div>
      );
    },
    enableSorting: false,
  },
];
