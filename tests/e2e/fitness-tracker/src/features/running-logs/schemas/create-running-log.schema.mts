import { z } from "zod";

export const createRunningLogSchema = z.object({
  workoutId: z.string().min(1),
  distanceMiles: z.number().positive(),
  durationMinutes: z.number().positive(),
  paceMinutesPerMile: z.number().positive().optional(),
  routeName: z.string().max(200).optional(),
  elevationGainFeet: z.number().optional(),
  heartRateAvg: z.number().positive().optional(),
  weather: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  userId: z.string().optional(),
});
