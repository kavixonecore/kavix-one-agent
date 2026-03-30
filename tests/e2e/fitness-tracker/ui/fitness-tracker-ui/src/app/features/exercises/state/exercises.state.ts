import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";
import { LoggerService } from "../../../core/services/logger.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IExercise, ICreateExercise, IExerciseQuery } from "../../../interfaces";

interface ExercisesData {
  readonly exercises: IExercise[];
  readonly count: number;
  readonly loading: boolean;
  readonly error: string | null;
  readonly editing: IExercise | null;
  readonly formOpen: boolean;
}

const INITIAL: ExercisesData = {
  exercises: [],
  count: 0,
  loading: false,
  error: null,
  editing: null,
  formOpen: false,
};

@Injectable({ providedIn: "root" })
export class ExercisesState {

  private readonly _state = signal<ExercisesData>(INITIAL);
  private readonly api = inject(ApiService);
  private readonly logger = inject(LoggerService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly exercises = computed(() => this._state().exercises);
  readonly count = computed(() => this._state().count);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly editing = computed(() => this._state().editing);
  readonly formOpen = computed(() => this._state().formOpen);

  loadExercises(query?: IExerciseQuery): void {
    this._patch({ loading: true, error: null });
    this.api.getExercises(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ exercises: res.data, count: res.count ?? 0, loading: false }),
        error: (err) => this.handleError("Failed to load exercises", err),
      });
  }

  createExercise(body: ICreateExercise): void {
    this.api.createExercise(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Exercise created");
          this._patch({ formOpen: false, editing: null });
          this.loadExercises();
        },
        error: (err) => this.handleError("Failed to create exercise", err),
      });
  }

  updateExercise(id: string, body: Partial<ICreateExercise>): void {
    this.api.updateExercise(id, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Exercise updated");
          this._patch({ formOpen: false, editing: null });
          this.loadExercises();
        },
        error: (err) => this.handleError("Failed to update exercise", err),
      });
  }

  deleteExercise(id: string): void {
    this.api.deleteExercise(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Exercise deleted");
          this.loadExercises();
        },
        error: (err) => this.handleError("Failed to delete exercise", err),
      });
  }

  openForm(exercise?: IExercise): void {
    this._patch({ formOpen: true, editing: exercise ?? null });
  }

  closeForm(): void {
    this._patch({ formOpen: false, editing: null });
  }

  private handleError(message: string, err: unknown): void {
    this.logger.error(message, err);
    this._patch({ loading: false, error: message });
  }

  private _patch(partial: Partial<ExercisesData>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
