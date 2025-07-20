# **App Name**: EduSchedule Pro

## Core Features:

- Master Data Management: Input and manage master data for teachers, subjects, classes, rooms, and school information, including subjects allocation per week. Data structure requirements are:
Teachers: { id, name, subject_ids, availability_time_slots }
Subjects: { id, name, required_sessions_per_week }
Classes: { id, name, department }
Rooms: { id, name, type }
Schedules: { id, class_id, subject_id, teacher_id, room_id, day, time_slot }
TimeSlots: { id, day, start_time, end_time, session_number }
SchoolInfo: { id, academic_year, semester, school_name }
- Time Slot Configuration: Define time slots according to the school's schedule, including consideration for different break times on Fridays. Considerations: Senin, Selasa, Rabu, Kamis, Sabtu: Istirahat pukul 10.20 – 10.35. Jumat: Istirahat pukul 09.30 – 09.45.
- Automated Scheduling: Use a tool to generate a schedule automatically, ensuring no conflicts between teachers, classes, and rooms, while meeting the required sessions per week for each subject. AI will follow configured time slots.
- Schedule Visualization: Display the schedule in a tabular format with filters for classes, teachers, and rooms. The format should mirror the schedule as given by the user, following the layout specifications there.
- Manual Schedule Editing: Allow manual editing of the schedule through a drag-and-drop interface or form input, providing flexibility for adjustments.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2) to convey trust and structure.
- Background color: Light blue (#E0F7FA) for a clean, uncluttered look.
- Accent color: A warm orange (#FFB347) for highlighting important actions or information.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text.
- Use clear and simple icons to represent subjects and actions within the scheduling interface.
- A clean, tabular layout for the schedule, optimized for easy viewing and filtering.
- Subtle transitions and animations when navigating between schedule views or applying filters.