
"use client";

import { useState, useMemo, useTransition, useEffect, useCallback, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScheduleTable } from "./schedule-table";
import { PrintableSchedule } from "./printable-schedule"; // Import the new component
import { schoolInfo as defaultSchoolInfo } from "@/lib/data";
import type { Schedule, Teacher, Subject, Class, Room, TimeSlot, SchoolInfo } from "@/lib/types";
import { generateScheduleAction } from "@/actions/generate-schedule-action";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Printer } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, writeBatch, getDoc } from "firebase/firestore";

export function ScheduleView() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filter, setFilter] = useState({ type: "class", value: "all" });
  const [printDepartment, setPrintDepartment] = useState("all");
  const [isGenerating, startGenerationTransition] = useTransition();
  const [isPrinting, startPrintingTransition] = useTransition();
  const { toast } = useToast();

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const fetchAllMasterData = useCallback(async () => {
    try {
      const [
        schoolInfoSnap,
        teachersSnap,
        subjectsSnap,
        classesSnap,
        roomsSnap,
        timeSlotsSnap,
        schedulesSnap
      ] = await Promise.all([
        getDoc(doc(db, "school_info", defaultSchoolInfo.id)),
        getDocs(collection(db, "teachers")),
        getDocs(collection(db, "subjects")),
        getDocs(collection(db, "classes")),
        getDocs(collection(db, "rooms")),
        getDocs(collection(db, "timeslots")),
        getDocs(collection(db, "schedules"))
      ]);
      
      setSchoolInfo(schoolInfoSnap.exists() ? { id: schoolInfoSnap.id, ...schoolInfoSnap.data() } as SchoolInfo : defaultSchoolInfo);
      setTeachers(teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Teacher[]);
      setSubjects(subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[]);
      setClasses(classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[]);
      setRooms(roomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Room[]);
      setTimeSlots(timeSlotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeSlot[]);
      setSchedules(schedulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Schedule[]);
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
    startGenerationTransition(async () => {
       if (!schoolInfo || !teachers.length || !subjects.length || !classes.length || !rooms.length || !timeSlots.length) {
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
        const newSchedules = result.data;
        
        try {
          const batch = writeBatch(db);
          const existingSchedulesSnap = await getDocs(collection(db, "schedules"));
          existingSchedulesSnap.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          newSchedules.forEach(schedule => {
            const docRef = doc(collection(db, "schedules"), schedule.id);
            batch.set(docRef, schedule);
          });
          
          await batch.commit();

          setSchedules(newSchedules);
          toast({
            title: "Jadwal Berhasil Dibuat",
            description: "Jadwal baru telah berhasil dibuat dan disimpan.",
          });

        } catch (error) {
            console.error("Error saving schedules to Firebase:", error);
            toast({
              variant: "destructive",
              title: "Gagal Menyimpan Jadwal",
              description: "Jadwal berhasil dibuat AI, tapi gagal disimpan.",
            });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Membuat Jadwal",
          description: result.error || "Terjadi kesalahan saat membuat jadwal dari AI.",
        });
      }
    });
  };

 const handlePrint = () => {
    startPrintingTransition(async () => {
      const scheduleElement = document.getElementById('printable-schedule-container');
      if (!scheduleElement || !schoolInfo) {
        toast({
          variant: "destructive",
          title: "Gagal Mencetak",
          description: "Elemen jadwal yang akan dicetak tidak ditemukan.",
        });
        return;
      }
  
      toast({ title: "Mempersiapkan PDF...", description: "Mohon tunggu sebentar." });
  
      const canvas = await html2canvas(scheduleElement, { 
        scale: 2, // Increase scale for better quality
        useCORS: true,
        windowWidth: 1400 // Simulate a wider screen for layout
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 size in points: 595.28 x 841.89
      // We use landscape, so width is 841.89
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const margin = 40;
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;
  
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
  
      // This logic is simplified as we expect the content to fit one page now with CSS adjustments
      // But kept for safety
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
  
      const fileNameDepartment = printDepartment === 'all' ? 'semua_jurusan' : printDepartment.replace(/ /g, '_');
      pdf.save(`jadwal-${schoolInfo.school_name.replace(/ /g, '_')}-${fileNameDepartment}-${Date.now()}.pdf`);
    });
  };

  const filterOptions = useMemo(() => {
    if (filter.type === 'class') return classes.filter(c => !c.is_combined).sort((a,b) => a.name.localeCompare(b.name));
    if (filter.type === 'teacher') return teachers.sort((a,b) => a.name.localeCompare(b.name));
    if (filter.type === 'room') return rooms.sort((a,b) => a.name.localeCompare(b.name));
    return [];
  }, [filter.type, classes, teachers, rooms]);

  const departmentOptions = useMemo(() => {
    const departments = new Set(classes.map(c => c.department));
    return Array.from(departments).sort();
  }, [classes]);

  const masterData = { teachers, subjects, classes, rooms, timeSlots };
  const hasSchedules = schedules.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 no-print">
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
        <div className="flex gap-2">
            <div className="flex gap-2 items-center">
              <Select
                  value={printDepartment}
                  onValueChange={setPrintDepartment}
                >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Pilih Jurusan Cetak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jurusan</SelectItem>
                  {departmentOptions.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handlePrint} variant="outline" disabled={isPrinting || !hasSchedules} className="w-auto">
                {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleGenerateSchedule} disabled={isGenerating || !classes.length} className="w-full md:w-auto">
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Jadwal Otomatis
            </Button>
        </div>
      </div>
      
      <div className="no-print">
        <ScheduleTable
          schedules={schedules}
          filter={filter}
          masterData={masterData}
        />
      </div>

      {/* This element is specifically for printing, hidden using positioning */}
      <div className="print-container">
        <div id="printable-schedule-container">
          {schoolInfo && (
              <PrintableSchedule
                  schedules={schedules}
                  masterData={masterData}
                  schoolInfo={schoolInfo}
                  departmentFilter={printDepartment}
              />
          )}
        </div>
      </div>
    </div>
  );
}
