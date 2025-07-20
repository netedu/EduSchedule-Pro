// src/ai/flows/generate-schedule.ts
'use server';

/**
 * @fileOverview Flow to generate a schedule automatically based on defined constraints.
 *
 * - generateSchedule - A function that triggers the schedule generation process.
 * - GenerateScheduleInput - The input type for the generateSchedule function.
 * - GenerateScheduleOutput - The return type for the generateSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TeachersSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject_ids: z.array(z.string()),
  available_time_slot_ids: z.array(z.string()),
  class_ids: z.array(z.string()),
});

const SubjectsSchema = z.object({
  id: z.string(),
  name: z.string(),
  required_sessions_per_week: z.number(),
  level_target: z.string(),
  group: z.enum(['Umum', 'Kejuruan', 'Mapel Pilihan', 'Mulok']),
});

const ClassesSchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.string(),
  level: z.string(),
  is_combined: z.boolean().optional(),
  combined_class_ids: z.array(z.string()).optional(),
});

const RoomsSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

const TimeSlotsSchema = z.object({
  id: z.string(),
  day: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  session_number: z.number().nullable(),
  label: z.string().optional(),
});

const SchoolInfoSchema = z.object({
  id: z.string(),
  academic_year: z.string(),
  semester: z.string(),
  school_name: z.string(),
  headmaster_name: z.string(),
  address: z.string(),
  logo_url: z.string().url().optional(),
});

const GenerateScheduleInputSchema = z.object({
  teachers: z.array(TeachersSchema),
  subjects: z.array(SubjectsSchema),
  classes: z.array(ClassesSchema),
  rooms: z.array(RoomsSchema),
  timeSlots: z.array(TimeSlotsSchema),
  schoolInfo: SchoolInfoSchema,
});

export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

const SchedulesSchema = z.object({
  id: z.string(),
  class_id: z.string(),
  subject_id: z.string(),
  teacher_id: z.string(),
  room_id: z.string(),
  day: z.string(),
  time_slot_id: z.string(),
});

const GenerateScheduleOutputSchema = z.array(SchedulesSchema);

export type GenerateScheduleOutput = z.infer<typeof GenerateScheduleOutputSchema>;

export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
  return generateScheduleFlow(input);
}

const generateSchedulePrompt = ai.definePrompt({
  name: 'generateSchedulePrompt',
  input: {schema: GenerateScheduleInputSchema},
  output: {schema: GenerateScheduleOutputSchema},
  prompt: `You are an AI scheduling assistant for vocational schools.

  Given the following data, generate a school schedule that adheres to the constraints.

  School Information:
  School Name: {{{schoolInfo.school_name}}}
  Academic Year: {{{schoolInfo.academic_year}}}
  Semester: {{{schoolInfo.semester}}}
  Headmaster: {{{schoolInfo.headmaster_name}}}
  Address: {{{schoolInfo.address}}}

  Teachers: {{{JSON.stringify teachers}}}
  Subjects: {{{JSON.stringify subjects}}}
  Classes: {{{JSON.stringify classes}}}
  Rooms: {{{JSON.stringify rooms}}}
  Time Slots: {{{JSON.stringify timeSlots}}}

  Constraints:
  - IMPORTANT: Some classes are 'combined classes' (is_combined: true). These are used for general subjects (group: 'Umum'). When a schedule is created for a combined class, it implies that all its member classes (listed in 'combined_class_ids') are in that session.
  - IMPORTANT: Some time slots have a 'label' (e.g., "UPACARA/PEMBINAAN"). These time slots are reserved for that specific activity and MUST NOT be used for any class sessions. Do not generate any schedules for time slots that have a label.
  - Schedule 'Umum' subjects for the 'combined classes'.
  - Schedule 'Kejuruan' subjects for individual, non-combined classes.
  - No conflicts: Ensure that teachers, rooms, and especially classes (including members of a combined class) are not double-booked for the same time slot. If a combined class has a schedule, none of its member classes can have another schedule at the same time.
  - Session requirements: Meet the required sessions per week for each subject for every class. A subject is only applicable for a class if the subject's 'level_target' matches the class's 'level'. For combined classes, the level should also match.
  - Time slot adherence: Assign classes to available time slots. A teacher is only available for the time slots listed in their available_time_slot_ids.
  - A teacher can only teach subjects listed in their subject_ids.
  - A teacher can only teach classes listed in their class_ids. This applies to both individual and combined classes.
  - One class at a time: An individual class can only have one subject at any given time.
  - A teacher can only teach one class (or one combined class) at a time.
  - A room can only be used by one class (or one combined class) at a time.

  Output:
  Return a JSON array of schedule objects. Generate a unique ID for each schedule entry.
  The 'class_id' in the schedule should be the ID of the class that is actually having the lesson. For 'Umum' subjects, this will be the ID of the 'combined class'. For 'Kejuruan' subjects, this will be the ID of the individual class.
  Schedules: [{
    id: string,
    class_id: string,
    subject_id: string,
    teacher_id: string,
    room_id: string,
    day: string,
    time_slot_id: string
  }]
  Ensure that the schedule satisfies all of the above constraints. Adhere to data types specified in the schema. The time_slot_id must be one of the IDs from the provided Time Slots data.
`,
});

const generateScheduleFlow = ai.defineFlow(
  {
    name: 'generateScheduleFlow',
    inputSchema: GenerateScheduleInputSchema,
    outputSchema: GenerateScheduleOutputSchema,
  },
  async input => {
    const {output} = await generateSchedulePrompt(input);
    return output!;
  }
);
