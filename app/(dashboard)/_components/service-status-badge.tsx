import { cn } from '@/lib/utils';
import { ServiceResponse } from '@/types';

import { formatStatusLabel } from './rate-limit-countdown';

const STATUS_BADGE: Record<string, string> = {
  UP: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800',
  SLOW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  DOWN: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
  RATE_LIMITED:
    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800',
  PENDING: 'bg-muted text-muted-foreground border-border',
};

const STATUS_DOT: Record<string, string> = {
  UP: 'bg-green-500',
  SLOW: 'bg-amber-500',
  DOWN: 'bg-red-500',
  RATE_LIMITED: 'bg-orange-500',
  PENDING: 'bg-muted-foreground',
};

export function getServiceStatusLabel(service: ServiceResponse): string {
  if (service.status === 'DOWN' && service.lastHttpStatus === 403) {
    return 'Forbidden';
  }
  return formatStatusLabel(service.status);
}

export function ServiceStatusBadge({ service }: { service: ServiceResponse }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
        STATUS_BADGE[service.status],
      )}
    >
      <span className={cn('size-1.5 rounded-full', STATUS_DOT[service.status])} />
      {getServiceStatusLabel(service)}
    </span>
  );
}
