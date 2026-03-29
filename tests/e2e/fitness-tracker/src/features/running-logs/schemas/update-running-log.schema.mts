import { z } from "zod";

export const updateRunningLogSchema = z.object({
  distanceMiles: z.number()
.positive()
.optional(),
  durationMinutes: z.number()
.positive()
.optional(),
  paceMinutesPerMile: z.number()
.positive()
.optional(),
  routeName: z.string()
.max(200)
.optional(),
  elevationGainFeet: z.number()
.optional(),
  heartRateAvg: z.number()
.positive()
.optional(),
  weather: z.string()
.max(100)
.optional(),
  notes: z.string()
.max(2000)
.optional(),
});
