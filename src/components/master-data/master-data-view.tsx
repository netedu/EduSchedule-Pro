"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  teachers as initialTeachers,
  subjects as initialSubjects,
  classes as initialClasses,
  rooms as initialRooms,
  timeSlots as initialTimeSlots,
} from "@/lib/data";
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

type DataType = "teachers" | "subjects" | "classes" | "rooms" | "timeslots";
type Entity = Teacher | Subject | Class | Room | TimeSlot;

export function MasterDataView() {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [classes, setClasses] = useState<Class[]>(initialClasses);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Entity | null>(null);
  const [activeTab, setActiveTab] = useState<DataType>("teachers");

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dataMap = {
    teachers: { data: teachers, setter: setTeachers },
    subjects: { data: subjects, setter: setSubjects },
    classes: { data: classes, setter: setClasses },
    rooms: { data: rooms, setter: setRooms },
    timeslots: { data: timeSlots, setter: setTimeSlots },
  };

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
  
  const confirmDelete = () => {
    if (deletingId) {
      const { setter } = dataMap[activeTab];
      setter((prevData: any[]) => prevData.filter((item) => item.id !== deletingId));
    }
    setIsAlertOpen(false);
    setDeletingId(null);
  };

  const handleSave = (data: Entity) => {
    const { data: currentData, setter } = dataMap[activeTab];
    if (editingData) {
      // Update existing
      setter(currentData.map((item) => (item.id === data.id ? data : item)) as any);
    } else {
      // Add new
      setter([...currentData, { ...data, id: `new-${Date.now()}` }] as any);
    }
    setIsFormOpen(false);
  };

  const columns = useMemo(
    () => ({
      teachers: getTeacherColumns(handleEdit, handleDelete),
      subjects: getSubjectColumns(handleEdit, handleDelete),
      classes: getClassColumns(handleEdit, handleDelete),
      rooms: getRoomColumns(handleEdit, handleDelete),
      timeslots: getTimeSlotColumns(handleEdit, handleDelete),
    }),
    []
  );

  const formFields = {
    teachers: [
      { name: "name", label: "Nama Guru", type: "text" },
      { name: "subject_ids", label: "ID Mata Pelajaran (dipisah koma)", type: "text" },
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
  
  const formTitle = editingData ? `Edit Data` : `Tambah ${addLabels[activeTab].split(' ')[1]}`;

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
        <TabsContent value="teachers">
          <DataTable
            columns={columns.teachers}
            data={teachers}
            onAdd={handleAdd}
            addLabel={addLabels.teachers}
          />
        </TabsContent>
        <TabsContent value="subjects">
          <DataTable
            columns={columns.subjects}
            data={subjects}
            onAdd={handleAdd}
            addLabel={addLabels.subjects}
          />
        </TabsContent>
        <TabsContent value="classes">
          <DataTable
            columns={columns.classes}
            data={classes}
            onAdd={handleAdd}
            addLabel={addLabels.classes}
          />
        </TabsContent>
        <TabsContent value="rooms">
          <DataTable
            columns={columns.rooms}
            data={rooms}
            onAdd={handleAdd}
            addLabel={addLabels.rooms}
          />
        </TabsContent>
        <TabsContent value="timeslots">
          <DataTable
            columns={columns.timeslots as any}
            data={timeSlots}
            onAdd={handleAdd}
            addLabel={addLabels.timeslots}
          />
        </TabsContent>
      </Tabs>

      <MasterDataForm
        key={activeTab + (editingData?.id || 'new')}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        defaultValues={editingData}
        fields={formFields[activeTab]}
        title={formTitle}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data
              secara permanen.
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
