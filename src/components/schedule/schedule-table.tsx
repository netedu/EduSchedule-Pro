
"use client";

import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { DraggableScheduleCard } from './schedule-card';

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
  isPrintMode?: boolean;
}

const ScheduleCell = ({ class_id, time_slot_id, children }: { class_id: string, time_slot_id: string, children: React.ReactNode }) => {
  const { setNodeRef } = useDroppable({
    id: `cell-${class_id}-${time_slot_id}`,
  });

  return (
    <TableCell ref={setNodeRef} className="p-1 align-top h-24">
      <div className="p-1 rounded-md h-full flex flex-col justify-center border-2 border-dashed border-transparent hover:border-primary/50 transition-colors">
        {children}
      </div>
    </TableCell>
  );
};


export function ScheduleTable({ schedules, filter, masterData, isPrintMode = false }: ScheduleTableProps) {
  const days = useMemo(() => ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], []);

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
    if (filter.value === 'all' || isPrintMode) return expandedSchedules;
    
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
  }, [expandedSchedules, filter, isPrintMode]);

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
    if (isPrintMode) {
      return masterData.classes
        .filter(c => !c.is_combined)
        .sort((a,b) => a.name.localeCompare(b.name));
    }
    
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
  }, [filter, masterData.classes, filteredSchedules, isPrintMode]);

  const timeSlotsByDay = useMemo(() => {
      const grouped: Record<string, TimeSlot[]> = {};
      for (const day of days) {
          grouped[day] = masterData.timeSlots
              .filter(ts => ts.day === day)
              .sort((a, b) => (a.session_number ?? Infinity) - (b.session_number ?? Infinity));
      }
      return grouped;
  }, [masterData.timeSlots, days]);
  
  if (isPrintMode) {
    // Simplified rendering for printing
    // ... logic for print mode ...
  }

  if (schedules.length === 0 && masterData.timeSlots.length === 0 && !isPrintMode) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Belum ada data slot waktu atau jadwal. Silakan buat terlebih dahulu.</p>
      </div>
    );
  }
  
  if (columnsToDisplay.length === 0 && filter.value !== 'all' && !isPrintMode) {
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
            if (dayTimeSlots.length === 0 && !isPrintMode) return null;

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
                      
                       return (
                        <TableRow key={ts.id}>
                          <TableCell className="font-medium">{ts.session_number || ''}</TableCell>
                          <TableCell>{ts.start_time} - {ts.end_time}</TableCell>
                          {isActivityRow ? (
                            <TableCell colSpan={columnsToDisplay.length || 1} className="text-center font-bold text-accent-foreground bg-accent/20">
                              {ts.label || 'ISTIRAHAT'}
                            </TableCell>
                          ) : (
                            columnsToDisplay.map(c => {
                              const schedule = scheduleGrid.get(c.id)?.get(ts.id);
                              return (
                                <ScheduleCell key={c.id} class_id={c.id} time_slot_id={ts.id}>
                                  {schedule && <DraggableScheduleCard schedule={schedule} masterData={masterData} />}
                                </ScheduleCell>
                              );
                            })
                          )}
                        </TableRow>
                       )
                    })}
                    {dayTimeSlots.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columnsToDisplay.length + 2} className="text-center text-muted-foreground">
                          Tidak ada slot waktu untuk hari ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )
        })}
      </div>
    </div>
  );
}
