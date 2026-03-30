import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IConnection, IOrgConnection } from "../../../interfaces";

interface ConnectionsStateModel {
  allConnections: IConnection[];
  orgConnections: IOrgConnection[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class ConnectionsState {

  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<ConnectionsStateModel>({
    allConnections: [],
    orgConnections: [],
    loading: false,
    error: null,
  });

  readonly allConnections = computed(() => this._state().allConnections);
  readonly orgConnections = computed(() => this._state().orgConnections);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  readonly connectionStatus = computed(() => {
    const orgConns = this._state().orgConnections;
    const enabledIds = new Set(orgConns.map((c) => c.connectionId));
    return this._state().allConnections.map((conn) => ({
      ...conn,
      enabled: enabledIds.has(conn.id),
      assignMembershipOnLogin: orgConns.find(
        (oc) => oc.connectionId === conn.id,
      )?.assignMembershipOnLogin ?? false,
    }));
  });

  loadAllConnections(): void {
    this._patch({ loading: true, error: null });
    this.api.getConnections()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ allConnections: res.data, loading: false }),
        error: () => this._patch({ error: "Failed to load connections", loading: false }),
      });
  }

  loadOrgConnections(orgId: string): void {
    this.api.getOrgConnections(orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ orgConnections: res.data }),
        error: () => this.notify.error("Failed to load org connections"),
      });
  }

  enableConnection(orgId: string, connectionId: string, assignMembershipOnLogin: boolean): void {
    this.api.enableConnection(orgId, { connectionId, assignMembershipOnLogin })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Connection enabled");
          this.loadOrgConnections(orgId);
        },
        error: () => this.notify.error("Failed to enable connection"),
      });
  }

  disableConnection(orgId: string, connectionId: string): void {
    this.api.disableConnection(orgId, connectionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Connection disabled");
          this.loadOrgConnections(orgId);
        },
        error: () => this.notify.error("Failed to disable connection"),
      });
  }

  private _patch(partial: Partial<ConnectionsStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
