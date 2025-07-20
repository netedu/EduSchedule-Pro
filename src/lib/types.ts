export interface Teacher {
  id: string;
  name: string;
  subject_ids: string[];
  available_time_slot_ids: string[];
  class_ids: string[];
}

export interface Subject {
  id: string;
  name: string;
  required_sessions_per_week: number;
  level_target: string; // e.g., "X", "XI", "XII"
  group: 'Umum' | 'Kejuruan' | 'Mapel Pilihan' | 'Mulok'; // New field
}

export interface Class {
  id: string;
  name: string;
  department: string;
  level: string; // e.g., "X", "XI", "XII"
  is_combined?: boolean;
  combined_class_ids?: string[];
}

export interface Room {
  id:string;
  name: string;
  type: string;
}

export interface TimeSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  session_number: number | null; // null for breaks
  is_break?: boolean;
  label?: string; // e.g., "Upacara Bendera"
}

export interface SchoolInfo {
  id: string;
  academic_year: string;
  semester: string;
  school_name: string;
  headmaster_name: string;
  address: string;
  logo_url: string;
}

export interface Schedule {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  room_id: string;
  day: string;
  time_slot_id: string;
  time_slot?: string; // Keep this for AI response compatibility
}
