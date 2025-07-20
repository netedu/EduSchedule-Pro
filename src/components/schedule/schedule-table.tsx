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
import { teachers, subjects, classes, rooms, timeSlots as allTimeSlots } from "@/lib/data";
import type { Schedule, TimeSlot } from "@/lib/types";

interface ScheduleTableProps {
  schedules: Schedule[];
  filter: { type: string; value: string };
}

export function ScheduleTable({ schedules, filter }: ScheduleTableProps) {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const dataMap = useMemo(() => ({
    teachers: new Map(teachers.map(t => [t.id, t])),
    subjects: new Map(subjects.map(s => [s.id, s])),
    classes: new Map(classes.map(c => [c.id, c])),
    rooms: new Map(rooms.map(r => [r.id, r])),
    timeSlots: new Map(allTimeSlots.map(ts => [ts.id, ts])),
  }), []);

  const scheduleGrid = useMemo(() => {
    const grid = new Map<string, Map<string, Schedule>>();
    for (const schedule of schedules) {
      if (!grid.has(schedule.class_id)) {
        grid.set(schedule.class_id, new Map());
      }
      grid.get(schedule.class_id)!.set(schedule.time_slot_id, schedule);
    }
    return grid;
  }, [schedules]);
  
  const columns = useMemo(() => {
    if (filter.value === 'all') return classes;
    return classes.filter(c => c.id === filter.value);
  }, [filter]);

  return (
    <div className="border rounded-lg w-full">
      <div className="relative w-full overflow-auto">
        {days.map(day => (
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
                {allTimeSlots.filter(ts => ts.day === day).map(ts => (
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
        ))}
      </div>
    </div>
  );
}
