// src/components/schedule/subject-palette.tsx
"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Subject } from '@/lib/types';
import { GripVertical } from 'lucide-react';

export function DraggableSubjectCard({ subject }: { subject: Subject }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `subject-${subject.id}`,
    data: {
      type: 'subject',
      item: subject,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <Card className="mb-2 bg-card/80 backdrop-blur-sm cursor-grab active:cursor-grabbing shadow-lg">
        <CardContent className="p-3 flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
                <p className="font-semibold text-sm">{subject.name}</p>
                <div className="flex gap-1 mt-1">
                    <Badge variant="outline">{subject.level_target}</Badge>
                    <Badge variant="secondary">{subject.group}</Badge>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SubjectPalette({ subjects }: { subjects: Subject[] }) {
  const sortedSubjects = [...subjects].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Palet Mata Pelajaran</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Tarik mata pelajaran dari sini ke sel jadwal yang kosong.
        </p>
        <ScrollArea className="h-[400px] pr-4">
          {sortedSubjects.map(subject => (
            <DraggableSubjectCard key={subject.id} subject={subject} />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
