'use client';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ServerIcon,
  XCircleIcon,
} from 'lucide-react';
import { useIsRestoring } from '@tanstack/react-query';

import { DASHBOARD_SERVICE_STATUS } from '@/app/(dashboard)/_constants/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Service } from '@/types';
import { ServiceStatus } from '@/types';

type MetricCardFilter = ServiceStatus | 'ALL';

interface DashboardMetricCardsProps {
  services: Service[];
  statusFilters: ServiceStatus[];
  onMetricFilterChange: (filter: MetricCardFilter) => void;
}

export function getActiveMetricCard(statusFilters: ServiceStatus[]) {
  const hasAllStatuses =
    statusFilters.includes(DASHBOARD_SERVICE_STATUS.UP) &&
    statusFilters.includes(DASHBOARD_SERVICE_STATUS.SLOW) &&
    statusFilters.includes(DASHBOARD_SERVICE_STATUS.DOWN) &&
    statusFilters.includes(DASHBOARD_SERVICE_STATUS.RATE_LIMITED) &&
    statusFilters.includes(DASHBOARD_SERVICE_STATUS.PENDING);
  if (hasAllStatuses && statusFilters.length === 5) return 'ALL';
  if (statusFilters.length === 1) return statusFilters[0];
  return null;
}

export function DashboardMetricCards({
  services,
  statusFilters,
  onMetricFilterChange,
}: DashboardMetricCardsProps) {
  const isRestoring = useIsRestoring();

  const total = services.length;
  const up = services.filter(
    (s) => s.status === DASHBOARD_SERVICE_STATUS.UP,
  ).length;
  const slow = services.filter(
    (s) => s.status === DASHBOARD_SERVICE_STATUS.SLOW,
  ).length;
  const down = services.filter(
    (s) => s.status === DASHBOARD_SERVICE_STATUS.DOWN,
  ).length;
  const rateLimited = services.filter(
    (s) => s.status === DASHBOARD_SERVICE_STATUS.RATE_LIMITED,
  ).length;
  const activeMetricCard = getActiveMetricCard(statusFilters);

  const metrics: {
    label: string;
    value: number;
    filter: MetricCardFilter;
    icon: React.ReactNode;
  }[] = [
    {
      label: 'Total Services',
      value: total,
      filter: 'ALL',
      icon: <ServerIcon className="size-5 text-muted-foreground" />,
    },
    {
      label: 'Healthy',
      value: up,
      filter: DASHBOARD_SERVICE_STATUS.UP,
      icon: <CheckCircle2Icon className="size-5 text-green-500" />,
    },
    {
      label: 'Slow',
      value: slow,
      filter: DASHBOARD_SERVICE_STATUS.SLOW,
      icon: <AlertTriangleIcon className="size-5 text-amber-500" />,
    },
    {
      label: 'Down',
      value: down,
      filter: DASHBOARD_SERVICE_STATUS.DOWN,
      icon: <XCircleIcon className="size-5 text-destructive" />,
    },
    {
      label: 'Rate Limited',
      value: rateLimited,
      filter: DASHBOARD_SERVICE_STATUS.RATE_LIMITED,
      icon: <AlertTriangleIcon className="size-5 text-orange-500" />,
    },
  ];

  if (isRestoring) {
    return (
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {metrics.map(({ label, icon }) => (
          <div key={label} className="min-h-28 rounded-lg border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-muted-foreground">
                {label}
              </p>
              {icon}
            </div>
            <Skeleton className="mt-3 h-10 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
      {metrics.map(({ label, value, icon, filter }) => (
        <button
          key={label}
          type="button"
          onClick={() => onMetricFilterChange(filter)}
          className={cn(
            'min-h-28 cursor-pointer rounded-lg border bg-card p-5 text-left transition-colors hover:border-accent-foreground/25 hover:bg-accent',
            activeMetricCard === filter &&
              'border-accent-foreground/20 bg-accent',
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-muted-foreground">
              {label}
            </p>
            {icon}
          </div>
          <p className="mt-3 text-4xl font-semibold">{value}</p>
        </button>
      ))}
    </div>
  );
}
