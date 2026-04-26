'use client';

import { MoreHorizontalIcon } from 'lucide-react';

import { useRefreshServices } from '@/app/(dashboard)/_hooks/get-services';
import { formatLatencyParts } from '@/app/(dashboard)/_libs/format-latency-parts';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { SERVICE_ERROR_KIND, ServiceResponse } from '@/types';

import { HealthHistoryLine } from './health-history-line';
import { RateLimitCountdown } from './rate-limit-countdown';
import {
  deleteServiceDialogHandle,
  editServiceDialogHandle,
} from './service-dialog-handles';
import { ServiceStatusBadge } from './service-status-badge';

const STATUS_RING: Record<string, string> = {
  UP: 'ring-green-200 dark:ring-green-900',
  SLOW: 'ring-amber-200 dark:ring-amber-900',
  DOWN: 'ring-red-200 dark:ring-red-900',
  RATE_LIMITED: 'ring-orange-200 dark:ring-orange-900',
  PENDING: '',
};

const LATENCY_COLOR: Record<string, string> = {
  UP: 'text-foreground',
  SLOW: 'text-amber-500',
  DOWN: 'text-destructive',
  RATE_LIMITED: 'text-orange-600 dark:text-orange-400',
  PENDING: 'text-muted-foreground',
};

interface ServiceCardProps {
  service: ServiceResponse;
}

function getDownDisplay(service: ServiceResponse): {
  code: string;
  detail?: string;
} {
  if (service.status === 'RATE_LIMITED') {
    return { code: 'ERR', detail: 'Rate limited by provider' };
  }
  if (service.lastHttpStatus === 403) {
    return { code: 'ERR', detail: 'Access forbidden by provider' };
  }
  if (service.lastHttpStatus != null) {
    return {
      code: 'ERR',
      detail: `Request failed (${service.lastHttpStatus})`,
    };
  }
  if (service.lastErrorKind === SERVICE_ERROR_KIND.TIMEOUT) {
    return { code: 'ERR', detail: 'Timeout' };
  }
  if (service.lastErrorKind === SERVICE_ERROR_KIND.NETWORK) {
    return { code: 'ERR', detail: 'Network error' };
  }
  return { code: 'ERR', detail: undefined };
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { mutateAsync: refreshServices, isPending: refreshing } =
    useRefreshServices();

  function handleRefresh() {
    void (async () => {
      await refreshServices([service.id]);
    })();
  }

  const score = service.healthScore;
  const scoreColor =
    score == null || score >= 95
      ? 'text-muted-foreground'
      : score >= 85
        ? 'text-amber-500'
        : 'text-destructive';

  const isDown =
    service.status === 'DOWN' ||
    service.status === 'RATE_LIMITED' ||
    service.latencyMs == null;
  const latencyParts =
    !isDown && service.latencyMs != null
      ? formatLatencyParts(service.latencyMs)
      : null;
  const downDisplay = getDownDisplay(service);
  const metricLabel = isDown
    ? (downDisplay.detail ?? 'Service error')
    : 'Latency';

  return (
    <>
      <Card className={cn('overflow-hidden', STATUS_RING[service.status])}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate leading-tight font-semibold">
                {service.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {new URL(service.url).hostname}
              </p>
            </div>

            <ServiceStatusBadge service={service} />
          </div>
        </CardHeader>

        <CardContent className="flex h-full flex-col">
          <p className="mb-1 text-xs text-muted-foreground">{metricLabel}</p>
          <div className="flex items-center justify-between">
            {isDown ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-destructive">
                  {downDisplay.code}
                </span>
                {service.status === 'RATE_LIMITED' && (
                  <RateLimitCountdown
                    rateLimitedUntil={service.rateLimitedUntil}
                    className="text-xs text-muted-foreground"
                  />
                )}
              </div>
            ) : latencyParts ? (
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    'text-3xl font-bold',
                    LATENCY_COLOR[service.status],
                  )}
                >
                  {latencyParts.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {latencyParts.unit}
                </span>
              </div>
            ) : null}
            <HealthHistoryLine
              history={service.history ?? []}
              status={service.status}
            />
          </div>

          <div className="mt-auto flex items-center justify-between border-t pt-2">
            <p className="text-xs text-muted-foreground">Health Score (30d)</p>
            <div className="flex items-center gap-1">
              <p className={cn('text-xs font-semibold', scoreColor)}>
                {score != null ? `${score}%` : '—'}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mr-1.5 size-6 cursor-pointer text-muted-foreground"
                    />
                  }
                >
                  <MoreHorizontalIcon className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="cursor-pointer"
                    >
                      {refreshing && <Spinner className="mr-2 size-4" />}
                      Refresh
                    </DropdownMenuItem>
                    <DialogTrigger
                      handle={editServiceDialogHandle}
                      nativeButton={false}
                      payload={service}
                      render={<DropdownMenuItem className="cursor-pointer" />}
                    >
                      Edit
                    </DialogTrigger>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <AlertDialogTrigger
                      handle={deleteServiceDialogHandle}
                      nativeButton={false}
                      payload={service}
                      render={
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" />
                      }
                    >
                      Delete
                    </AlertDialogTrigger>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
