
"use client";

import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScheduleTable } from "./schedule-table";
import { PrintableSchedule } from "./printable-schedule";
import { PrintableTeacherCard } from "./printable-teacher-card";
import { AssignItemDialog } from './assign-item-dialog';
import { DraggableScheduleCard } from './schedule-card';

import { schoolInfo as defaultSchoolInfo } from "@/lib/data";
import type { Schedule, Teacher, Subject, Class, Room, TimeSlot, SchoolInfo } from "@/lib/types";
import { generateScheduleAction } from "@/actions/generate-schedule-action";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Printer } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, writeBatch, getDoc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { DeleteZone } from "./delete-zone";
import { Label } from "../ui/label";

type ActiveDragData = {
  type: "schedule";
  item: Schedule;
};

type PrintMode = "department" | "teacher";

export function ScheduleView() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filter, setFilter] = useState({ type: "class", value: "all" });

  const [printMode, setPrintMode] = useState<PrintMode>("department");
  const [printDepartment, setPrintDepartment] = useState("all");
  const [printTeacherId, setPrintTeacherId] = useState<string | null>(null);
  
  const [isGenerating, startGenerationTransition] = useTransition();
  const [isPrinting, startPrintingTransition] = useTransition();
  const { toast } = useToast();

  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const [activeDragItem, setActiveDragItem] = useState<ActiveDragData | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [pendingCell, setPendingCell] = useState<{ class_id: string; time_slot_id: string } | null>(null);


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
      
      const teacherData = teachersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Teacher[];
      setSchoolInfo(schoolInfoSnap.exists() ? { id: schoolInfoSnap.id, ...schoolInfoSnap.data() } as SchoolInfo : defaultSchoolInfo);
      setTeachers(teacherData);
      setSubjects(subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[]);
      setClasses(classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[]);
      setRooms(roomsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Room[]);
      setTimeSlots(timeSlotsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimeSlot[]);
      setSchedules(schedulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Schedule[]);

      if (teacherData.length > 0) {
        setPrintTeacherId(teacherData[0].id);
      }

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
      const printableElementId = printMode === 'department' 
        ? 'printable-schedule-container' 
        : 'printable-teacher-card-container';
        
      const scheduleElement = document.getElementById(printableElementId);
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
        scale: 2,
        useCORS: true,
        windowWidth: printMode === 'department' ? 1400 : 800,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const orientation = printMode === 'department' ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation: orientation,
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
      let position = -margin;
  
      if (orientation === 'portrait' && imgHeight < pdfHeight) {
          position = (pdfHeight - imgHeight) / 2;
          pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      } else {
          pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
      
          while (heightLeft > -pdfHeight) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }
      }

      let fileNameIdentifier = '';
      if (printMode === 'department') {
        fileNameIdentifier = printDepartment === 'all' ? 'semua_jurusan' : printDepartment.replace(/ /g, '_');
      } else if (printMode === 'teacher' && printTeacherId) {
        const teacher = teachers.find(t => t.id === printTeacherId);
        fileNameIdentifier = `guru_${teacher?.name.replace(/ /g, '_') || 'unknown'}`;
      }
      
      pdf.save(`jadwal-${schoolInfo.school_name.replace(/ /g, '_')}-${fileNameIdentifier}-${Date.now()}.pdf`);
    });
  };

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;
    const item = active.data.current?.item;
    if (type === 'schedule' && item) {
      setActiveDragItem({ type, item });
    }
  };

  // Function to check for schedule conflicts
  const hasConflict = (
    time_slot_id: string,
    teacher_id: string,
    class_id: string,
    room_id: string,
    exclude_schedule_id?: string
  ): string | null => {
    const conflictingSchedule = schedules.find(s => {
      // Exclude the schedule being moved
      if (s.id === exclude_schedule_id) return false;

      if (s.time_slot_id === time_slot_id) {
        if (s.teacher_id === teacher_id) return true;
        if (s.class_id === class_id) return true;
        // Check for conflicts in combined classes
        const scheduledClass = classes.find(c => c.id === s.class_id);
        if (scheduledClass?.is_combined && scheduledClass.combined_class_ids?.includes(class_id)) {
          return true;
        }
        if (s.room_id === room_id) return true;
      }
      return false;
    });
    
    if (conflictingSchedule) {
      const teacher = teachers.find(t => t.id === conflictingSchedule.teacher_id)?.name;
      const tClass = classes.find(c => c.id === conflictingSchedule.class_id)?.name;
      const subject = subjects.find(sub => sub.id === conflictingSchedule.subject_id)?.name;
      if (conflictingSchedule.teacher_id === teacher_id) return `Guru ${teacher} sudah mengajar di slot ini.`;
      if (conflictingSchedule.class_id === class_id) return `Kelas ${tClass} sudah ada jadwal ${subject} di slot ini.`;
      return `Konflik ditemukan di slot ini.`;
    }
    
    return null;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
  
    if (!over || !active.data.current?.item) return;
  
    const activeItem = active.data.current.item as Schedule;
  
    // Handle deletion
    if (over.id === 'delete-zone') {
      try {
        await deleteDoc(doc(db, "schedules", activeItem.id));
        setSchedules(prev => prev.filter(s => s.id !== activeItem.id));
        toast({ title: "Jadwal berhasil dihapus." });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Gagal menghapus jadwal.' });
      }
      return;
    }
  
    // Handle moving
    if (over.id.toString().startsWith('cell-')) {
      const [, class_id, time_slot_id] = over.id.toString().split('-');
      
      if (class_id === activeItem.class_id && time_slot_id === activeItem.time_slot_id) {
        return; // No change
      }

      // Check for conflicts before moving
      const conflictMessage = hasConflict(time_slot_id, activeItem.teacher_id, class_id, activeItem.room_id, activeItem.id);
      if (conflictMessage) {
        toast({ variant: 'destructive', title: 'Gagal Memindahkan Jadwal', description: conflictMessage });
        return;
      }

      const day = timeSlots.find(ts => ts.id === time_slot_id)?.day;
      if (!day) return;
  
      const updatedSchedule = { ...activeItem, class_id, time_slot_id, day };
      
      try {
        await setDoc(doc(db, "schedules", updatedSchedule.id), updatedSchedule);
        setSchedules(prev => prev.map(s => (s.id === updatedSchedule.id ? updatedSchedule : s)));
        toast({ title: 'Jadwal berhasil dipindahkan.' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Gagal memindahkan jadwal.' });
      }
    }
  };

  const handleAddItem = (class_id: string, time_slot_id: string) => {
    setPendingCell({ class_id, time_slot_id });
    setIsAssignDialogOpen(true);
  };

  const handleSaveNewItem = async (data: { subject_id: string; teacher_id: string; room_id: string }) => {
    if (!pendingCell) return;

    // Conflict check before adding
    const conflictMessage = hasConflict(pendingCell.time_slot_id, data.teacher_id, pendingCell.class_id, data.room_id);
    if (conflictMessage) {
      toast({ variant: 'destructive', title: 'Gagal Menambah Jadwal', description: conflictMessage });
      return;
    }

    const day = timeSlots.find(ts => ts.id === pendingCell.time_slot_id)?.day;
    if (!day) return;

    const newScheduleData: Omit<Schedule, 'id'> = {
      class_id: pendingCell.class_id,
      time_slot_id: pendingCell.time_slot_id,
      day: day,
      subject_id: data.subject_id,
      teacher_id: data.teacher_id,
      room_id: data.room_id,
    };
    
    try {
      const docRef = await addDoc(collection(db, "schedules"), newScheduleData);
      const finalSchedule = { ...newScheduleData, id: docRef.id };
      setSchedules(prev => [...prev, finalSchedule]);
      toast({ title: 'Jadwal berhasil ditambahkan.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Gagal menyimpan jadwal baru.' });
    }

    setIsAssignDialogOpen(false);
    setPendingCell(null);
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
  const isPrintDisabled = isPrinting || !hasSchedules || (printMode === 'teacher' && !printTeacherId);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
      <div className="flex flex-col gap-4">
        <div className="flex-1 space-y-4">
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
            <div className="flex items-end gap-2">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="print-mode">Mode Cetak</Label>
                    <Select
                        value={printMode}
                        onValueChange={(value) => setPrintMode(value as PrintMode)}
                        name="print-mode"
                    >
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Pilih Mode Cetak" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="department">Cetak per Jurusan</SelectItem>
                            <SelectItem value="teacher">Kartu Mengajar Guru</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {printMode === 'department' && (
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="department-print">Jurusan</Label>
                    <Select value={printDepartment} onValueChange={setPrintDepartment} name="department-print">
                      <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Pilih Jurusan Cetak" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all">Semua Jurusan</SelectItem>
                          {departmentOptions.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {printMode === 'teacher' && (
                  <div className="grid w-full items-center gap-1.5">
                     <Label htmlFor="teacher-print">Guru</Label>
                    <Select value={printTeacherId ?? ""} onValueChange={setPrintTeacherId} name="teacher-print">
                      <SelectTrigger className="w-full md:w-[180px]">
                          <SelectValue placeholder="Pilih Guru" />
                      </SelectTrigger>
                      <SelectContent>
                          {teachers.map((teacher) => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              
                <Button onClick={handlePrint} variant="outline" disabled={isPrintDisabled} className="w-auto">
                    {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                </Button>
                
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
              onAdd={handleAddItem}
            />
          </div>
          
          <div className="no-print mt-4">
             <DeleteZone />
          </div>

          <div className="print-container">
            <div id="printable-schedule-container">
              {schoolInfo && printMode === 'department' && (
                  <PrintableSchedule
                      schedules={schedules}
                      masterData={masterData}
                      schoolInfo={schoolInfo}
                      departmentFilter={printDepartment}
                  />
              )}
            </div>
            <div id="printable-teacher-card-container">
              {schoolInfo && printMode === 'teacher' && printTeacherId && (
                  <PrintableTeacherCard
                      teacher={teachers.find(t => t.id === printTeacherId)}
                      schedules={schedules}
                      masterData={masterData}
                      schoolInfo={schoolInfo}
                  />
              )}
            </div>
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeDragItem?.type === 'schedule' && <DraggableScheduleCard schedule={activeDragItem.item as Schedule} masterData={masterData} />}
      </DragOverlay>
       {pendingCell && (
        <AssignItemDialog
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          onSave={handleSaveNewItem}
          masterData={masterData}
          target={{ class_id: pendingCell.class_id }}
        />
      )}
    </DndContext>
  );
}
