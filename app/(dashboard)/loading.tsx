import { CardSkeletonGrid } from '@/components/skeletons/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-16">
      <div className="mb-6">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="mt-2 h-4 w-80" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-5 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-9 w-12" />
          </div>
        ))}
      </div>
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-9 w-full max-w-xs" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="hidden h-9 w-20 sm:block" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
      <CardSkeletonGrid count={8} />
    </main>
  );
}
