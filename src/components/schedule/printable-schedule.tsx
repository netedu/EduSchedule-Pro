// src/components/schedule/printable-schedule.tsx
"use client";

import { useMemo } from 'react';
import Image from 'next/image';
import { ScheduleTable } from './schedule-table';
import type { Schedule, Teacher, Subject, Class, Room, TimeSlot, SchoolInfo } from "@/lib/types";

interface PrintableScheduleProps {
  schedules: Schedule[];
  masterData: {
    teachers: Teacher[];
    subjects: Subject[];
    classes: Class[];
    rooms: Room[];
    timeSlots: TimeSlot[];
  }
  schoolInfo: SchoolInfo;
}

export function PrintableSchedule({ schedules, masterData, schoolInfo }: PrintableScheduleProps) {
  
  const today = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  return (
    <div className="bg-white p-8 printable-schedule">
      {/* School Header */}
      <header className="flex items-center gap-4 border-b-4 border-black pb-4 mb-4">
        {schoolInfo.logo_url && (
          <Image
            src={schoolInfo.logo_url}
            alt="School Logo"
            width={80}
            height={80}
            className="object-contain"
            data-ai-hint="school logo"
          />
        )}
        <div className="text-center flex-grow">
          <h1 className="text-2xl font-bold uppercase tracking-wider">{schoolInfo.school_name}</h1>
          <p className="text-sm">{schoolInfo.address}</p>
        </div>
      </header>

      {/* Document Title */}
      <div className="text-center my-6">
        <h2 className="text-xl font-bold uppercase underline">Jadwal Pelajaran</h2>
        <p className="text-md">Tahun Ajaran {schoolInfo.academic_year} - Semester {schoolInfo.semester}</p>
      </div>

      {/* Schedule Table */}
      <ScheduleTable
        schedules={schedules}
        filter={{ type: 'class', value: 'all' }} // Always print all classes
        masterData={masterData}
      />

      {/* Signature Section */}
      <footer className="mt-12 flex justify-end">
        <div className="text-center w-64">
          <p>Jakarta, {today}</p>
          <p>Kepala Sekolah,</p>
          <div className="h-20" /> {/* Spacer for signature */}
          <p className="font-bold underline">{schoolInfo.headmaster_name}</p>
        </div>
      </footer>
    </div>
  );
}
