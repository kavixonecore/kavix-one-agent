import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { forkJoin } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { LoggerService } from "../../../core/services/logger.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IProgressMetric, ICreateProgressMetric } from "../../../interfaces";

interface ProgressData {
  readonly metrics: IProgressMetric[];
  readonly weightData: IProgressMetric[];
  readonly bodyFatData: IProgressMetric[];
  readonly count: number;
  readonly loading: boolean;
  readonly error: string | null;
  readonly editing: IProgressMetric | null;
  readonly formOpen: boolean;
}

const INITIAL: ProgressData = {
  metrics: [],
  weightData: [],
  bodyFatData: [],
  count: 0,
  loading: false,
  error: null,
  editing: null,
  formOpen: false,
};

@Injectable({ providedIn: "root" })
export class ProgressState {

  private readonly _state = signal<ProgressData>(INITIAL);
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly metrics = computed(() => this._state().metrics);
  readonly weightData = computed(() => this._state().weightData);
  readonly bodyFatData = computed(() => this._state().bodyFatData);
  readonly count = computed(() => this._state().count);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly editing = computed(() => this._state().editing);
  readonly formOpen = computed(() => this._state().formOpen);

  readonly weightChartData = computed(() =>
    this._state().weightData
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => ({ name: m.date, value: m.value })),
  );

  readonly bodyFatChartData = computed(() =>
    this._state().bodyFatData
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((m) => ({ name: m.date, value: m.value })),
  );

  loadAll(): void {
    this._patch({ loading: true, error: null });
    forkJoin({
      metrics: this.api.getProgressMetrics({ limit: 100 }),
      weight: this.api.getMetricsByType("weight_lbs"),
      bodyFat: this.api.getMetricsByType("body_fat_pct"),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this._patch({
            metrics: res.metrics.data,
            count: res.metrics.count ?? 0,
            weightData: res.weight.data,
            bodyFatData: res.bodyFat.data,
            loading: false,
          });
        },
        error: (err) => this.handleError("Failed to load progress data", err),
      });
  }

  createMetric(body: ICreateProgressMetric): void {
    this.api.createProgressMetric(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Metric added");
          this._patch({ formOpen: false, editing: null });
          this.loadAll();
        },
        error: (err) => this.handleError("Failed to add metric", err),
      });
  }

  deleteMetric(id: string): void {
    this.api.deleteProgressMetric(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Metric deleted");
          this.loadAll();
        },
        error: (err) => this.handleError("Failed to delete metric", err),
      });
  }

  openForm(metric?: IProgressMetric): void {
    this._patch({ formOpen: true, editing: metric ?? null });
  }

  closeForm(): void {
    this._patch({ formOpen: false, editing: null });
  }

  private handleError(message: string, err: unknown): void {
    this.logger.error(message, err);
    this._patch({ loading: false, error: message });
  }

  private _patch(partial: Partial<ProgressData>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
