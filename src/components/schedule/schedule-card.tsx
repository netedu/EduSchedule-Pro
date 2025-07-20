// src/components/schedule/schedule-card.tsx
"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from "@/components/ui/badge";
import type { Schedule, Teacher, Subject, Class, Room, TimeSlot } from "@/lib/types";

interface ScheduleCardProps {
    schedule: Schedule;
    masterData: {
      teachers: Teacher[];
      subjects: Subject[];
      classes: Class[];
      rooms: Room[];
      timeSlots: TimeSlot[];
    }
}

export function DraggableScheduleCard({ schedule, masterData }: ScheduleCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `schedule-${schedule.id}`,
    data: {
      type: 'schedule',
      item: schedule,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const subject = masterData.subjects.find(s => s.id === schedule.subject_id);
  const teacher = masterData.teachers.find(t => t.id === schedule.teacher_id);
  const room = masterData.rooms.find(r => r.id === schedule.room_id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 rounded-md bg-primary/10 border border-primary/20 h-full flex flex-col justify-center cursor-grab active:cursor-grabbing touch-none"
    >
       <p className="font-semibold">{subject?.name}</p>
       <p className="text-xs text-muted-foreground">{teacher?.name}</p>
       <Badge variant="secondary" className="mt-1 w-fit">{room?.name}</Badge>
     </div>
  );
}
