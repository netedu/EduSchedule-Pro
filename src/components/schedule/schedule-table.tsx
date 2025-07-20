
"use client";

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Schedule, Teacher, Subject, Class, Room, TimeSlot } from "@/lib/types";

interface ScheduleTableProps {
  schedules: Schedule[];
  filter: { type: string; value: string };
  masterData: {
    teachers: Teacher[];
    subjects: Subject[];
    classes: Class[];
    rooms: Room[];
    timeSlots: TimeSlot[];
  }
}

export function ScheduleTable({ schedules, filter, masterData }: ScheduleTableProps) {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const dataMap = useMemo(() => ({
    teachers: new Map(masterData.teachers.map(t => [t.id, t])),
    subjects: new Map(masterData.subjects.map(s => [s.id, s])),
    classes: new Map(masterData.classes.map(c => [c.id, c])),
    rooms: new Map(masterData.rooms.map(r => [r.id, r])),
    timeSlots: new Map(masterData.timeSlots.map(ts => [ts.id, ts])),
  }), [masterData]);

  const expandedSchedules = useMemo(() => {
    return schedules.flatMap(s => {
      const scheduledClass = dataMap.classes.get(s.class_id);
      if (scheduledClass?.is_combined && scheduledClass.combined_class_ids) {
        return scheduledClass.combined_class_ids.map(memberClassId => ({
          ...s,
          effective_class_id: memberClassId,
          original_class_id: s.class_id,
        }));
      }
      return [{ ...s, effective_class_id: s.class_id, original_class_id: s.class_id }];
    });
  }, [schedules, dataMap.classes]);

  const filteredSchedules = useMemo(() => {
    if (filter.value === 'all') return expandedSchedules;
    
    switch (filter.type) {
      case 'class':
        return expandedSchedules.filter(s => s.effective_class_id === filter.value);
      case 'teacher':
        return expandedSchedules.filter(s => s.teacher_id === filter.value);
      case 'room':
        return expandedSchedules.filter(s => s.room_id === filter.value);
      default:
        return expandedSchedules;
    }
  }, [expandedSchedules, filter]);

  const scheduleGrid = useMemo(() => {
    const grid = new Map<string, Map<string, Schedule>>(); // effective_class_id -> time_slot_id -> schedule
    for (const schedule of filteredSchedules) {
        if (!schedule.effective_class_id || !schedule.time_slot_id) continue;
        if (!grid.has(schedule.effective_class_id)) {
            grid.set(schedule.effective_class_id, new Map());
        }
        grid.get(schedule.effective_class_id)!.set(schedule.time_slot_id, schedule);
    }
    return grid;
  }, [filteredSchedules]);

  const columnsToDisplay = useMemo(() => {
    if (filter.type === 'class' && filter.value !== 'all') {
      return masterData.classes.filter(c => c.id === filter.value && !c.is_combined);
    }
    
    if ((filter.type === 'teacher' || filter.type === 'room') && filter.value !== 'all') {
      const relevantClassIds = new Set(filteredSchedules.map(s => s.effective_class_id));
      return masterData.classes
        .filter(c => relevantClassIds.has(c.id) && !c.is_combined)
        .sort((a,b) => a.name.localeCompare(b.name));
    }
    
    return masterData.classes
        .filter(c => !c.is_combined)
        .sort((a,b) => a.name.localeCompare(b.name));
  }, [filter, masterData.classes, filteredSchedules]);

  const timeSlotsByDay = useMemo(() => {
      const grouped: Record<string, TimeSlot[]> = {};
      for (const day of days) {
          grouped[day] = masterData.timeSlots
              .filter(ts => ts.day === day)
              .sort((a, b) => (a.session_number ?? Infinity) - (b.session_number ?? Infinity));
      }
      return grouped;
  }, [masterData.timeSlots, days]);
  
  if (schedules.length === 0 && masterData.timeSlots.every(ts => !ts.label && !ts.is_break)) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Belum ada jadwal. Silakan buat jadwal terlebih dahulu.</p>
      </div>
    );
  }
  
  if (columnsToDisplay.length === 0 && filter.value !== 'all') {
     return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Tidak ada jadwal untuk filter yang dipilih.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg w-full bg-card" id="schedule-table">
      <div className="relative w-full overflow-x-auto">
        {days.map(day => {
            const dayTimeSlots = timeSlotsByDay[day] || [];
            if (dayTimeSlots.length === 0) return null;

            const hasScheduleForDay = dayTimeSlots.some(ts => 
              ts.is_break || ts.label || columnsToDisplay.some(c => scheduleGrid.get(c.id)?.has(ts.id))
            );

            if (!hasScheduleForDay && filter.type !== 'class') return null;

            return (
              <div key={day} className="mb-8 last:mb-0">
                <h3 className="text-lg font-bold p-4 bg-muted/50 font-headline">{day}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] min-w-[100px] print:w-[70px]">Jam Ke-</TableHead>
                      <TableHead className="w-[150px] min-w-[150px] print:w-[100px]">Waktu</TableHead>
                      {columnsToDisplay.map(c => <TableHead key={c.id} className="min-w-[180px] print:min-w-[150px]">{c.name}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayTimeSlots.map(ts => {
                       const isActivityRow = ts.is_break || ts.label;
                       const hasContent = isActivityRow || columnsToDisplay.some(c => scheduleGrid.get(c.id)?.has(ts.id));
                       
                       if (!hasContent) return null;
                      
                       return (
                        <TableRow key={ts.id}>
                          <TableCell className="font-medium">{ts.session_number || ''}</TableCell>
                          <TableCell>{ts.start_time} - {ts.end_time}</TableCell>
                          {isActivityRow ? (
                            <TableCell colSpan={columnsToDisplay.length} className="text-center font-bold text-accent-foreground bg-accent/20">
                              {ts.label || 'ISTIRAHAT'}
                            </TableCell>
                          ) : (
                            columnsToDisplay.map(c => {
                              const schedule = scheduleGrid.get(c.id)?.get(ts.id);
                              if (!schedule) return <TableCell key={c.id}></TableCell>;

                              const subject = dataMap.subjects.get(schedule.subject_id);
                              const teacher = dataMap.teachers.get(schedule.teacher_id);
                              const room = dataMap.rooms.get(schedule.room_id);

                              return (
                                <TableCell key={c.id} className="p-1 align-top">
                                   <div className="p-2 rounded-md bg-primary/10 border border-primary/20 h-full flex flex-col justify-center">
                                      <p className="font-semibold">{subject?.name}</p>
                                      <p className="text-xs text-muted-foreground">{teacher?.name}</p>
                                      <Badge variant="secondary" className="mt-1 w-fit">{room?.name}</Badge>
                                    </div>
                                </TableCell>
                              );
                            })
                          )}
                        </TableRow>
                       )
                    })}
                  </TableBody>
                </Table>
              </div>
            )
        })}
      </div>
    </div>
  );
}
