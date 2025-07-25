import type { SchoolInfo, Schedule, TimeSlot, Subject, Class } from './types';

// This file now primarily provides type exports and initial structures.
// The main data will be fetched from Firebase.

export const schoolInfo: SchoolInfo = {
  id: 'si1',
  academic_year: '2024/2025',
  semester: 'Ganjil',
  school_name: 'SMK Bisa Jaya',
  headmaster_name: 'Budi Santoso, S.Pd.',
  address: 'Jl. Pendidikan No. 1, Jakarta',
  logo_url: '',
};

// This will be populated by the AI
export const initialSchedules: Schedule[] = [];

// Default subjects for generation
export const defaultSubjects: Subject[] = [
  // Umum
  { id: 'sub-norm-01', name: 'Pendidikan Agama', required_sessions_per_week: 2, level_target: 'X', group: 'Umum' },
  { id: 'sub-norm-02', name: 'Pendidikan Agama', required_sessions_per_week: 2, level_target: 'XI', group: 'Umum' },
  { id: 'sub-norm-03', name: 'Pendidikan Agama', required_sessions_per_week: 2, level_target: 'XII', group: 'Umum' },
  { id: 'sub-norm-04', name: 'PKn', required_sessions_per_week: 2, level_target: 'X', group: 'Umum' },
  { id: 'sub-norm-05', name: 'PKn', required_sessions_per_week: 2, level_target: 'XI', group: 'Umum' },
  { id: 'sub-norm-06', name: 'PKn', required_sessions_per_week: 2, level_target: 'XII', group: 'Umum' },
  { id: 'sub-norm-07', name: 'Bahasa Indonesia', required_sessions_per_week: 4, level_target: 'X', group: 'Umum' },
  { id: 'sub-norm-08', name: 'Bahasa Indonesia', required_sessions_per_week: 4, level_target: 'XI', group: 'Umum' },
  { id: 'sub-norm-09', name: 'Bahasa Indonesia', required_sessions_per_week: 2, level_target: 'XII', group: 'Umum' },
  { id: 'sub-norm-10', name: 'Penjasorkes', required_sessions_per_week: 2, level_target: 'X', group: 'Umum' },
  { id: 'sub-norm-11', name: 'Penjasorkes', required_sessions_per_week: 2, level_target: 'XI', group: 'Umum' },
  { id: 'sub-norm-12', name: 'Seni Budaya', required_sessions_per_week: 2, level_target: 'X', group: 'Umum' },
  { id: 'sub-adap-01', name: 'Matematika', required_sessions_per_week: 4, level_target: 'X', group: 'Umum' },
  { id: 'sub-adap-02', name: 'Matematika', required_sessions_per_week: 4, level_target: 'XI', group: 'Umum' },
  { id: 'sub-adap-03', name: 'Matematika', required_sessions_per_week: 2, level_target: 'XII', group: 'Umum' },
  { id: 'sub-adap-04', name: 'Bahasa Inggris', required_sessions_per_week: 4, level_target: 'X', group: 'Umum' },
  { id: 'sub-adap-05', name: 'Bahasa Inggris', required_sessions_per_week: 4, level_target: 'XI', group: 'Umum' },
  { id: 'sub-adap-06', name: 'Bahasa Inggris', required_sessions_per_week: 2, level_target: 'XII', group: 'Umum' },
  { id: 'sub-adap-07', name: 'Fisika', required_sessions_per_week: 2, level_target: 'X', group: 'Umum' },
  { id: 'sub-adap-08', name: 'Kimia', required_sessions_per_week: 2, level_target: 'X', group: 'Umum' },
  { id: 'sub-adap-09', name: 'KKPI (Komputer)', required_sessions_per_week: 2, level_target: 'X', group: 'Umum' },
  
  // Kejuruan
  { id: 'sub-prod-01', name: 'Dasar-dasar Kejuruan TJKT', required_sessions_per_week: 6, level_target: 'X', group: 'Kejuruan' },
  { id: 'sub-prod-02', name: 'Jaringan Komputer', required_sessions_per_week: 8, level_target: 'XI', group: 'Kejuruan' },
  { id: 'sub-prod-03', name: 'Administrasi Sistem Jaringan', required_sessions_per_week: 8, level_target: 'XII', group: 'Kejuruan' },
  { id: 'sub-prod-04', name: 'Dasar-dasar Kejuruan DKV', required_sessions_per_week: 6, level_target: 'X', group: 'Kejuruan' },
  { id: 'sub-prod-05', name: 'Desain Grafis', required_sessions_per_week: 8, level_target: 'XI', group: 'Kejuruan' },
  { id: 'sub-prod-06', name: 'Animasi 2D & 3D', required_sessions_per_week: 8, level_target: 'XII', group: 'Kejuruan' },
];

// Default time slots for generation
export const defaultTimeSlots: TimeSlot[] = [
  // Senin
  { id: 'ts-sen-0', day: 'Senin', start_time: '06:30', end_time: '07:30', session_number: 0, is_break: false, label: 'UPACARA/PEMBINAAN'},
  { id: 'ts-sen-1', day: 'Senin', start_time: '07:30', end_time: '08:10', session_number: 1, is_break: false },
  { id: 'ts-sen-2', day: 'Senin', start_time: '08:10', end_time: '08:55', session_number: 2, is_break: false },
  { id: 'ts-sen-3', day: 'Senin', start_time: '08:55', end_time: '09:35', session_number: 3, is_break: false },
  { id: 'ts-sen-4', day: 'Senin', start_time: '09:35', end_time: '10:20', session_number: 4, is_break: false },
  { id: 'ts-sen-break1', day: 'Senin', start_time: '10:20', end_time: '10:35', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-sen-5', day: 'Senin', start_time: '10:35', end_time: '11:15', session_number: 5, is_break: false },
  { id: 'ts-sen-6', day: 'Senin', start_time: '11:15', end_time: '12:00', session_number: 6, is_break: false },
  { id: 'ts-sen-7', day: 'Senin', start_time: '12:00', end_time: '12:40', session_number: 7, is_break: false },
  { id: 'ts-sen-8', day: 'Senin', start_time: '12:40', end_time: '13:25', session_number: 8, is_break: false },
  
  // Selasa
  { id: 'ts-sel-0', day: 'Selasa', start_time: '06:30', end_time: '06:45', session_number: 0, is_break: false, label: 'DOA' },
  { id: 'ts-sel-1', day: 'Selasa', start_time: '06:45', end_time: '07:30', session_number: 1, is_break: false },
  { id: 'ts-sel-2', day: 'Selasa', start_time: '07:30', end_time: '08:15', session_number: 2, is_break: false },
  { id: 'ts-sel-3', day: 'Selasa', start_time: '08:15', end_time: '09:00', session_number: 3, is_break: false },
  { id: 'ts-sel-4', day: 'Selasa', start_time: '09:00', end_time: '09:45', session_number: 4, is_break: false },
  { id: 'ts-sel-break1', day: 'Selasa', start_time: '09:45', end_time: '10:00', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-sel-5', day: 'Selasa', start_time: '10:00', end_time: '10:45', session_number: 5, is_break: false },
  { id: 'ts-sel-6', day: 'Selasa', start_time: '10:45', end_time: '11:30', session_number: 6, is_break: false },
  { id: 'ts-sel-7', day: 'Selasa', start_time: '11:30', end_time: '12:15', session_number: 7, is_break: false },
  { id: 'ts-sel-8', day: 'Selasa', start_time: '12:15', end_time: '13:00', session_number: 8, is_break: false },
  
  // Rabu
  { id: 'ts-rab-0', day: 'Rabu', start_time: '06:30', end_time: '06:45', session_number: 0, is_break: false, label: 'DOA' },
  { id: 'ts-rab-1', day: 'Rabu', start_time: '06:45', end_time: '07:30', session_number: 1, is_break: false },
  { id: 'ts-rab-2', day: 'Rabu', start_time: '07:30', end_time: '08:15', session_number: 2, is_break: false },
  { id: 'ts-rab-3', day: 'Rabu', start_time: '08:15', end_time: '09:00', session_number: 3, is_break: false },
  { id: 'ts-rab-4', day: 'Rabu', start_time: '09:00', end_time: '09:45', session_number: 4, is_break: false },
  { id: 'ts-rab-break1', day: 'Rabu', start_time: '09:45', end_time: '10:00', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-rab-5', day: 'Rabu', start_time: '10:00', end_time: '10:45', session_number: 5, is_break: false },
  { id: 'ts-rab-6', day: 'Rabu', start_time: '10:45', end_time: '11:30', session_number: 6, is_break: false },
  { id: 'ts-rab-7', day: 'Rabu', start_time: '11:30', end_time: '12:15', session_number: 7, is_break: false },
  { id: 'ts-rab-8', day: 'Rabu', start_time: '12:15', end_time: '13:00', session_number: 8, is_break: false },
  
  // Kamis
  { id: 'ts-kam-0', day: 'Kamis', start_time: '06:30', end_time: '06:45', session_number: 0, is_break: false, label: 'DOA' },
  { id: 'ts-kam-1', day: 'Kamis', start_time: '06:45', end_time: '07:30', session_number: 1, is_break: false },
  { id: 'ts-kam-2', day: 'Kamis', start_time: '07:30', end_time: '08:15', session_number: 2, is_break: false },
  { id: 'ts-kam-3', day: 'Kamis', start_time: '08:15', end_time: '09:00', session_number: 3, is_break: false },
  { id: 'ts-kam-4', day: 'Kamis', start_time: '09:00', end_time: '09:45', session_number: 4, is_break: false },
  { id: 'ts-kam-break1', day: 'Kamis', start_time: '09:45', end_time: '10:00', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-kam-5', day: 'Kamis', start_time: '10:00', end_time: '10:45', session_number: 5, is_break: false },
  { id: 'ts-kam-6', day: 'Kamis', start_time: '10:45', end_time: '11:30', session_number: 6, is_break: false },
  { id: 'ts-kam-7', day: 'Kamis', start_time: '11:30', end_time: '12:15', session_number: 7, is_break: false },
  { id: 'ts-kam-8', day: 'Kamis', start_time: '12:15', end_time: '13:00', session_number: 8, is_break: false },

  // Jumat
  { id: 'ts-jum-0', day: 'Jumat', start_time: '06:30', end_time: '07:30', session_number: 0, is_break: false, label: 'ISTIGOSAH/SENAM' },
  { id: 'ts-jum-1', day: 'Jumat', start_time: '07:30', end_time: '08:00', session_number: 1, is_break: false },
  { id: 'ts-jum-2', day: 'Jumat', start_time: '08:00', end_time: '08:30', session_number: 2, is_break: false },
  { id: 'ts-jum-3', day: 'Jumat', start_time: '08:30', end_time: '09:00', session_number: 3, is_break: false },
  { id: 'ts-jum-4', day: 'Jumat', start_time: '09:00', end_time: '09:30', session_number: 4, is_break: false },
  { id: 'ts-jum-break1', day: 'Jumat', start_time: '09:30', end_time: '09:45', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-jum-5', day: 'Jumat', start_time: '09:45', end_time: '10:15', session_number: 5, is_break: false },
  { id: 'ts-jum-6', day: 'Jumat', start_time: '10:15', end_time: '10:45', session_number: 6, is_break: false },

  // Sabtu
  { id: 'ts-sab-0', day: 'Sabtu', start_time: '06:30', end_time: '06:45', session_number: 0, is_break: false, label: 'DOA' },
  { id: 'ts-sab-1', day: 'Sabtu', start_time: '06:45', end_time: '07:30', session_number: 1, is_break: false },
  { id: 'ts-sab-2', day: 'Sabtu', start_time: '07:30', end_time: '08:10', session_number: 2, is_break: false },
  { id: 'ts-sab-3', day: 'Sabtu', start_time: '08:10', end_time: '08:55', session_number: 3, is_break: false },
  { id: 'ts-sab-4', day: 'Sabtu', start_time: '08:55', end_time: '09:35', session_number: 4, is_break: false },
  { id: 'ts-sab-break1', day: 'Sabtu', start_time: '09:35', end_time: '09:50', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-sab-5', day: 'Sabtu', start_time: '09:50', end_time: '10:35', session_number: 5, is_break: false },
  { id: 'ts-sab-6', day: 'Sabtu', start_time: '10:35', end_time: '11:15', session_number: 6, is_break: false },
  { id: 'ts-sab-7', day: 'Sabtu', start_time: '11:15', end_time: '12:00', session_number: 7, is_break: false },
  { id: 'ts-sab-8', day: 'Sabtu', start_time: '12:00', end_time: '12:40', session_number: 8, is_break: false },
];

export const defaultClasses: Class[] = [
    // TAV
    { id: 'cls-tav-x', name: 'X TAV', level: 'X', department: 'Teknik Audio Video' },
    { id: 'cls-tav-xi', name: 'XI TAV', level: 'XI', department: 'Teknik Audio Video' },
    { id: 'cls-tav-xii', name: 'XII TAV', level: 'XII', department: 'Teknik Audio Video' },
    // AK
    { id: 'cls-ak-x', name: 'X AK', level: 'X', department: 'Akuntansi' },
    { id: 'cls-ak-xi', name: 'XI AK', level: 'XI', department: 'Akuntansi' },
    { id: 'cls-ak-xii', name: 'XII AK', level: 'XII', department: 'Akuntansi' },
    // TKR
    { id: 'cls-tkr-x', name: 'X TKR', level: 'X', department: 'Teknik Kendaraan Ringan' },
    { id: 'cls-tkr-xi', name: 'XI TKR', level: 'XI', department: 'Teknik Kendaraan Ringan' },
    { id: 'cls-tkr-xii', name: 'XII TKR', level: 'XII', department: 'Teknik Kendaraan Ringan' },
    // TKJ
    { id: 'cls-tkj-x', name: 'X TKJ', level: 'X', department: 'Teknik Komputer dan Jaringan' },
    { id: 'cls-tkj-xi', name: 'XI TKJ', level: 'XI', department: 'Teknik Komputer dan Jaringan' },
    { id: 'cls-tkj-xii', name: 'XII TKJ', level: 'XII', department: 'Teknik Komputer dan Jaringan' },
    // DKV
    { id: 'cls-dkv-x', name: 'X DKV', level: 'X', department: 'Desain Komunikasi Visual' },
    { id: 'cls-dkv-xi', name: 'XI DKV', level: 'XI', department: 'Desain Komunikasi Visual' },
    { id: 'cls-dkv-xii', name: 'XII DKV', level: 'XII', department: 'Desain Komunikasi Visual' },
    // TSM
    { id: 'cls-tsm-x', name: 'X TSM', level: 'X', department: 'Teknik Sepeda Motor' },
    { id: 'cls-tsm-xi', name: 'XI TSM', level: 'XI', department: 'Teknik Sepeda Motor' },
    { id: 'cls-tsm-xii', name: 'XII TSM', level: 'XII', department: 'Teknik Sepeda Motor' },
    // MP
    { id: 'cls-mp-x', name: 'X MP', level: 'X', department: 'Manajemen Perkantoran' },
    { id: 'cls-mp-xi', name: 'XI MP', level: 'XI', department: 'Manajemen Perkantoran' },
    { id: 'cls-mp-xii', name: 'XII MP', level: 'XII', department: 'Manajemen Perkantoran' },
];
