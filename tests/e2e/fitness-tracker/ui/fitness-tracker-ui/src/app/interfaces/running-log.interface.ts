import type { IBaseEntity } from "./base-entity.interface";

export interface IRunningLog extends IBaseEntity {
  readonly workoutId: string;
  readonly distanceMiles: number;
  readonly durationMinutes: number;
  readonly paceMinutesPerMile: number;
  readonly routeName?: string;
  readonly elevationGainFeet?: number;
  readonly heartRateAvg?: number;
  readonly weather?: string;
  readonly notes?: string;
}

export interface ICreateRunningLog {
  readonly workoutId: string;
  readonly distanceMiles: number;
  readonly durationMinutes: number;
  readonly paceMinutesPerMile?: number;
  readonly routeName?: string;
  readonly elevationGainFeet?: number;
  readonly heartRateAvg?: number;
  readonly weather?: string;
  readonly notes?: string;
}

export interface IRunningLogQuery {
  readonly workoutId?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface IPersonalBests {
  readonly fastestPace: number | null;
  readonly longestDistance: number | null;
  readonly longestDuration: number | null;
}
