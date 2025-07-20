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
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { schoolInfo as defaultSchoolInfo, defaultTimeSlots, defaultSubjects, defaultClasses } from "@/lib/data";
import { SchoolInfoForm } from "./school-info-form";
import { Loader2 } from "lucide-react";

type DataType = "school_info" | "teachers" | "subjects" | "classes" | "rooms" | "timeslots";
type Entity = Teacher | Subject | Class | Room | TimeSlot | SchoolInfo;

const collectionNameMap: Record<Exclude<DataType, 'school_info'>, string> = {
  teachers: "teachers",
  subjects: "subjects",
  classes: "classes",
  rooms: "rooms",
  timeslots: "timeslots",
};

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
  const [isTimeSlotPending, startTimeSlotTransition] = useTransition();
  const [isSubjectPending, startSubjectTransition] = useTransition();
  const [isClassPending, startClassTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Entity | null>(null);
  const [activeTab, setActiveTab] = useState<DataType>("teachers");

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async (dataType: DataType) => {
    setLoading(prev => ({ ...prev, [dataType]: true }));
    try {
      if (dataType === 'school_info') {
        const docRef = doc(db, "school_info", defaultSchoolInfo.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSchoolInfo({ id: docSnap.id, ...docSnap.data() } as SchoolInfo);
        } else {
          // If it doesn't exist, create it with default data but don't overwrite if it does
          await setDoc(docRef, defaultSchoolInfo, { merge: true });
          setSchoolInfo(defaultSchoolInfo);
        }
      } else {
        const collectionName = collectionNameMap[dataType as Exclude<DataType, 'school_info'>];
        const querySnapshot = await getDocs(collection(db, collectionName));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        
        // This is not ideal, but it's a simple way to set state for different data types
        if (dataType === 'teachers') setTeachers(data);
        if (dataType === 'subjects') setSubjects(data);
        if (dataType === 'classes') setClasses(data);
        if (dataType === 'rooms') setRooms(data);
        if (dataType === 'timeslots') setTimeSlots(data);
      }
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
      toast({
        variant: "destructive",
        title: "Gagal memuat data",
        description: `Tidak dapat mengambil data untuk ${dataType}.`,
      });
    } finally {
      setLoading(prev => ({ ...prev, [dataType]: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  useEffect(() => {
    fetchData("school_info");
    fetchData("teachers");
    fetchData("subjects");
    fetchData("classes");
    fetchData("rooms");
    fetchData("timeslots");
  }, [fetchData]);


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
      const collectionName = collectionNameMap[activeTab as Exclude<DataType, 'school_info'>];
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
    if (activeTab === 'school_info') return;
    const collectionName = collectionNameMap[activeTab as Exclude<DataType, 'school_info'>];
    const { id, ...dataToSave } = data;

    try {
      if (id) {
        // Update existing document
        const docRef = doc(db, collectionName, id);
        await setDoc(docRef, dataToSave, { merge: true });
        toast({ title: "Data berhasil diperbarui" });
      } else {
        // Create new document
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
    const { id, ...dataToSave } = data;
    try {
      const docRef = doc(db, "school_info", id);
      await setDoc(docRef, dataToSave, { merge: true });
      setSchoolInfo(data); // Update local state with the full object including id
      toast({ title: "Identitas sekolah berhasil diperbarui" });
    } catch (error) {
      console.error("Error saving school info:", error);
      toast({ variant: "destructive", title: "Gagal menyimpan identitas sekolah" });
    } finally {
      setLoading(prev => ({ ...prev, school_info: false }));
    }
  };

  const handleGenerateDefault = useCallback(async (
    dataType: 'timeslots' | 'subjects' | 'classes',
    defaultData: any[],
    startTransition: React.TransitionStartFunction
  ) => {
    startTransition(async () => {
      const collectionName = collectionNameMap[dataType];
      try {
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast({
            variant: "destructive",
            title: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Sudah Ada`,
            description: `Hapus data yang ada sebelum membuat yang baru.`,
          });
          return;
        }

        const batch = writeBatch(db);
        defaultData.forEach(item => {
          const docRef = doc(collection(db, collectionName), item.id);
          const { id, ...itemData } = item;
          batch.set(docRef, itemData);
        });
        await batch.commit();
        toast({ title: `Data Default Berhasil Dibuat` });
        fetchData(dataType);
      } catch (error) {
        console.error(`Error generating default ${dataType}:`, error);
        toast({ variant: "destructive", title: `Gagal membuat data default` });
      }
    });
  }, [fetchData, toast]);

  const handleGenerateDefaultTimeSlots = () => handleGenerateDefault('timeslots', defaultTimeSlots, startTimeSlotTransition);
  const handleGenerateDefaultSubjects = () => handleGenerateDefault('subjects', defaultSubjects, startSubjectTransition);
  const handleGenerateDefaultClasses = () => handleGenerateDefault('classes', defaultClasses, startClassTransition);


  const columns = useMemo(
    () => ({
      teachers: getTeacherColumns(subjects, classes, timeSlots, handleEdit, handleDelete),
      subjects: getSubjectColumns(handleEdit, handleDelete),
      classes: getClassColumns(classes, handleEdit, handleDelete),
      rooms: getRoomColumns(handleEdit, handleDelete),
      timeslots: getTimeSlotColumns(handleEdit, handleDelete),
    }),
    [subjects, classes, timeSlots]
  );
  
  const classLevels = useMemo(() => ["X", "XI", "XII", "XIII"], []);
  const individualClasses = useMemo(() => classes.filter(c => !c.is_combined), [classes]);
  const subjectGroups = useMemo(() => ["Umum", "Kejuruan", "Mapel Pilihan", "Mulok"], []);


  const formFields: Record<string, any> = {
    teachers: [
      { name: "name", label: "Nama Guru", type: "text" },
      { name: "subject_ids", label: "Mata Pelajaran yang Diajar", type: "multiselect", options: subjects.map(s => ({ value: s.id, label: `${s.name} (${s.level_target})` })) },
      { name: "class_ids", label: "Kelas yang Diajar", type: "multiselect", options: classes.map(c => ({ value: c.id, label: c.name })) },
      { name: "available_time_slot_ids", label: "Ketersediaan Waktu", type: "multiselect", options: timeSlots.filter(ts => !ts.is_break).map(ts => ({ value: ts.id, label: `${ts.day}, ${ts.start_time}-${ts.end_time} (Jam ke-${ts.session_number})` })) },
    ],
    subjects: [
      { name: "name", label: "Nama Mata Pelajaran", type: "text" },
      { name: "group", label: "Kelompok Mata Pelajaran", type: "select", options: subjectGroups },
      { name: "level_target", label: "Untuk Tingkat", type: "select", options: classLevels },
      { name: "required_sessions_per_week", label: "Sesi per Minggu", type: "number" },
    ],
    classes: [
      { name: "name", label: "Nama Kelas", type: "text" },
      { name: "level", label: "Tingkat", type: "select", options: classLevels },
      { name: "department", label: "Jurusan", type: "text" },
      { name: "is_combined", label: "Kelas Gabungan?", type: "checkbox" },
      { name: "combined_class_ids", label: "Pilih Kelas untuk Digabung", type: "multiselect", options: individualClasses.map(c => ({ value: c.id, label: c.name })), dependsOn: 'is_combined' },
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

  const dataMap = useMemo(() => ({
    teachers,
    subjects,
    classes,
    rooms,
    timeslots: timeSlots,
  }), [teachers, subjects, classes, rooms, timeSlots]);

  const renderDataTable = (dataType: Exclude<DataType, 'school_info'>) => {
    const isLoading = loading[dataType];
    const data = dataMap[dataType];
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
    
    const showGenerator = dataType === 'timeslots' || dataType === 'subjects' || dataType === 'classes';
    let onGenerateDefault: (() => void) | undefined;
    let isGeneratingDefault: boolean | undefined;
    let generatorLabel: string | undefined;

    if (dataType === 'timeslots') {
        onGenerateDefault = handleGenerateDefaultTimeSlots;
        isGeneratingDefault = isTimeSlotPending;
        generatorLabel = 'Buat Slot Waktu Default';
    } else if (dataType === 'subjects') {
        onGenerateDefault = handleGenerateDefaultSubjects;
        isGeneratingDefault = isSubjectPending;
        generatorLabel = 'Buat Mata Pelajaran Default';
    } else if (dataType === 'classes') {
        onGenerateDefault = handleGenerateDefaultClasses;
        isGeneratingDefault = isClassPending;
        generatorLabel = 'Buat Kelas Default';
    }

    return (
      <DataTable
        columns={tableColumns}
        data={data}
        onAdd={handleAdd}
        addLabel={addLabels[dataType]}
        showDefaultGenerator={showGenerator}
        onGenerateDefault={onGenerateDefault}
        isGeneratingDefault={isGeneratingDefault}
        generatorLabel={generatorLabel}
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
