import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";

interface SettingsStateModel {
  health: { status: string; timestamp: string; uptime: number } | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class SettingsState {

  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<SettingsStateModel>({
    health: null,
    loading: false,
    error: null,
  });

  readonly health = computed(() => this._state().health);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  loadHealth(): void {
    this._patch({ loading: true, error: null });
    this.api.getHealth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this._patch({ health: data, loading: false }),
        error: () => this._patch({ error: "Failed to reach API", loading: false }),
      });
  }

  private _patch(partial: Partial<SettingsStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
