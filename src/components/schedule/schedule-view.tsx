"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScheduleTable } from "./schedule-table";
import {
  teachers,
  subjects,
  classes,
  rooms,
  timeSlots,
  schoolInfo,
  initialSchedules,
} from "@/lib/data";
import type { Schedule } from "@/lib/types";
import { generateScheduleAction } from "@/actions/generate-schedule-action";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ScheduleView() {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [filter, setFilter] = useState({ type: "class", value: "all" });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleGenerateSchedule = () => {
    startTransition(async () => {
      const allData = { teachers, subjects, classes, rooms, timeSlots: timeSlots.filter(ts => !ts.is_break), schoolInfo };
      const result = await generateScheduleAction(allData);
      if (result.success && result.data) {
        // Map time_slot string from AI to time_slot_id
        const newSchedules = result.data.map(s => {
            const timeSlot = timeSlots.find(ts => ts.day === s.day && `${ts.start_time} – ${ts.end_time}` === s.time_slot);
            return {
                ...s,
                time_slot_id: timeSlot ? timeSlot.id : 'unknown'
            };
        });

        setSchedules(newSchedules);
        toast({
          title: "Jadwal Berhasil Dibuat",
          description: "Jadwal baru telah berhasil dibuat secara otomatis.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Membuat Jadwal",
          description: result.error || "Terjadi kesalahan saat membuat jadwal.",
        });
      }
    });
  };

  const filteredSchedules = useMemo(() => {
    if (filter.value === "all") {
      return schedules;
    }
    if (filter.type === "class") {
      return schedules.filter((s) => s.class_id === filter.value);
    }
    if (filter.type === "teacher") {
      return schedules.filter((s) => s.teacher_id === filter.value);
    }
    if (filter.type === "room") {
      return schedules.filter((s) => s.room_id === filter.value);
    }
    return schedules;
  }, [schedules, filter]);

  const filterOptions = useMemo(() => {
    if (filter.type === 'class') return classes;
    if (filter.type === 'teacher') return teachers;
    if (filter.type === 'room') return rooms;
    return [];
  }, [filter.type]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 flex-1">
          <Select
            value={filter.type}
            onValueChange={(value) => setFilter({ type: value, value: "all" })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter Berdasarkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class">Kelas</SelectItem>
              <SelectItem value="teacher">Guru</SelectItem>
              <SelectItem value="room">Ruang</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filter.value}
            onValueChange={(value) => setFilter({ ...filter, value })}
          >
            <SelectTrigger className="w-full md:w-[250px]">
              <SelectValue placeholder="Pilih..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {filterOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerateSchedule} disabled={isPending} className="w-full md:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Buat Jadwal Otomatis
        </Button>
      </div>
      <ScheduleTable
        schedules={schedules}
        filter={filter}
      />
    </div>
  );
}
