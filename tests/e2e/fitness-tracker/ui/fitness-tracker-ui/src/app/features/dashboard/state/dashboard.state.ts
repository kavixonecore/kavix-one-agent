import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { forkJoin } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { LoggerService } from "../../../core/services/logger.service";
import type { IWorkout, IRunningLog, IProgressMetric } from "../../../interfaces";

interface DashboardData {
  readonly workouts: IWorkout[];
  readonly runningLogs: IRunningLog[];
  readonly latestMetrics: IProgressMetric[];
  readonly loading: boolean;
  readonly error: string | null;
}

const INITIAL: DashboardData = {
  workouts: [],
  runningLogs: [],
  latestMetrics: [],
  loading: false,
  error: null,
};

@Injectable({ providedIn: "root" })
export class DashboardState {

  private readonly _state = signal<DashboardData>(INITIAL);
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly workouts = computed(() => this._state().workouts);
  readonly runningLogs = computed(() => this._state().runningLogs);
  readonly latestMetrics = computed(() => this._state().latestMetrics);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  readonly totalWorkouts = computed(() => this._state().workouts.length);

  readonly totalRunningDistance = computed(() =>
    this._state().runningLogs.reduce((sum, l) => sum + l.distanceMiles, 0),
  );

  readonly currentWeight = computed(() => {
    const metrics = this._state().latestMetrics;
    const w = metrics.find((m) => m.metricType === "weight_lbs");
    return w?.value ?? null;
  });

  readonly recentWorkouts = computed(() =>
    [...this._state().workouts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
  );

  readonly workoutTypeDistribution = computed(() => {
    const counts = new Map<string, number>();
    for (const w of this._state().workouts) {
      counts.set(w.workoutType, (counts.get(w.workoutType) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  });

  readonly weeklyFrequency = computed(() => {
    return this.groupByWeek(this._state().workouts);
  });

  loadAll(): void {
    this._patch({ loading: true, error: null });

    forkJoin({
      workouts: this.api.getWorkouts({ limit: 100 }),
      running: this.api.getRunningLogs({ limit: 100 }),
      metrics: this.api.getLatestMetrics(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this._patch({
            workouts: res.workouts.data,
            runningLogs: res.running.data,
            latestMetrics: res.metrics.data,
            loading: false,
          });
        },
        error: (err) => {
          this.logger.error("Failed to load dashboard data", err);
          this._patch({ loading: false, error: "Failed to load dashboard data" });
        },
      });
  }

  private groupByWeek(workouts: IWorkout[]): Array<{ name: string; value: number }> {
    const weeks = new Map<string, number>();
    for (const w of workouts) {
      const d = new Date(w.date);
      const weekStart = this.getWeekStart(d);
      const key = weekStart.toISOString().slice(0, 10);
      weeks.set(key, (weeks.get(key) ?? 0) + 1);
    }
    return Array.from(weeks.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([name, value]) => ({ name, value }));
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private _patch(partial: Partial<DashboardData>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
