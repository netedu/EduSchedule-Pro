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

  const scheduleGrid = useMemo(() => {
    const grid = new Map<string, Map<string, Schedule>>();
    for (const schedule of schedules) {
        if (!schedule.class_id || !schedule.time_slot_id) continue;
        if (!grid.has(schedule.class_id)) {
            grid.set(schedule.class_id, new Map());
        }
        grid.get(schedule.class_id)!.set(schedule.time_slot_id, schedule);
    }
    return grid;
  }, [schedules]);
  
  const columns = useMemo(() => {
    if (filter.value === 'all') return masterData.classes;
    return masterData.classes.filter(c => c.id === filter.value);
  }, [filter, masterData.classes]);
  
  const timeSlotsByDay = useMemo(() => {
      const grouped = new Map<string, TimeSlot[]>();
      days.forEach(day => {
          grouped.set(day, masterData.timeSlots
              .filter(ts => ts.day === day)
              .sort((a, b) => (a.session_number || Infinity) - (b.session_number || Infinity))
          );
      });
      return grouped;
  }, [masterData.timeSlots]);

  return (
    <div className="border rounded-lg w-full">
      <div className="relative w-full overflow-auto">
        {days.map(day => {
            const dayTimeSlots = timeSlotsByDay.get(day) || [];
            if (dayTimeSlots.length === 0) return null;

            return (
              <div key={day} className="mb-8">
                <h3 className="text-lg font-bold p-4 bg-muted/50 font-headline">{day}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Jam Ke-</TableHead>
                      <TableHead className="w-[150px]">Waktu</TableHead>
                      {columns.map(c => <TableHead key={c.id}>{c.name}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayTimeSlots.map(ts => (
                      <TableRow key={ts.id}>
                        <TableCell className="font-medium">{ts.session_number || ''}</TableCell>
                        <TableCell>{ts.start_time} - {ts.end_time}</TableCell>
                        {ts.is_break ? (
                          <TableCell colSpan={columns.length} className="text-center font-bold text-accent-foreground bg-accent/20">
                            ISTIRAHAT
                          </TableCell>
                        ) : (
                          columns.map(c => {
                            const schedule = scheduleGrid.get(c.id)?.get(ts.id);
                            if (!schedule) return <TableCell key={c.id}></TableCell>;

                            const subject = dataMap.subjects.get(schedule.subject_id);
                            const teacher = dataMap.teachers.get(schedule.teacher_id);
                            const room = dataMap.rooms.get(schedule.room_id);

                            return (
                              <TableCell key={c.id} className="p-2">
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
        })}
      </div>
    </div>
  );
}
