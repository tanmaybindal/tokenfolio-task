'use client';

import { MoreHorizontalIcon } from 'lucide-react';
import { useState } from 'react';

import { useDeleteServices } from '@/app/(dashboard)/_hooks/delete-services';
import { useRefreshServices } from '@/app/(dashboard)/_hooks/refresh-services';
import { formatLatencyParts } from '@/app/(dashboard)/_libs/format-latency-parts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { ServiceResponse } from '@/types';

import { HealthHistoryLine } from './health-history-line';
import { ServiceDialog } from './service-dialog';

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

const STATUS_RING: Record<string, string> = {
  UP: 'ring-green-200 dark:ring-green-900',
  SLOW: 'ring-amber-200 dark:ring-amber-900',
  DOWN: 'ring-red-200 dark:ring-red-900',
  PENDING: '',
};

const LATENCY_COLOR: Record<string, string> = {
  UP: 'text-foreground',
  SLOW: 'text-amber-500',
  DOWN: 'text-destructive',
  PENDING: 'text-muted-foreground',
};

interface ServiceCardProps {
  service: ServiceResponse;
  onRefresh: () => void;
}

export function ServiceCard({ service, onRefresh }: ServiceCardProps) {
  const { mutateAsync: refreshService, isPending: refreshing } =
    useRefreshServices();
  const { mutateAsync: deleteServices, isPending: deleting } =
    useDeleteServices();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  async function handleRefresh() {
    await refreshService([service.id]);
    onRefresh();
  }

  async function handleDelete() {
    await deleteServices([service.id]);
    onRefresh();
  }

  const score = service.healthScore;
  const scoreColor =
    score == null || score >= 95
      ? 'text-muted-foreground'
      : score >= 85
        ? 'text-amber-500'
        : 'text-destructive';

  const isDown = service.status === 'DOWN' || service.latencyMs == null;
  const latencyParts =
    !isDown && service.latencyMs != null
      ? formatLatencyParts(service.latencyMs)
      : null;

  return (
    <>
      <Card className={cn('overflow-hidden', STATUS_RING[service.status])}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            {/* Name + hostname */}
            <div className="min-w-0 flex-1">
              <p className="truncate leading-tight font-semibold">
                {service.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {new URL(service.url).hostname}
              </p>
            </div>

            {/* Status badge */}
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
                STATUS_BADGE[service.status],
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  STATUS_DOT[service.status],
                )}
              />
              {service.status}
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {/* Latency row */}
          <p className="mb-1 text-xs text-muted-foreground">Latency</p>
          <div className="flex items-center justify-between">
            {isDown ? (
              <span className="text-2xl font-bold text-destructive">ERR</span>
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

          {/* Health score row + actions menu */}
          <div className="mt-2 flex items-center justify-between border-t pt-2">
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
                      disabled={refreshing || deleting}
                      className="cursor-pointer"
                    >
                      {refreshing && <Spinner className="mr-2 size-4" />}
                      Refresh
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setRenameOpen(true)}
                      className="cursor-pointer"
                    >
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      disabled={refreshing || deleting}
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {service.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the service and all its health history. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleDelete}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Deleting
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ServiceDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        mode="edit"
        service={service}
        onSuccess={onRefresh}
      />
    </>
  );
}
