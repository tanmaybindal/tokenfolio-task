import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ServerIcon,
  XCircleIcon,
} from 'lucide-react';

import { DASHBOARD_SERVICE_STATUS } from '@/app/(dashboard)/_constants/dashboard';
import { Service } from '@/types';

interface DashboardMetricCardsProps {
  services: Service[];
}

export function DashboardMetricCards({ services }: DashboardMetricCardsProps) {
  const total = services.length;
  const up = services.filter((s) => s.status === DASHBOARD_SERVICE_STATUS.UP).length;
  const slow = services.filter((s) => s.status === DASHBOARD_SERVICE_STATUS.SLOW).length;
  const down = services.filter((s) => s.status === DASHBOARD_SERVICE_STATUS.DOWN).length;

  const metrics = [
    {
      label: 'Total Services',
      value: total,
      icon: <ServerIcon className="size-5 text-muted-foreground" />,
    },
    {
      label: 'Healthy',
      value: up,
      icon: <CheckCircle2Icon className="size-5 text-green-500" />,
    },
    {
      label: 'Slow',
      value: slow,
      icon: <AlertTriangleIcon className="size-5 text-amber-500" />,
    },
    {
      label: 'Down',
      value: down,
      icon: <XCircleIcon className="size-5 text-destructive" />,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      {metrics.map(({ label, value, icon }) => (
        <div key={label} className="min-h-28 rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-muted-foreground">{label}</p>
            {icon}
          </div>
          <p className="mt-3 text-4xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}
