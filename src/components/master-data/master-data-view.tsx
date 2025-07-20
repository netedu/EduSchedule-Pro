"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./data-table";
import {
  getTeacherColumns,
  getSubjectColumns,
  getClassColumns,
  getRoomColumns,
  getTimeSlotColumns,
} from "./columns";
import type { Teacher, Subject, Class, Room, TimeSlot } from "@/lib/types";
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
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type DataType = "teachers" | "subjects" | "classes" | "rooms" | "timeslots";
type Entity = Teacher | Subject | Class | Room | TimeSlot;

export function MasterDataView() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<Record<DataType, boolean>>({
    teachers: true,
    subjects: true,
    classes: true,
    rooms: true,
    timeslots: true,
  });

  const { toast } = useToast();

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
  }), [teachers, subjects, classes, rooms, timeSlots]);

  const fetchData = useCallback(async (dataType: DataType) => {
    setLoading(prev => ({ ...prev, [dataType]: true }));
    try {
      const { collectionName, setter } = dataMap[dataType];
      const querySnapshot = await getDocs(collection(db, collectionName));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setter(data);
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
    fetchData(activeTab);
  }, [activeTab, fetchData]);


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
    if (deletingId) {
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
    const { collectionName } = dataMap[activeTab];
    const { id, ...dataToSave } = data;
    try {
      if (id) { // Editing existing document
        const docRef = doc(db, collectionName, id);
        await setDoc(docRef, dataToSave, { merge: true });
        toast({ title: "Data berhasil diperbarui" });
      } else { // Adding new document
        await addDoc(collection(db, collectionName), dataToSave);
        toast({ title: "Data berhasil ditambahkan" });
      }
      fetchData(activeTab); // Refresh data
      setIsFormOpen(false);
    } catch (error) {
        console.error("Error saving data:", error);
        toast({ variant: "destructive", title: "Gagal menyimpan data" });
    }
  };

  const columns = useMemo(
    () => ({
      teachers: getTeacherColumns(handleEdit, handleDelete),
      subjects: getSubjectColumns(handleEdit, handleDelete),
      classes: getClassColumns(handleEdit, handleDelete),
      rooms: getRoomColumns(handleEdit, handleDelete),
      timeslots: getTimeSlotColumns(handleEdit, handleDelete),
    }),
    [] // Dependencies are stable
  );

  const formFields = {
    teachers: [
      { name: "name", label: "Nama Guru", type: "text" },
      { name: "subject_ids", label: "ID Mata Pelajaran (dipisah koma)", type: "text" },
      // Availability can be complex, skipping for now
    ],
    subjects: [
      { name: "name", label: "Nama Mata Pelajaran", type: "text" },
      { name: "required_sessions_per_week", label: "Sesi per Minggu", type: "number" },
    ],
    classes: [
      { name: "name", label: "Nama Kelas", type: "text" },
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

  const addLabels = {
    teachers: "Tambah Guru",
    subjects: "Tambah Mata Pelajaran",
    classes: "Tambah Kelas",
    rooms: "Tambah Ruangan",
    timeslots: "Tambah Slot Waktu",
  };
  
  const formTitle = editingData ? `Edit Data` : `Tambah Data`;

  const renderDataTable = (dataType: DataType) => {
    const isLoading = loading[dataType];
    const { data } = dataMap[dataType];
    const tableColumns = columns[dataType] as any;
    
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
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="teachers">Guru</TabsTrigger>
          <TabsTrigger value="subjects">Mata Pelajaran</TabsTrigger>
          <TabsTrigger value="classes">Kelas</TabsTrigger>
          <TabsTrigger value="rooms">Ruangan</TabsTrigger>
          <TabsTrigger value="timeslots">Slot Waktu</TabsTrigger>
        </TabsList>
        <TabsContent value="teachers">{renderDataTable("teachers")}</TabsContent>
        <TabsContent value="subjects">{renderDataTable("subjects")}</TabsContent>
        <TabsContent value="classes">{renderDataTable("classes")}</TabsContent>
        <TabsContent value="rooms">{renderDataTable("rooms")}</TabsContent>
        <TabsContent value="timeslots">{renderDataTable("timeslots")}</TabsContent>
      </Tabs>

      {isFormOpen && (
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
