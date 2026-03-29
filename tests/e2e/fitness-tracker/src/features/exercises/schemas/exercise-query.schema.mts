import { z } from "zod";

import { MuscleGroup } from "../exercise.constants.mjs";

export const exerciseQuerySchema = z.object({
  muscleGroup: z.enum(Object.values(MuscleGroup) as [string, ...string[]])
.optional(),
  name: z.string()
.optional(),
  page: z.coerce.number()
.int()
.positive()
.default(1),
  limit: z.coerce.number()
.int()
.positive()
.max(100)
.default(20),
});

export const exerciseParamsSchema = z.object({
  id: z.string()
.min(1),
});
