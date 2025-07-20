"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Teacher, Subject, Class, Room, TimeSlot } from "@/lib/types";

// A generic actions component for all tables
const ActionsCell = ({
  row,
  onEdit,
  onDelete,
}: {
  row: any;
  onEdit: (data: any) => void;
  onDelete: (id: string) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem onClick={() => onEdit(row.original)}>
        Edit
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive"
        onClick={() => onDelete(row.original.id)}
      >
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const selectionColumn = {
  id: "select",
  header: ({ table }: { table: any }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }: { row: any }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
};

export const getTeacherColumns = (
  onEdit: (data: Teacher) => void,
  onDelete: (id: string) => void
): ColumnDef<Teacher>[] => [
  selectionColumn,
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "subject_ids",
    header: "Mata Pelajaran",
    cell: ({ row }) => {
      // In a real app, you'd fetch subject names from their IDs
      const subjects = row.original.subject_ids.join(', ');
      return <span>{subjects}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
];

export const getSubjectColumns = (
  onEdit: (data: Subject) => void,
  onDelete: (id: string) => void
): ColumnDef<Subject>[] => [
  selectionColumn,
  {
    accessorKey: "name",
    header: "Nama Mata Pelajaran",
  },
  {
    accessorKey: "required_sessions_per_week",
    header: "Sesi/Minggu",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
];

export const getClassColumns = (
  onEdit: (data: Class) => void,
  onDelete: (id: string) => void
): ColumnDef<Class>[] => [
  selectionColumn,
  {
    accessorKey: "name",
    header: "Nama Kelas",
  },
  {
    accessorKey: "department",
    header: "Jurusan",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
];

export const getRoomColumns = (
  onEdit: (data: Room) => void,
  onDelete: (id: string) => void
): ColumnDef<Room>[] => [
  selectionColumn,
  {
    accessorKey: "name",
    header: "Nama Ruangan",
  },
  {
    accessorKey: "type",
    header: "Tipe",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />,
  },
];

export const getTimeSlotColumns = (
  onEdit: (data: TimeSlot) => void,
  onDelete: (id: string) => void
): ColumnDef<TimeSlot>[] => [
    selectionColumn,
    { accessorKey: "day", header: "Hari" },
    { accessorKey: "start_time", header: "Waktu Mulai" },
    { accessorKey: "end_time", header: "Waktu Selesai" },
    { accessorKey: "session_number", header: "Jam Ke-" },
    { accessorKey: "is_break", header: "Istirahat",
        cell: ({row}) => <span>{row.original.is_break ? 'Ya' : 'Tidak'}</span>
    },
    { id: "actions", cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} /> },
];
