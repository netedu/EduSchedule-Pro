"use client";

import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScheduleTable } from "./schedule-table";
import { schoolInfo, initialSchedules } from "@/lib/data";
import type { Schedule, Teacher, Subject, Class, Room, TimeSlot } from "@/lib/types";
import { generateScheduleAction } from "@/actions/generate-schedule-action";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export function ScheduleView() {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [filter, setFilter] = useState({ type: "class", value: "all" });
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const fetchAllMasterData = useCallback(async () => {
    try {
      const [
        teachersSnap,
        subjectsSnap,
        classesSnap,
        roomsSnap,
        timeSlotsSnap
      ] = await Promise.all([
        getDocs(collection(db, "teachers")),
        getDocs(collection(db, "subjects")),
        getDocs(collection(db, "classes")),
        getDocs(collection(db, "rooms")),
        getDocs(collection(db, "timeslots"))
      ]);
      
      setTeachers(teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Teacher[]);
      setSubjects(subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[]);
      setClasses(classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[]);
      setRooms(roomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Room[]);
      setTimeSlots(timeSlotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeSlot[]);
    } catch (error) {
      console.error("Error fetching master data for schedule view:", error);
      toast({
        variant: "destructive",
        title: "Gagal memuat data master",
        description: "Beberapa data mungkin tidak tampil dengan benar.",
      });
    }
  }, [toast]);
  
  useEffect(() => {
    fetchAllMasterData();
  }, [fetchAllMasterData]);

  const handleGenerateSchedule = () => {
    startTransition(async () => {
       if (!teachers.length || !subjects.length || !classes.length || !rooms.length || !timeSlots.length) {
          toast({
            variant: "destructive",
            title: "Data Master Tidak Lengkap",
            description: "Pastikan semua data master (guru, pelajaran, kelas, dll.) sudah terisi sebelum membuat jadwal.",
          });
          return;
        }

      const allData = { teachers, subjects, classes, rooms, timeSlots: timeSlots.filter(ts => !ts.is_break), schoolInfo };
      const result = await generateScheduleAction(allData);
      
      if (result.success && result.data) {
        const newSchedules = result.data.map(s => {
          // The AI might return a time_slot string. We need to find the corresponding ID.
          // This logic is simplified; a more robust solution would be needed for complex cases.
          const matchingTimeSlot = timeSlots.find(ts => 
             ts.day === s.day && s.time_slot_id === ts.id
          );
          return {
              ...s,
              time_slot_id: matchingTimeSlot ? matchingTimeSlot.id : s.time_slot_id
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
          description: result.error || "Terjadi kesalahan saat membuat jadwal dari AI.",
        });
      }
    });
  };

  const filterOptions = useMemo(() => {
    if (filter.type === 'class') return classes;
    if (filter.type === 'teacher') return teachers;
    if (filter.type === 'room') return rooms;
    return [];
  }, [filter.type, classes, teachers, rooms]);

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
        <Button onClick={handleGenerateSchedule} disabled={isPending || !classes.length} className="w-full md:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Buat Jadwal Otomatis
        </Button>
      </div>
      <ScheduleTable
        schedules={schedules}
        filter={filter}
        masterData={{ teachers, subjects, classes, rooms, timeSlots }}
      />
    </div>
  );
}
