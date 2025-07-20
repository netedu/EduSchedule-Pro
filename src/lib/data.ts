import type { SchoolInfo, Schedule, TimeSlot } from './types';

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

// Default time slots for generation
export const defaultTimeSlots: TimeSlot[] = [
  { id: 'ts01', day: 'Senin', start_time: '07:00', end_time: '07:45', session_number: 1, is_break: false },
  { id: 'ts02', day: 'Senin', start_time: '07:45', end_time: '08:30', session_number: 2, is_break: false },
  { id: 'ts03', day: 'Senin', start_time: '08:30', end_time: '09:15', session_number: 3, is_break: false },
  { id: 'ts04', day: 'Senin', start_time: '09:15', end_time: '10:00', session_number: 4, is_break: false },
  { id: 'ts05', day: 'Senin', start_time: '10:00', end_time: '10:15', session_number: null, is_break: true },
  { id: 'ts06', day: 'Senin', start_time: '10:15', end_time: '11:00', session_number: 5, is_break: false },
  { id: 'ts07', day: 'Senin', start_time: '11:00', end_time: '11:45', session_number: 6, is_break: false },
  { id: 'ts08', day: 'Senin', start_time: '11:45', end_time: '12:30', session_number: 7, is_break: false },
  { id: 'ts09', day: 'Senin', start_time: '12:30', end_time: '13:15', session_number: null, is_break: true },
  { id: 'ts10', day: 'Senin', start_time: '13:15', end_time: '14:00', session_number: 8, is_break: false },
  
  { id: 'ts11', day: 'Selasa', start_time: '07:00', end_time: '07:45', session_number: 1, is_break: false },
  { id: 'ts12', day: 'Selasa', start_time: '07:45', end_time: '08:30', session_number: 2, is_break: false },
  { id: 'ts13', day: 'Selasa', start_time: '08:30', end_time: '09:15', session_number: 3, is_break: false },
  { id: 'ts14', day: 'Selasa', start_time: '09:15', end_time: '10:00', session_number: 4, is_break: false },
  { id: 'ts15', day: 'Selasa', start_time: '10:00', end_time: '10:15', session_number: null, is_break: true },
  { id: 'ts16', day: 'Selasa', start_time: '10:15', end_time: '11:00', session_number: 5, is_break: false },
  { id: 'ts17', day: 'Selasa', start_time: '11:00', end_time: '11:45', session_number: 6, is_break: false },
  { id: 'ts18', day: 'Selasa', start_time: '11:45', end_time: '12:30', session_number: 7, is_break: false },
  { id: 'ts19', day: 'Selasa', start_time: '12:30', end_time: '13:15', session_number: null, is_break: true },
  { id: 'ts20', day: 'Selasa', start_time: '13:15', end_time: '14:00', session_number: 8, is_break: false },

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

  { id: 'ts41', day: 'Jumat', start_time: '07:00', end_time: '07:45', session_number: 1, is_break: false },
  { id: 'ts42', day: 'Jumat', start_time: '07:45', end_time: '08:30', session_number: 2, is_break: false },
  { id: 'ts43', day: 'Jumat', start_time: '08:30', end_time: '09:15', session_number: 3, is_break: false },
  { id: 'ts44', day: 'Jumat', start_time: '09:15', end_time: '10:00', session_number: null, is_break: true },
  { id: 'ts45', day: 'Jumat', start_time: '10:00', end_time: '10:45', session_number: 4, is_break: false },
  { id: 'ts46', day: 'Jumat', start_time: '10:45', end_time: '11:30', session_number: 5, is_break: false },
  { id: 'ts47', day: 'Jumat', start_time: '11:30', end_time: '13:00', session_number: null, is_break: true },
  { id: 'ts48', day: 'Jumat', start_time: '13:00', end_time: '13:45', session_number: 6, is_break: false },
];
