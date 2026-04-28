'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useDashboardStateContext } from './dashboard-state-provider';

interface CardsPaginationDesktopProps {
  cardStart: number;
  totalResults: number;
  cardTotalPages: number;
}

function CardsSummary({
  cardStart,
  cardPageSize,
  total,
}: {
  cardStart: number;
  cardPageSize: number;
  total: number;
}) {
  return (
    <p className="text-sm text-muted-foreground">
      Showing {cardStart + 1} to {Math.min(cardStart + cardPageSize, total)} of{' '}
      {total} results
    </p>
  );
}

export function CardsPaginationDesktop({
  cardStart,
  totalResults,
  cardTotalPages,
}: CardsPaginationDesktopProps) {
  const {
    cardPageIndex,
    cardPageSize,
    handlePageIndexChange,
    handlePageSelect,
    handlePageSizeChange,
  } = useDashboardStateContext();

  const visiblePages = useMemo(() => {
    const radius = 2;
    const start = Math.max(0, cardPageIndex - radius);
    const end = Math.min(cardTotalPages - 1, cardPageIndex + radius);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [cardPageIndex, cardTotalPages]);

  return (
    <div className="mt-4 flex items-center justify-between">
      <CardsSummary
        cardStart={cardStart}
        cardPageSize={cardPageSize}
        total={totalResults}
      />
      <ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText className="bg-background">
            Cards per page:
          </ButtonGroupText>
          <Select
            value={cardPageSize}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 min-w-14 cursor-pointer px-2.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" alignItemWithTrigger={false}>
              <SelectGroup>
                {[8, 16, 32].map((size) => (
                  <SelectItem
                    key={size}
                    value={size}
                    className="cursor-pointer"
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => handlePageIndexChange((p) => p - 1)}
            disabled={cardPageIndex === 0}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={cardPageIndex === page ? 'default' : 'outline'}
              size="icon"
              onClick={() => handlePageSelect(page)}
              className="size-8 cursor-pointer"
              aria-label={`Go to page ${page + 1}`}
              aria-current={cardPageIndex === page ? 'page' : undefined}
            >
              {page + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => handlePageIndexChange((p) => p + 1)}
            disabled={cardPageIndex >= cardTotalPages - 1}
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    </div>
  );
}
