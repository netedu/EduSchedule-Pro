"use server";

import { generateSchedule, GenerateScheduleInput } from "@/ai/flows/generate-schedule";
import { z } from "zod";

const actionSchema = z.object({
  teachers: z.array(z.any()),
  subjects: z.array(z.any()),
  classes: z.array(z.any()),
  rooms: z.array(z.any()),
  timeSlots: z.array(z.any()),
  schoolInfo: z.any(),
});

export async function generateScheduleAction(input: GenerateScheduleInput) {
  try {
    const validatedInput = actionSchema.parse(input);
    const schedule = await generateSchedule(validatedInput);
    return { success: true, data: schedule };
  } catch (error) {
    console.error("Error generating schedule:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid input data." };
    }
    return { success: false, error: "Failed to generate schedule from AI." };
  }
}
