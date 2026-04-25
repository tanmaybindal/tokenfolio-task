import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';

import { formatLatencyLabel } from '@/app/(dashboard)/_libs/format-latency-label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { SERVICE_ERROR_KIND, ServiceResponse } from '@/types';

import { HealthHistoryBars } from './health-history-bars';
import { RateLimitCountdown } from './rate-limit-countdown';
import { ServiceStatusBadge } from './service-status-badge';
import { ServiceTableRowActions } from './service-table-row-actions';

const STATUS_ORDER: Record<string, number> = {
  UP: 0,
  SLOW: 1,
  DOWN: 2,
  RATE_LIMITED: 3,
  PENDING: 4,
};

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (sorted === 'asc') return <ArrowUpIcon className="ml-1 size-3" />;
  if (sorted === 'desc') return <ArrowDownIcon className="ml-1 size-3" />;
  return <ArrowUpDownIcon className="ml-1 size-3 opacity-40" />;
}

function getDownLabel(service: ServiceResponse): string {
  if (service.status === 'RATE_LIMITED') return 'Rate limited';
  if (service.lastHttpStatus === 403) return '403 Forbidden';
  if (service.lastHttpStatus != null) return `${service.lastHttpStatus} Error`;
  if (service.lastErrorKind === SERVICE_ERROR_KIND.TIMEOUT) return 'Timeout';
  if (service.lastErrorKind === SERVICE_ERROR_KIND.NETWORK)
    return 'Network error';
  return 'Timeout';
}

export const serviceTableColumns: ColumnDef<ServiceResponse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
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
        className="flex w-full cursor-pointer items-center justify-start text-xs font-semibold tracking-wider uppercase"
        onClick={() => column.toggleSorting()}
      >
        Status <SortIcon sorted={column.getIsSorted()} />
      </button>
    ),
    cell: ({ row }) => {
      const service = row.original;
      return (
        <div className="flex justify-start">
          <ServiceStatusBadge service={service} />
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
      <div className="flex flex-col">
        <span
          className={cn(
            'font-medium tabular-nums',
            (row.original.status === 'DOWN' ||
              row.original.status === 'RATE_LIMITED') &&
              'text-destructive',
          )}
        >
          {row.original.status === 'UP' || row.original.status === 'SLOW'
            ? row.original.latencyMs != null
              ? formatLatencyLabel(row.original.latencyMs)
              : '—'
            : getDownLabel(row.original)}
        </span>
        {row.original.status === 'RATE_LIMITED' && (
          <RateLimitCountdown
            rateLimitedUntil={row.original.rateLimitedUntil}
            className="text-xs text-muted-foreground"
          />
        )}
      </div>
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
        <HealthHistoryBars
          history={row.original.history ?? []}
          className="h-9"
        />
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
          <span className="w-10 text-right text-sm font-semibold tabular-nums">
            {score != null ? `${score}%` : '—'}
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
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <ServiceTableRowActions service={row.original} />
        </div>
      );
    },
    enableSorting: false,
  },
];
