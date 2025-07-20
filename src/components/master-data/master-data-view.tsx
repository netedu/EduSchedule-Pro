import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { teachers, subjects, classes, rooms, timeSlots, schoolInfo } from "@/lib/data";
import { DataTable } from "./data-table";
import { teacherColumns, subjectColumns, classColumns, roomColumns, timeSlotColumns } from "./columns";

export function MasterDataView() {
  // In a real app, data fetching and mutation would happen here.
  // For this demo, we use static data and actions will be mocked.

  return (
    <Tabs defaultValue="teachers" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
        <TabsTrigger value="teachers">Guru</TabsTrigger>
        <TabsTrigger value="subjects">Mata Pelajaran</TabsTrigger>
        <TabsTrigger value="classes">Kelas</TabsTrigger>
        <TabsTrigger value="rooms">Ruangan</TabsTrigger>
        <TabsTrigger value="timeslots">Slot Waktu</TabsTrigger>
      </TabsList>
      <TabsContent value="teachers">
        <DataTable columns={teacherColumns} data={teachers} />
      </TabsContent>
      <TabsContent value="subjects">
        <DataTable columns={subjectColumns} data={subjects} />
      </TabsContent>
      <TabsContent value="classes">
        <DataTable columns={classColumns} data={classes} />
      </TabsContent>
      <TabsContent value="rooms">
        <DataTable columns={roomColumns} data={rooms} />
      </TabsContent>
       <TabsContent value="timeslots">
        <DataTable columns={timeSlotColumns} data={timeSlots} />
      </TabsContent>
    </Tabs>
  );
}
