import Link from "next/link";
import { FileQuestionMarkIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-16">
      <Empty className="min-h-[50vh] border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionMarkIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            We could not find a page at this address. It may have been moved or
            the link might be incorrect.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-wrap items-center justify-center gap-2">
          <Link href="/" className={cn(buttonVariants())}>
            Back to dashboard
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
