// src/components/master-data/columns.tsx
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
import { Badge } from "@/components/ui/badge";

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
  subjectsData: Subject[],
  classesData: Class[],
  timeSlotsData: TimeSlot[],
  onEdit: (data: Teacher) => void,
  onDelete: (id: string) => void
): ColumnDef<Teacher>[] => {
  const subjectMap = new Map(subjectsData.map(s => [s.id, s.name]));
  const classMap = new Map(classesData.map(c => [c.id, c.name]));
  const timeSlotMap = new Map(timeSlotsData.map(ts => [ts.id, `${ts.day}, ${ts.start_time}-${ts.end_time}`]));

  return [
    selectionColumn,
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      accessorKey: "subject_ids",
      header: "Mata Pelajaran",
      cell: ({ row }) => {
        const subjectIds = row.original.subject_ids || [];
        return <div className="flex flex-wrap gap-1">
            {subjectIds.map(id => (
                <Badge key={id} variant="outline">{subjectMap.get(id) || `ID: ${id}`}</Badge>
            ))}
        </div>;
      },
    },
    {
      accessorKey: "class_ids",
      header: "Kelas",
      cell: ({ row }) => {
        const classIds = row.original.class_ids || [];
        return <div className="flex flex-wrap gap-1">
            {classIds.map(id => (
                <Badge key={id} variant="secondary">{classMap.get(id) || `ID: ${id}`}</Badge>
            ))}
        </div>;
      },
    },
    {
      accessorKey: "available_time_slot_ids",
      header: "Ketersediaan",
       cell: ({ row }) => {
        const timeSlotIds = row.original.available_time_slot_ids || [];
        if (timeSlotIds.length === 0) return <span>Tidak ditentukan</span>;
        return <span>{timeSlotIds.length} slot waktu</span>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}


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
    accessorKey: "level_target",
    header: "Untuk Tingkat",
    cell: ({ row }) => {
        return <Badge variant="outline">{row.original.level_target}</Badge>
    }
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
  classesData: Class[],
  onEdit: (data: Class) => void,
  onDelete: (id: string) => void
): ColumnDef<Class>[] => {
  const classMap = new Map(classesData.map(c => [c.id, c.name]));
  
  return [
    selectionColumn,
    {
      accessorKey: "name",
      header: "Nama Kelas",
    },
      {
      accessorKey: "level",
      header: "Tingkat",
      cell: ({ row }) => {
          return <Badge variant="secondary">{row.original.level}</Badge>
      }
    },
    {
      accessorKey: "department",
      header: "Jurusan",
    },
    {
      accessorKey: "is_combined",
      header: "Gabungan",
      cell: ({ row }) => {
        const isCombined = row.original.is_combined;
        const combinedIds = row.original.combined_class_ids || [];
        if (!isCombined) return <span>-</span>;
        return <div className="flex flex-wrap gap-1">
            {combinedIds.map(id => (
                <Badge key={id} variant="outline">{classMap.get(id) || `ID: ${id}`}</Badge>
            ))}
        </div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete} />,
    },
  ];
}

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
