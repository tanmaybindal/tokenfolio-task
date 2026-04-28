import { Skeleton } from '@/components/ui/skeleton';

const COLUMN_WIDTHS = [36, 200, 80, 80, 120, 55, 100, 44];

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="flex items-center gap-4 border-b px-4 py-3">
        {COLUMN_WIDTHS.map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: w }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b px-4 py-3 last:border-0"
        >
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-7 w-7" />
        </div>
      ))}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <Skeleton className="h-4 w-44" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-8 w-10" />
          <Skeleton className="h-8 w-10" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    </div>
  );
}
