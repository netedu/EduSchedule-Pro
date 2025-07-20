// src/components/schedule/delete-zone.tsx
"use client";

import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DeleteZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'delete-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-destructive/50 p-4 text-center text-destructive transition-colors',
        isOver && 'bg-destructive/20 border-solid'
      )}
    >
      <Trash2 className="h-8 w-8" />
      <p className="font-semibold">Area Hapus</p>
      <p className="text-sm">Tarik jadwal ke sini untuk menghapusnya.</p>
    </div>
  );
}
