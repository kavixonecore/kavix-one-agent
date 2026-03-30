import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { forkJoin } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import { LoggerService } from "../../../core/services/logger.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IRunningLog, ICreateRunningLog, IPersonalBests } from "../../../interfaces";

interface RunningData {
  readonly logs: IRunningLog[];
  readonly count: number;
  readonly personalBests: IPersonalBests | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly editing: IRunningLog | null;
  readonly formOpen: boolean;
}

const INITIAL: RunningData = {
  logs: [],
  count: 0,
  personalBests: null,
  loading: false,
  error: null,
  editing: null,
  formOpen: false,
};

@Injectable({ providedIn: "root" })
export class RunningState {

  private readonly _state = signal<RunningData>(INITIAL);
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly logs = computed(() => this._state().logs);
  readonly count = computed(() => this._state().count);
  readonly personalBests = computed(() => this._state().personalBests);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly editing = computed(() => this._state().editing);
  readonly formOpen = computed(() => this._state().formOpen);

  readonly paceOverTime = computed(() =>
    [...this._state().logs]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((l) => ({ name: l.createdAt.slice(0, 10), value: l.paceMinutesPerMile })),
  );

  loadAll(): void {
    this._patch({ loading: true, error: null });
    forkJoin({
      logs: this.api.getRunningLogs({ limit: 100 }),
      bests: this.api.getPersonalBests(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this._patch({
            logs: res.logs.data,
            count: res.logs.count ?? 0,
            personalBests: res.bests.data,
            loading: false,
          });
        },
        error: (err) => this.handleError("Failed to load running data", err),
      });
  }

  createLog(body: ICreateRunningLog): void {
    this.api.createRunningLog(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Running log created");
          this._patch({ formOpen: false, editing: null });
          this.loadAll();
        },
        error: (err) => this.handleError("Failed to create running log", err),
      });
  }

  deleteLog(id: string): void {
    this.api.deleteRunningLog(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Running log deleted");
          this.loadAll();
        },
        error: (err) => this.handleError("Failed to delete running log", err),
      });
  }

  openForm(log?: IRunningLog): void {
    this._patch({ formOpen: true, editing: log ?? null });
  }

  closeForm(): void {
    this._patch({ formOpen: false, editing: null });
  }

  private handleError(message: string, err: unknown): void {
    this.logger.error(message, err);
    this._patch({ loading: false, error: message });
  }

  private _patch(partial: Partial<RunningData>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
