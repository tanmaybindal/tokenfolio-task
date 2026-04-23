import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Skeleton className="mb-1 h-3 w-14" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-7 w-20" />
        </div>
        <div className="mt-1 flex items-center justify-between border-t pt-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="size-6 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
