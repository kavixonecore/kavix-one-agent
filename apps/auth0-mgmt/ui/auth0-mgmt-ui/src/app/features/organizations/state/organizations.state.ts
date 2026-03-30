import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IOrg } from "../../../interfaces";

interface OrgsStateModel {
  orgs: IOrg[];
  selectedOrg: IOrg | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class OrganizationsState {

  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<OrgsStateModel>({
    orgs: [],
    selectedOrg: null,
    loading: false,
    error: null,
  });

  readonly orgs = computed(() => this._state().orgs);
  readonly selectedOrg = computed(() => this._state().selectedOrg);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  loadOrgs(): void {
    this._patch({ loading: true, error: null });
    this.api.getOrgs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ orgs: res.data, loading: false }),
        error: () => this._patch({ error: "Failed to load organizations", loading: false }),
      });
  }

  loadOrg(id: string): void {
    this._patch({ loading: true, error: null });
    this.api.getOrg(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ selectedOrg: res.data, loading: false }),
        error: () => this._patch({ error: "Failed to load organization", loading: false }),
      });
  }

  createOrg(body: { name: string; displayName: string }): void {
    this._patch({ loading: true });
    this.api.createOrg(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Organization created");
          this.loadOrgs();
        },
        error: () => {
          this.notify.error("Failed to create organization");
          this._patch({ loading: false });
        },
      });
  }

  deleteOrg(id: string): void {
    this._patch({ loading: true });
    this.api.deleteOrg(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Organization deleted");
          this.loadOrgs();
        },
        error: () => {
          this.notify.error("Failed to delete organization");
          this._patch({ loading: false });
        },
      });
  }

  private _patch(partial: Partial<OrgsStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
