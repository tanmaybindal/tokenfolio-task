'use client';

import { ChevronLeftIcon, ChevronRightIcon, Rows3Icon } from 'lucide-react';

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

const PAGE_SIZES = [8, 16, 32];

interface CardsPaginationMobileProps {
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

export function CardsPaginationMobile({
  cardStart,
  totalResults,
  cardTotalPages,
}: CardsPaginationMobileProps) {
  const {
    cardPageIndex,
    cardPageSize,
    handlePageIndexChange,
    handlePageSizeChange,
  } = useDashboardStateContext();

  return (
    <div className="mt-4 flex flex-col gap-2">
      <CardsSummary
        cardStart={cardStart}
        cardPageSize={cardPageSize}
        total={totalResults}
      />
      <div className="flex items-center justify-between">
        <ButtonGroup>
          <ButtonGroupText className="bg-background">
            <Rows3Icon className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Items per page</span>
          </ButtonGroupText>
          <Select
            value={cardPageSize}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 min-w-14 cursor-pointer px-2.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectGroup>
                {PAGE_SIZES.map((size) => (
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
      </div>
    </div>
  );
}
