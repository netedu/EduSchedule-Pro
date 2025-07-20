// src/components/master-data/master-data-view.tsx
"use client";

import { useState, useMemo, useEffect, useCallback, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./data-table";
import {
  getTeacherColumns,
  getSubjectColumns,
  getClassColumns,
  getRoomColumns,
  getTimeSlotColumns,
} from "./columns";
import type { Teacher, Subject, Class, Room, TimeSlot, SchoolInfo } from "@/lib/types";
import { MasterDataForm } from "./master-data-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  getDoc,
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { schoolInfo as defaultSchoolInfo, defaultTimeSlots } from "@/lib/data";
import { SchoolInfoForm } from "./school-info-form";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

type DataType = "school_info" | "teachers" | "subjects" | "classes" | "rooms" | "timeslots";
type Entity = Teacher | Subject | Class | Room | TimeSlot | SchoolInfo;

export function MasterDataView() {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const [loading, setLoading] = useState<Record<DataType, boolean>>({
    school_info: true,
    teachers: true,
    subjects: true,
    classes: true,
    rooms: true,
    timeslots: true,
  });

  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Entity | null>(null);
  const [activeTab, setActiveTab] = useState<DataType>("teachers");

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dataMap = useMemo(() => ({
    teachers: { data: teachers, setter: setTeachers, collectionName: "teachers" },
    subjects: { data: subjects, setter: setSubjects, collectionName: "subjects" },
    classes: { data: classes, setter: setClasses, collectionName: "classes" },
    rooms: { data: rooms, setter: setRooms, collectionName: "rooms" },
    timeslots: { data: timeSlots, setter: setTimeSlots, collectionName: "timeslots" },
    school_info: { data: schoolInfo, setter: setSchoolInfo, collectionName: "school_info" }
  }), [teachers, subjects, classes, rooms, timeSlots, schoolInfo]);

  const fetchData = useCallback(async (dataType: DataType) => {
    setLoading(prev => ({ ...prev, [dataType]: true }));
    try {
      if (dataType === 'school_info') {
        const docRef = doc(db, "school_info", defaultSchoolInfo.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSchoolInfo({ id: docSnap.id, ...docSnap.data() } as SchoolInfo);
        } else {
          // If not exists, set it from default data
          await setDoc(docRef, defaultSchoolInfo);
          setSchoolInfo(defaultSchoolInfo);
          console.log("Default school info created in Firestore.");
        }
      } else {
        const { collectionName, setter } = dataMap[dataType] as any;
        const querySnapshot = await getDocs(collection(db, collectionName));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        setter(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Gagal memuat data",
        description: `Tidak dapat mengambil data untuk ${dataType}.`,
      });
    } finally {
      setLoading(prev => ({ ...prev, [dataType]: false }));
    }
  }, [dataMap, toast]);

  useEffect(() => {
    Promise.all(Object.keys(dataMap).map(key => fetchData(key as DataType)));
  }, []);

  const handleAdd = () => {
    setEditingData(null);
    setIsFormOpen(true);
  };

  const handleEdit = (data: Entity) => {
    setEditingData(data);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsAlertOpen(true);
  };
  
  const confirmDelete = async () => {
    if (deletingId && activeTab !== 'school_info') {
      const { collectionName } = dataMap[activeTab];
      try {
        await deleteDoc(doc(db, collectionName, deletingId));
        toast({ title: "Data berhasil dihapus" });
        fetchData(activeTab); // Refresh data
      } catch (error) {
        toast({ variant: "destructive", title: "Gagal menghapus data" });
      }
    }
    setIsAlertOpen(false);
    setDeletingId(null);
  };

  const handleSave = async (data: any) => {
    if (activeTab === 'school_info') return; // Should be handled by handleSaveSchoolInfo
    const { collectionName } = dataMap[activeTab];
    let { id, ...dataToSave } = data;

    if (activeTab === 'subjects' && dataToSave.name && dataToSave.level_target) {
        dataToSave.name = `${dataToSave.name} - Tingkat ${dataToSave.level_target}`;
    }

    try {
      if (id) {
        const docRef = doc(db, collectionName, id);
        await setDoc(docRef, dataToSave, { merge: true });
        toast({ title: "Data berhasil diperbarui" });
      } else {
        await addDoc(collection(db, collectionName), dataToSave);
        toast({ title: "Data berhasil ditambahkan" });
      }
      fetchData(activeTab);
      setIsFormOpen(false);
    } catch (error) {
        console.error("Error saving data:", error);
        toast({ variant: "destructive", title: "Gagal menyimpan data" });
    }
  };

  const handleSaveSchoolInfo = async (data: SchoolInfo) => {
    setLoading(prev => ({ ...prev, school_info: true }));
    try {
      const docRef = doc(db, "school_info", data.id);
      await setDoc(docRef, data, { merge: true });
      setSchoolInfo(data);
      toast({ title: "Identitas sekolah berhasil diperbarui" });
    } catch (error) {
      console.error("Error saving school info:", error);
      toast({ variant: "destructive", title: "Gagal menyimpan identitas sekolah" });
    } finally {
      setLoading(prev => ({ ...prev, school_info: false }));
    }
  };

  const handleGenerateDefaultTimeSlots = () => {
    startTransition(async () => {
      try {
        // Check if any timeslots already exist
        const q = query(collection(db, "timeslots"), where("is_default", "==", true));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast({
            variant: "destructive",
            title: "Slot Waktu Default Sudah Ada",
            description: "Slot waktu default sudah dibuat sebelumnya.",
          });
          return;
        }

        const batch = writeBatch(db);
        defaultTimeSlots.forEach(slot => {
            const docRef = doc(collection(db, "timeslots"), slot.id);
            batch.set(docRef, {...slot, is_default: true});
        });
        await batch.commit();
        toast({ title: "Slot Waktu Default Berhasil Dibuat" });
        fetchData("timeslots");
      } catch (error) {
        console.error("Error generating default time slots:", error);
        toast({ variant: "destructive", title: "Gagal membuat slot waktu default" });
      }
    });
  };

  const columns = useMemo(
    () => ({
      teachers: getTeacherColumns(subjects, classes, timeSlots, handleEdit, handleDelete),
      subjects: getSubjectColumns(handleEdit, handleDelete),
      classes: getClassColumns(handleEdit, handleDelete),
      rooms: getRoomColumns(handleEdit, handleDelete),
      timeslots: getTimeSlotColumns(handleEdit, handleDelete),
    }),
    [subjects, classes, timeSlots]
  );
  
  const classLevels = useMemo(() => [...new Set(classes.map(c => c.level))], [classes]);

  const formFields: Record<string, any> = {
    teachers: [
      { name: "name", label: "Nama Guru", type: "text" },
      { name: "subject_ids", label: "Mata Pelajaran yang Diajar", type: "multiselect", options: subjects.map(s => ({ value: s.id, label: s.name })) },
      { name: "class_ids", label: "Kelas yang Diajar", type: "multiselect", options: classes.map(c => ({ value: c.id, label: c.name })) },
      { name: "available_time_slot_ids", label: "Ketersediaan Waktu", type: "multiselect", options: timeSlots.filter(ts => !ts.is_break).map(ts => ({ value: ts.id, label: `${ts.day}, ${ts.start_time}-${ts.end_time}` })) },
    ],
    subjects: [
      { name: "name", label: "Nama Mata Pelajaran", type: "text" },
      { name: "level_target", label: "Untuk Tingkat", type: "select", options: classLevels },
      { name: "required_sessions_per_week", label: "Sesi per Minggu", type: "number" },
    ],
    classes: [
      { name: "name", label: "Nama Kelas", type: "text" },
      { name: "level", label: "Tingkat", type: "select", options: ["X", "XI", "XII", "XIII"] },
      { name: "department", label: "Jurusan", type: "text" },
    ],
    rooms: [
        { name: "name", label: "Nama Ruangan", type: "text" },
        { name: "type", label: "Tipe Ruangan", type: "select", options: ["Teori", "Praktik"] },
    ],
    timeslots: [
        { name: "day", label: "Hari", type: "select", options: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] },
        { name: "start_time", label: "Waktu Mulai", type: "time" },
        { name: "end_time", label: "Waktu Selesai", type: "time" },
        { name: "session_number", label: "Jam Ke-", type: "number" },
        { name: "is_break", label: "Istirahat", type: "checkbox" },
    ],
  };

  const addLabels: Record<string, string> = {
    teachers: "Tambah Guru",
    subjects: "Tambah Mata Pelajaran",
    classes: "Tambah Kelas",
    rooms: "Tambah Ruangan",
    timeslots: "Tambah Slot Waktu",
  };
  
  const formTitle = editingData ? `Edit Data` : `Tambah Data`;

  const renderDataTable = (dataType: DataType) => {
    if (dataType === 'school_info') return null;
    const isLoading = loading[dataType];
    const { data } = dataMap[dataType] as any;
    const tableColumns = columns[dataType as keyof typeof columns] as any;
    
    if (isLoading) {
      return (
        <div className="space-y-4 py-4">
           <div className="flex items-center justify-end">
             <Skeleton className="h-10 w-32" />
           </div>
           <div className="rounded-md border">
            <Skeleton className="h-64 w-full" />
           </div>
        </div>
      );
    }
    
    return (
      <DataTable
        columns={tableColumns}
        data={data}
        onAdd={handleAdd}
        addLabel={addLabels[dataType]}
        showDefaultGenerator={dataType === 'timeslots'}
        onGenerateDefault={handleGenerateDefaultTimeSlots}
        isGeneratingDefault={isPending}
      />
    );
  };

  return (
    <>
      <Tabs
        defaultValue="teachers"
        className="w-full"
        onValueChange={(value) => setActiveTab(value as DataType)}
      >
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="teachers">Guru</TabsTrigger>
          <TabsTrigger value="subjects">Mata Pelajaran</TabsTrigger>
          <TabsTrigger value="classes">Kelas</TabsTrigger>
          <TabsTrigger value="rooms">Ruangan</TabsTrigger>
          <TabsTrigger value="timeslots">Slot Waktu</TabsTrigger>
          <TabsTrigger value="school_info">Identitas Sekolah</TabsTrigger>
        </TabsList>
        <TabsContent value="teachers">{renderDataTable("teachers")}</TabsContent>
        <TabsContent value="subjects">{renderDataTable("subjects")}</TabsContent>
        <TabsContent value="classes">{renderDataTable("classes")}</TabsContent>
        <TabsContent value="rooms">{renderDataTable("rooms")}</TabsContent>
        <TabsContent value="timeslots">{renderDataTable("timeslots")}</TabsContent>
        <TabsContent value="school_info">
          <SchoolInfoForm 
            schoolInfo={schoolInfo} 
            onSave={handleSaveSchoolInfo} 
            isLoading={loading.school_info} 
          />
        </TabsContent>
      </Tabs>

      {isFormOpen && activeTab !== 'school_info' && (
         <MasterDataForm
            key={activeTab + (editingData?.id || 'new')}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
            defaultValues={editingData}
            fields={formFields[activeTab]}
            title={formTitle}
         />
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data
              secara permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
