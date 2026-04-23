"use client";

import { useEffect } from "react";
import { AlertTriangleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-16">
      <Empty className="min-h-[50vh] border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangleIcon />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            The dashboard could not load. You can try again, or refresh the page
            if the problem continues.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
