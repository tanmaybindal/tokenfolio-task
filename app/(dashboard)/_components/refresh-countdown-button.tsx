'use client';

import { RefreshCwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DASHBOARD_REFETCH_INTERVAL_MS } from '@/app/(dashboard)/_constants/dashboard';
import { useGetServices } from '@/app/(dashboard)/_hooks/get-services';

import { Button } from '../../../components/ui/button';

export function RefreshCountdownButton() {
  const { dataUpdatedAt, isFetching: isRefreshing, refetch } = useGetServices();
  const [now, setNow] = useState(dataUpdatedAt);

  useEffect(() => {
    const tick = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const elapsed = Math.floor((now - dataUpdatedAt) / 1000);
  const countdown = Math.max(
    0,
    Math.round(DASHBOARD_REFETCH_INTERVAL_MS / 1000) - elapsed,
  );

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => void refetch()}
      disabled={isRefreshing}
      className="cursor-pointer text-muted-foreground max-lg:px-2.5"
      aria-label={isRefreshing ? 'Refreshing services' : 'Refresh services'}
    >
      <RefreshCwIcon
        className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
      />
      <span className="hidden lg:inline">
        {isRefreshing ? (
          'Refreshing'
        ) : (
          <>
            Next refresh in{' '}
            <span className="inline-block min-w-[2ch] text-center tabular-nums">
              {countdown}s
            </span>
          </>
        )}
      </span>
    </Button>
  );
}
