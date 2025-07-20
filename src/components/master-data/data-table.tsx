// src/components/master-data/data-table.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onAdd: () => void;
  addLabel: string;
  onDeleteSelected: (ids: string[]) => void;
  showDefaultGenerator?: boolean;
  onGenerateDefault?: () => void;
  isGeneratingDefault?: boolean;
  generatorLabel?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onAdd,
  addLabel,
  onDeleteSelected,
  showDefaultGenerator = false,
  onGenerateDefault,
  isGeneratingDefault = false,
  generatorLabel = "Generate Default",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const selectedRows = table.getSelectedRowModel().rows;

  const handleDeleteSelected = () => {
    const selectedIds = selectedRows.map((row: Row<TData>) => (row.original as any).id);
    onDeleteSelected(selectedIds);
  };

  return (
    <div>
      <div className="flex items-center justify-end py-4 gap-2">
        {selectedRows.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus ({selectedRows.length})
          </Button>
        )}
        {showDefaultGenerator && (
          <Button variant="outline" onClick={onGenerateDefault} disabled={isGeneratingDefault}>
            {isGeneratingDefault && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {generatorLabel}
          </Button>
        )}
        <Button onClick={onAdd}>{addLabel}</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
