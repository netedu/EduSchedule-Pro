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
  const [isGenerating, startGenerationTransition] = useTransition();
  const [isPrinting, startPrintingTransition] = useTransition();
  const { toast } = useToast();

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const scheduleTableRef = useRef<HTMLDivElement>(null);
  
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
      const scheduleElement = document.getElementById('schedule-table-print');
      if (!scheduleElement || !schoolInfo) {
        toast({
          variant: "destructive",
          title: "Gagal Mencetak",
          description: "Komponen jadwal tidak ditemukan.",
        });
        return;
      }
  
      toast({ title: "Mempersiapkan PDF...", description: "Mohon tunggu sebentar." });
  
      // Temporarily make the print-only element visible for capturing
      scheduleElement.style.display = 'block';

      const canvas = await html2canvas(scheduleElement, { 
        scale: 2,
        logging: false,
        useCORS: true,
        onclone: (document) => {
          // This ensures styles are applied correctly in the cloned document
          const printStyle = document.createElement('style');
          printStyle.innerHTML = `
            @media print {
              .no-print { display: none !important; }
              body { -webkit-print-color-adjust: exact; color-adjust: exact; }
              table { width: 100%; border-collapse: collapse; font-size: 8pt; }
              th, td { border: 1px solid #ccc; padding: 4px; text-align: left; }
              th { background-color: #f2f2f2; }
            }
          `;
          document.head.appendChild(printStyle);
        }
      });
      
      // Hide the print-only element again
      scheduleElement.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(`JADWAL PELAJARAN ${schoolInfo.school_name.toUpperCase()}`, pdfWidth / 2, 30, { align: 'center'});
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Tahun Ajaran ${schoolInfo.academic_year} - Semester ${schoolInfo.semester}`, pdfWidth / 2, 45, { align: 'center'});

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 40; // with margin
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 60; // top margin
  
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 70);
  
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 40);
      }
  
      pdf.save(`jadwal-${schoolInfo.school_name.replace(/ /g, '_')}-${Date.now()}.pdf`);
    });
  };

  const filterOptions = useMemo(() => {
    if (filter.type === 'class') return classes.filter(c => !c.is_combined).sort((a,b) => a.name.localeCompare(b.name));
    if (filter.type === 'teacher') return teachers.sort((a,b) => a.name.localeCompare(b.name));
    if (filter.type === 'room') return rooms.sort((a,b) => a.name.localeCompare(b.name));
    return [];
  }, [filter.type, classes, teachers, rooms]);

  const masterData = { teachers, subjects, classes, rooms, timeSlots };
  const hasSchedules = schedules.length > 0 || timeSlots.some(ts => ts.label || ts.is_break);

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
            <Button onClick={handlePrint} variant="outline" disabled={isPrinting || !hasSchedules} className="w-full md:w-auto">
              {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
              Cetak
            </Button>
            <Button onClick={handleGenerateSchedule} disabled={isGenerating || !classes.length} className="w-full md:w-auto">
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Jadwal Otomatis
            </Button>
        </div>
      </div>
      
      {/* This element is for viewing in the browser */}
      <div ref={scheduleTableRef} className="no-print">
        <ScheduleTable
          schedules={schedules}
          filter={filter}
          masterData={masterData}
        />
      </div>

      {/* This element is specifically for printing, hidden by default */}
      <div id="schedule-table-print" className="hidden print-block">
         <ScheduleTable
          schedules={schedules}
          filter={{ type: 'class', value: 'all' }} // Always print all classes
          masterData={masterData}
        />
      </div>
    </div>
  );
}
