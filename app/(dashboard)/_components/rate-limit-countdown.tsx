'use client';

import { useEffect, useState } from 'react';

export function formatStatusLabel(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function RateLimitCountdown({
  rateLimitedUntil,
  className,
}: {
  rateLimitedUntil?: string | null;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!rateLimitedUntil) return;

    const updateNow = () => setNow(Date.now());
    const firstTick = setTimeout(updateNow, 0);
    const timer = setInterval(updateNow, 1000);
    return () => {
      clearTimeout(firstTick);
      clearInterval(timer);
    };
  }, [rateLimitedUntil]);

  if (!rateLimitedUntil) return null;
  if (now == null) return null;

  const remainingMs = new Date(rateLimitedUntil).getTime() - now;
  if (remainingMs <= 0) return null;

  return <span className={className}>Retry in {formatRemaining(remainingMs)}</span>;
}
