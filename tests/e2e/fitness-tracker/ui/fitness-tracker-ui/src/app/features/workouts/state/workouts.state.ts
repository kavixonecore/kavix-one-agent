import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";
import { LoggerService } from "../../../core/services/logger.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IWorkout, ICreateWorkout, IWorkoutQuery } from "../../../interfaces";

interface WorkoutsData {
  readonly workouts: IWorkout[];
  readonly count: number;
  readonly loading: boolean;
  readonly error: string | null;
  readonly editing: IWorkout | null;
  readonly formOpen: boolean;
}

const INITIAL: WorkoutsData = {
  workouts: [],
  count: 0,
  loading: false,
  error: null,
  editing: null,
  formOpen: false,
};

@Injectable({ providedIn: "root" })
export class WorkoutsState {

  private readonly _state = signal<WorkoutsData>(INITIAL);
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly workouts = computed(() => this._state().workouts);
  readonly count = computed(() => this._state().count);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly editing = computed(() => this._state().editing);
  readonly formOpen = computed(() => this._state().formOpen);

  loadWorkouts(query?: IWorkoutQuery): void {
    this._patch({ loading: true, error: null });
    this.api.getWorkouts(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ workouts: res.data, count: res.count ?? 0, loading: false }),
        error: (err) => this.handleError("Failed to load workouts", err),
      });
  }

  createWorkout(body: ICreateWorkout): void {
    this.api.createWorkout(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Workout created");
          this._patch({ formOpen: false, editing: null });
          this.loadWorkouts();
        },
        error: (err) => this.handleError("Failed to create workout", err),
      });
  }

  updateWorkout(id: string, body: Partial<ICreateWorkout>): void {
    this.api.updateWorkout(id, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Workout updated");
          this._patch({ formOpen: false, editing: null });
          this.loadWorkouts();
        },
        error: (err) => this.handleError("Failed to update workout", err),
      });
  }

  deleteWorkout(id: string): void {
    this.api.deleteWorkout(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Workout deleted");
          this.loadWorkouts();
        },
        error: (err) => this.handleError("Failed to delete workout", err),
      });
  }

  openForm(workout?: IWorkout): void {
    this._patch({ formOpen: true, editing: workout ?? null });
  }

  closeForm(): void {
    this._patch({ formOpen: false, editing: null });
  }

  private handleError(message: string, err: unknown): void {
    this.logger.error(message, err);
    this._patch({ loading: false, error: message });
  }

  private _patch(partial: Partial<WorkoutsData>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
