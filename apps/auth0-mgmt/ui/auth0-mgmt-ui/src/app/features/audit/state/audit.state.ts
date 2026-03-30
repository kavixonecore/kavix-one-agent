import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";
import type { IAuditEntry } from "../../../interfaces";

interface AuditStateModel {
  entries: IAuditEntry[];
  loading: boolean;
  error: string | null;
  filters: AuditFilters;
}

export interface AuditFilters {
  orgId: string;
  userId: string;
  event: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

const DEFAULT_FILTERS: AuditFilters = {
  orgId: "",
  userId: "",
  event: "",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 50,
};

@Injectable({ providedIn: "root" })
export class AuditState {

  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<AuditStateModel>({
    entries: [],
    loading: false,
    error: null,
    filters: { ...DEFAULT_FILTERS },
  });

  readonly entries = computed(() => this._state().entries);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);
  readonly filters = computed(() => this._state().filters);

  loadLogs(): void {
    this._patch({ loading: true, error: null });
    const f = this._state().filters;
    this.api.getAuditLogs(f)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ entries: res.data, loading: false }),
        error: () => this._patch({ error: "Failed to load audit logs", loading: false }),
      });
  }

  updateFilters(partial: Partial<AuditFilters>): void {
    this._state.update((s) => ({
      ...s,
      filters: { ...s.filters, ...partial },
    }));
    this.loadLogs();
  }

  resetFilters(): void {
    this._state.update((s) => ({
      ...s,
      filters: { ...DEFAULT_FILTERS },
    }));
    this.loadLogs();
  }

  private _patch(partial: Partial<AuditStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
