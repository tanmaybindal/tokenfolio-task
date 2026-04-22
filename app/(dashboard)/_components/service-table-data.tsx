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

import { serviceTableColumns } from './service-table-columns';

interface ServiceTableDataProps {
  table: TanStackTable<ServiceResponse>;
}

export function ServiceTableData({ table }: ServiceTableDataProps) {
  'use no memo'; // table ref is stable; row model / selection live inside TanStack (React Compiler)
  {
    /*
          Rows scroll within this box. max-h uses dvh (dynamic viewport height) so
          it accounts for mobile browser chrome. The ~30rem offset covers everything
          above the table: navbar + headings + stats cards + toolbar + card header +
          pagination footer. min-h-32 guarantees at least a few rows are always visible.
        */
  }
  return (
    <div className="max-h-[calc(100dvh-30rem)] min-h-32 overflow-auto">
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
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
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
                colSpan={serviceTableColumns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No services found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
