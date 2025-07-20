// src/components/schedule/printable-teacher-card.tsx
"use client";

import { useMemo } from 'react';
import Image from 'next/image';
import { ScheduleTable } from './schedule-table';
import type { Schedule, Teacher, Subject, Class, Room, TimeSlot, SchoolInfo } from "@/lib/types";
import { Badge } from '../ui/badge';

interface PrintableTeacherCardProps {
  teacher?: Teacher;
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

export function PrintableTeacherCard({ teacher, schedules, masterData, schoolInfo }: PrintableTeacherCardProps) {
  
  const today = useMemo(() => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);

  const teacherSubjects = useMemo(() => {
    if (!teacher) return [];
    return masterData.subjects.filter(s => teacher.subject_ids.includes(s.id));
  }, [teacher, masterData.subjects]);

  if (!teacher) {
    return (
        <div className="bg-white p-8 text-center">
            <p>Pilih seorang guru untuk mencetak kartu mengajarnya.</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-8 printable-schedule w-[800px]">
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
          <h1 className="text-xl font-bold uppercase tracking-wider">{schoolInfo.school_name}</h1>
          <p className="text-sm">{schoolInfo.address}</p>
        </div>
      </header>

      {/* Document Title */}
      <div className="text-center my-6">
        <h2 className="text-lg font-bold uppercase underline">JADWAL MENGAJAR GURU</h2>
        <p className="text-md">Tahun Ajaran {schoolInfo.academic_year} - Semester {schoolInfo.semester}</p>
      </div>

      {/* Teacher Info */}
      <div className='mb-4 text-sm'>
        <table className='w-auto'>
            <tbody>
                <tr>
                    <td className='pr-4 font-semibold'>Nama Guru</td>
                    <td className='pr-2'>:</td>
                    <td>{teacher.name}</td>
                </tr>
                <tr>
                    <td className='pr-4 font-semibold align-top'>Mata Pelajaran</td>
                    <td className='pr-2 align-top'>:</td>
                    <td className='flex flex-wrap gap-1'>
                        {teacherSubjects.map(s => <Badge key={s.id} variant="outline">{s.name}</Badge>)}
                    </td>
                </tr>
            </tbody>
        </table>
      </div>


      {/* Schedule Table */}
      <ScheduleTable
        schedules={schedules}
        filter={{ type: 'teacher', value: teacher.id }}
        masterData={masterData}
        isPrintMode={true}
        onAdd={() => {}} // onAdd is not needed for print
      />

      {/* Signature Section */}
      <footer className="mt-12 flex justify-between">
         <div className="text-center w-64">
          <p>&nbsp;</p>
          <p>Guru Bersangkutan,</p>
          <div className="h-20" /> {/* Spacer for signature */}
          <p className="font-bold underline">{teacher.name}</p>
        </div>
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
