import type { Teacher, Subject, Class, Room, TimeSlot, SchoolInfo, Schedule } from './types';

export const timeSlots: TimeSlot[] = [
  // Senin - Kamis & Sabtu
  { id: 'mon-1', day: 'Senin', start_time: '06:30', end_time: '07:30', session_number: 1 },
  { id: 'mon-2', day: 'Senin', start_time: '07:30', end_time: '08:10', session_number: 2 },
  { id: 'mon-3', day: 'Senin', start_time: '08:10', end_time: '08:55', session_number: 3 },
  { id: 'mon-4', day: 'Senin', start_time: '08:55', end_time: '09:35', session_number: 4 },
  { id: 'mon-5', day: 'Senin', start_time: '09:35', end_time: '10:20', session_number: 5 },
  { id: 'mon-break-1', day: 'Senin', start_time: '10:20', end_time: '10:35', session_number: null, is_break: true },
  { id: 'mon-6', day: 'Senin', start_time: '10:35', end_time: '11:15', session_number: 6 },
  { id: 'mon-7', day: 'Senin', start_time: '11:15', end_time: '12:00', session_number: 7 },
  { id: 'mon-8', day: 'Senin', start_time: '12:00', end_time: '12:40', session_number: 8 },
  { id: 'mon-9', day: 'Senin', start_time: '12:40', end_time: '13:25', session_number: 9 },
  // Simple copy for other days, can be customized
  ...['Selasa', 'Rabu', 'Kamis', 'Sabtu'].flatMap(day => [
    { id: `${day.toLowerCase()}-1`, day, start_time: '06:30', end_time: '07:30', session_number: 1 },
    { id: `${day.toLowerCase()}-2`, day, start_time: '07:30', end_time: '08:10', session_number: 2 },
    { id: `${day.toLowerCase()}-3`, day, start_time: '08:10', end_time: '08:55', session_number: 3 },
    { id: `${day.toLowerCase()}-4`, day, start_time: '08:55', end_time: '09:35', session_number: 4 },
    { id: `${day.toLowerCase()}-5`, day, start_time: '09:35', end_time: '10:20', session_number: 5 },
    { id: `${day.toLowerCase()}-break-1`, day, start_time: '10:20', end_time: '10:35', session_number: null, is_break: true },
    { id: `${day.toLowerCase()}-6`, day, start_time: '10:35', end_time: '11:15', session_number: 6 },
    { id: `${day.toLowerCase()}-7`, day, start_time: '11:15', end_time: '12:00', session_number: 7 },
    { id: `${day.toLowerCase()}-8`, day, start_time: '12:00', end_time: '12:40', session_number: 8 },
    { id: `${day.toLowerCase()}-9`, day, start_time: '12:40', end_time: '13:25', session_number: 9 },
  ]),
  // Jumat
  { id: 'jumat-1', day: 'Jumat', start_time: '06:30', end_time: '07:30', session_number: 1 },
  { id: 'jumat-2', day: 'Jumat', start_time: '07:30', end_time: '08:10', session_number: 2 },
  { id: 'jumat-3', day: 'Jumat', start_time: '08:10', end_time: '08:50', session_number: 3 },
  { id: 'jumat-4', day: 'Jumat', start_time: '08:50', end_time: '09:30', session_number: 4 },
  { id: 'jumat-break-1', day: 'Jumat', start_time: '09:30', end_time: '09:45', session_number: null, is_break: true },
  { id: 'jumat-5', day: 'Jumat', start_time: '09:45', end_time: '10:25', session_number: 5 },
  { id: 'jumat-6', day: 'Jumat', start_time: '10:25', end_time: '11:05', session_number: 6 },
];

export const teachers: Teacher[] = [
  { id: 't1', name: 'Budi Hartono', subject_ids: ['subj-1', 'subj-2'], availability_time_slots: timeSlots.map(t => t.id) },
  { id: 't2', name: 'Siti Aminah', subject_ids: ['subj-3', 'subj-4'], availability_time_slots: timeSlots.map(t => t.id) },
  { id: 't3', name: 'Agus Setiawan', subject_ids: ['subj-5', 'subj-6'], availability_time_slots: timeSlots.map(t => t.id) },
];

export const subjects: Subject[] = [
  { id: 'subj-1', name: 'Matematika', required_sessions_per_week: 4 },
  { id: 'subj-2', name: 'Fisika', required_sessions_per_week: 3 },
  { id: 'subj-3', name: 'Bahasa Indonesia', required_sessions_per_week: 4 },
  { id: 'subj-4', name: 'Bahasa Inggris', required_sessions_per_week: 3 },
  { id: 'subj-5', name: 'Praktik TKR', required_sessions_per_week: 6 },
  { id: 'subj-6', name: 'Praktik TSM', required_sessions_per_week: 6 },
];

export const classes: Class[] = [
  { id: 'c1', name: 'X TKR', department: 'Teknik Kendaraan Ringan' },
  { id: 'c2', name: 'X TSM', department: 'Teknik Sepeda Motor' },
  { id: 'c3', name: 'X RPL', department: 'Rekayasa Perangkat Lunak' },
];

export const rooms: Room[] = [
  { id: 'r1', name: 'Kelas 101', type: 'Teori' },
  { id: 'r2', name: 'Kelas 102', type: 'Teori' },
  { id: 'r3', name: 'Lab Komputer', type: 'Praktik' },
  { id: 'r4', name: 'Bengkel TKR', type: 'Praktik' },
  { id: 'r5', name: 'Bengkel TSM', type: 'Praktik' },
];

export const schoolInfo: SchoolInfo = {
  id: 'si1',
  academic_year: '2024/2025',
  semester: 'Ganjil',
  school_name: 'SMK Bisa Jaya',
};

// This will be populated by the AI
export const initialSchedules: Schedule[] = [];
