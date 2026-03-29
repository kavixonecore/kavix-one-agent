import type { IBaseEntity } from "../../../shared/interfaces/index.mjs";

export interface IRunningLog extends IBaseEntity {
  workoutId: string;
  distanceMiles: number;
  durationMinutes: number;
  paceMinutesPerMile: number;
  routeName?: string;
  elevationGainFeet?: number;
  heartRateAvg?: number;
  weather?: string;
  notes?: string;
  userId?: string;
}
