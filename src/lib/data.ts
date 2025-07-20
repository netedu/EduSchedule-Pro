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
  { id: 'ts-sen-0', day: 'Senin', start_time: '06:30', end_time: '07:15', session_number: null, is_break: false, label: 'UPACARA/PEMBINAAN'},
  { id: 'ts-sen-1', day: 'Senin', start_time: '07:15', end_time: '08:00', session_number: 1, is_break: false },
  { id: 'ts-sen-2', day: 'Senin', start_time: '08:00', end_time: '08:45', session_number: 2, is_break: false },
  { id: 'ts-sen-3', day: 'Senin', start_time: '08:45', end_time: '09:30', session_number: 3, is_break: false },
  { id: 'ts-sen-4', day: 'Senin', start_time: '09:30', end_time: '10:15', session_number: 4, is_break: false },
  { id: 'ts-sen-break1', day: 'Senin', start_time: '10:15', end_time: '10:30', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-sen-5', day: 'Senin', start_time: '10:30', end_time: '11:15', session_number: 5, is_break: false },
  { id: 'ts-sen-6', day: 'Senin', start_time: '11:15', end_time: '12:00', session_number: 6, is_break: false },
  { id: 'ts-sen-7', day: 'Senin', start_time: '12:00', end_time: '12:45', session_number: 7, is_break: false },
  { id: 'ts-sen-break2', day: 'Senin', start_time: '12:45', end_time: '13:15', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-sen-8', day: 'Senin', start_time: '13:15', end_time: '14:00', session_number: 8, is_break: false },
  { id: 'ts-sen-9', day: 'Senin', start_time: '14:00', end_time: '14:45', session_number: 9, is_break: false },
  { id: 'ts-sen-10', day: 'Senin', start_time: '14:45', end_time: '15:30', session_number: 10, is_break: false },
  
  // Selasa
  { id: 'ts-sel-0', day: 'Selasa', start_time: '06:30', end_time: '06:45', session_number: 0, is_break: false, label: 'DOA' },
  { id: 'ts-sel-1', day: 'Selasa', start_time: '06:45', end_time: '07:30', session_number: 1, is_break: false },
  { id: 'ts-sel-2', day: 'Selasa', start_time: '07:30', end_time: '08:10', session_number: 2, is_break: false },
  { id: 'ts-sel-3', day: 'Selasa', start_time: '08:10', end_time: '08:55', session_number: 3, is_break: false },
  { id: 'ts-sel-4', day: 'Selasa', start_time: '08:55', end_time: '09:35', session_number: 4, is_break: false },
  { id: 'ts-sel-5', day: 'Selasa', start_time: '09:35', end_time: '10:20', session_number: 5, is_break: false },
  { id: 'ts-sel-break1', day: 'Selasa', start_time: '10:20', end_time: '10:35', session_number: null, is_break: true, label: 'ISTIRAHAT' },
  { id: 'ts-sel-6', day: 'Selasa', start_time: '10:35', end_time: '11:15', session_number: 6, is_break: false },
  { id: 'ts-sel-7', day: 'Selasa', start_time: '11:15', end_time: '12:00', session_number: 7, is_break: false },
  { id: 'ts-sel-8', day: 'Selasa', start_time: '12:00', end_time: '12:40', session_number: 8, is_break: false },
  { id: 'ts-sel-9', day: 'Selasa', start_time: '12:40', end_time: '13:25', session_number: 9, is_break: false },
  { id: 'ts-sel-10', day: 'Selasa', start_time: '13:25', end_time: '14:05', session_number: 10, is_break: false },

  // Rabu
  { id: 'ts21', day: 'Rabu', start_time: '07:00', end_time: '07:45', session_number: 1, is_break: false },
  { id: 'ts22', day: 'Rabu', start_time: '07:45', end_time: '08:30', session_number: 2, is_break: false },
  { id: 'ts23', day: 'Rabu', start_time: '08:30', end_time: '09:15', session_number: 3, is_break: false },
  { id: 'ts24', day: 'Rabu', start_time: '09:15', end_time: '10:00', session_number: 4, is_break: false },
  { id: 'ts25', day: 'Rabu', start_time: '10:00', end_time: '10:15', session_number: null, is_break: true },
  { id: 'ts26', day: 'Rabu', start_time: '10:15', end_time: '11:00', session_number: 5, is_break: false },
  { id: 'ts27', day: 'Rabu', start_time: '11:00', end_time: '11:45', session_number: 6, is_break: false },
  { id: 'ts28', day: 'Rabu', start_time: '11:45', end_time: '12:30', session_number: 7, is_break: false },
  { id: 'ts29', day: 'Rabu', start_time: '12:30', end_time: '13:15', session_number: null, is_break: true },
  { id: 'ts30', day: 'Rabu', start_time: '13:15', end_time: '14:00', session_number: 8, is_break: false },

  // Kamis
  { id: 'ts31', day: 'Kamis', start_time: '07:00', end_time: '07:45', session_number: 1, is_break: false },
  { id: 'ts32', day: 'Kamis', start_time: '07:45', end_time: '08:30', session_number: 2, is_break: false },
  { id: 'ts33', day: 'Kamis', start_time: '08:30', end_time: '09:15', session_number: 3, is_break: false },
  { id: 'ts34', day: 'Kamis', start_time: '09:15', end_time: '10:00', session_number: 4, is_break: false },
  { id: 'ts35', day: 'Kamis', start_time: '10:00', end_time: '10:15', session_number: null, is_break: true },
  { id: 'ts36', day: 'Kamis', start_time: '10:15', end_time: '11:00', session_number: 5, is_break: false },
  { id: 'ts37', day: 'Kamis', start_time: '11:00', end_time: '11:45', session_number: 6, is_break: false },
  { id: 'ts38', day: 'Kamis', start_time: '11:45', end_time: '12:30', session_number: 7, is_break: false },
  { id: 'ts39', day: 'Kamis', start_time: '12:30', end_time: '13:15', session_number: null, is_break: true },
  { id: 'ts40', day: 'Kamis', start_time: '13:15', end_time: '14:00', session_number: 8, is_break: false },

  // Jumat
  { id: 'ts41', day: 'Jumat', start_time: '07:00', end_time: '07:45', session_number: 1, is_break: false },
  { id: 'ts42', day: 'Jumat', start_time: '07:45', end_time: '08:30', session_number: 2, is_break: false },
  { id: 'ts43', day: 'Jumat', start_time: '08:30', end_time: '09:15', session_number: 3, is_break: false },
  { id: 'ts44', day: 'Jumat', start_time: '09:15', end_time: '10:00', session_number: null, is_break: true },
  { id: 'ts45', day: 'Jumat', start_time: '10:00', end_time: '10:45', session_number: 4, is_break: false },
  { id: 'ts46', day: 'Jumat', start_time: '10:45', end_time: '11:30', session_number: 5, is_break: false },
  { id: 'ts47', day: 'Jumat', start_time: '11:30', end_time: '13:00', session_number: null, is_break: true },
  { id: 'ts48', day: 'Jumat', start_time: '13:00', end_time: '13:45', session_number: 6, is_break: false },

  // Sabtu
  { id: 'ts51', day: 'Sabtu', start_time: '07:00', end_time: '07:45', session_number: 1, is_break: false },
  { id: 'ts52', day: 'Sabtu', start_time: '07:45', end_time: '08:30', session_number: 2, is_break: false },
  { id: 'ts53', day: 'Sabtu', start_time: '08:30', end_time: '09:15', session_number: 3, is_break: false },
  { id: 'ts54', day: 'Sabtu', start_time: '09:15', end_time: '10:00', session_number: 4, is_break: false },
  { id: 'ts55', day: 'Sabtu', start_time: '10:00', end_time: '10:15', session_number: null, is_break: true },
  { id: 'ts56', day: 'Sabtu', start_time: '10:15', end_time: '11:00', session_number: 5, is_break: false },
  { id: 'ts57', day: 'Sabtu', start_time: '11:00', end_time: '11:45', session_number: 6, is_break: false },
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
