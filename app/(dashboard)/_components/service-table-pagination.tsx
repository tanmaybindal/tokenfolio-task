import { type Table as TanStackTable } from '@tanstack/react-table';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceResponse } from '@/types';

const PAGE_SIZES = [10, 25, 50] as const;
const VISIBLE_PAGE_RADIUS = 2;

interface ServiceTablePaginationProps {
  table: TanStackTable<ServiceResponse>;
}

export function ServiceTablePagination({ table }: ServiceTablePaginationProps) {
  'use no memo'; // table ref is stable; pagination state is internal (React Compiler)
  const totalRows = table.getCoreRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  const firstRow = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const lastRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(0, pageIndex - VISIBLE_PAGE_RADIUS);
    const end = Math.min(pageCount - 1, pageIndex + VISIBLE_PAGE_RADIUS);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [pageIndex, pageCount]);

  if (totalRows === 0) return null;

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Showing {firstRow} to {lastRow} of {totalRows} entries
      </p>
      <div className="flex items-center gap-1.5">
        <span className="mr-1 text-sm text-muted-foreground">
          Rows per page:
        </span>
        <Select
          value={pageSize}
          onValueChange={(value) =>
            table.setPagination({
              pageIndex: 0,
              pageSize: Number(value),
            })
          }
        >
          <SelectTrigger size="sm" className="mr-2 h-8 min-w-14 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" alignItemWithTrigger={false}>
            <SelectGroup>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={size} className="cursor-pointer">
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Prev
        </Button>
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={pageIndex === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => table.setPageIndex(page)}
            className="w-8 cursor-pointer"
          >
            {page + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
