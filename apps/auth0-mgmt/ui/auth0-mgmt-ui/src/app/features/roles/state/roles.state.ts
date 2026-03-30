import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IRole } from "../../../interfaces";

interface RolesStateModel {
  roles: IRole[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class RolesState {

  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<RolesStateModel>({
    roles: [],
    loading: false,
    error: null,
  });

  readonly roles = computed(() => this._state().roles);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  loadRoles(): void {
    this._patch({ loading: true, error: null });
    this.api.getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ roles: res.data, loading: false }),
        error: () => this._patch({ error: "Failed to load roles", loading: false }),
      });
  }

  createRole(body: { name: string; description?: string }): void {
    this._patch({ loading: true });
    this.api.createRole(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Role created");
          this.loadRoles();
        },
        error: () => {
          this.notify.error("Failed to create role");
          this._patch({ loading: false });
        },
      });
  }

  private _patch(partial: Partial<RolesStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
