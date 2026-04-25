import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

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

interface CardsPaginationDesktopProps {
  cardStart: number;
  cardPageSize: number;
  totalResults: number;
  cardPageIndex: number;
  cardTotalPages: number;
  onPageIndexChange: (updater: (prev: number) => number) => void;
  onPageSizeChange: (size: number) => void;
  onPageSelect: (page: number) => void;
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
  cardPageSize,
  totalResults,
  cardPageIndex,
  cardTotalPages,
  onPageIndexChange,
  onPageSizeChange,
  onPageSelect,
}: CardsPaginationDesktopProps) {
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
            onValueChange={(value) => onPageSizeChange(Number(value))}
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
            onClick={() => onPageIndexChange((p) => p - 1)}
            disabled={cardPageIndex === 0}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          {Array.from({ length: cardTotalPages }, (_, i) => (
            <Button
              key={i}
              variant={cardPageIndex === i ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageSelect(i)}
              className="size-8 cursor-pointer"
              aria-label={`Go to page ${i + 1}`}
              aria-current={cardPageIndex === i ? 'page' : undefined}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="size-8 cursor-pointer"
            onClick={() => onPageIndexChange((p) => p + 1)}
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
