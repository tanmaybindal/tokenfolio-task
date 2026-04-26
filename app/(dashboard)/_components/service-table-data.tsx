import { flexRender, type Table as TanStackTable } from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ServiceResponse } from '@/types';

interface ServiceTableDataProps {
  table: TanStackTable<ServiceResponse>;
}

export function ServiceTableData({ table }: ServiceTableDataProps) {
  'use no memo'; // table ref is stable; row model / selection live inside TanStack (React Compiler)
  const rows = table.getRowModel().rows;
  const pageSize = table.getState().pagination.pageSize;
  const fillerRowCount = Math.max(0, pageSize - rows.length);
  const colSpan = table.getVisibleLeafColumns().length;

  return (
    <div className="max-h-[calc(100dvh-34rem)] min-h-104 overflow-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead
                  key={h.id}
                  className="sticky top-0 z-20 bg-card shadow-[inset_0_-1px_0_hsl(var(--border))]"
                >
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={colSpan}
                className="h-24 text-center text-muted-foreground"
              >
                No services found.
              </TableCell>
            </TableRow>
          )}
          {rows.length > 0 &&
            fillerRowCount > 0 &&
            Array.from({ length: fillerRowCount }, (_, i) => (
              <TableRow key={`filler-${i}`} aria-hidden>
                <TableCell colSpan={colSpan} className="h-[51px]" />
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
