export interface Teacher {
  id: string;
  name: string;
  subject_ids: string[];
  availability_time_slots: string[];
}

export interface Subject {
  id: string;
  name: string;
  required_sessions_per_week: number;
}

export interface Class {
  id: string;
  name: string;
  department: string;
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
