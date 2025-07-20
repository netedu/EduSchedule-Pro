import type { SchoolInfo, Schedule } from './types';

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
