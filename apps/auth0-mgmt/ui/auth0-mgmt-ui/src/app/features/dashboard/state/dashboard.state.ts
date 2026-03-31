import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { forkJoin } from "rxjs";
import { ApiService } from "../../../core/services/api.service";
import type { IOrg, IConnection } from "../../../interfaces";

interface DashboardStateModel {
  orgCount: number;
  roleCount: number;
  connectionCount: number;
  orgConnectionCount: number;
  recentOrgs: IOrg[];
  connections: IConnection[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class DashboardState {

  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<DashboardStateModel>({
    orgCount: 0,
    roleCount: 0,
    connectionCount: 0,
    orgConnectionCount: 0,
    recentOrgs: [],
    connections: [],
    loading: false,
    error: null,
  });

  readonly orgCount = computed(() => this._state().orgCount);
  readonly roleCount = computed(() => this._state().roleCount);
  readonly connectionCount = computed(() => this._state().connectionCount);
  readonly orgConnectionCount = computed(() => this._state().orgConnectionCount);
  readonly recentOrgs = computed(() => this._state().recentOrgs.slice(0, 5));
  readonly connections = computed(() => this._state().connections);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  readonly connectionsByStrategy = computed(() => {
    const conns = this._state().connections;
    const map = new Map<string, number>();
    conns.forEach((c) => {
      map.set(c.strategy, (map.get(c.strategy) ?? 0) + 1);
    });
    const max = Math.max(...Array.from(map.values()), 1);
    return Array.from(map.entries()).map(([strategy, count]) => ({
      strategy,
      count,
      pct: Math.round((count / max) * 100),
    }));
  });

  loadDashboard(): void {
    this._patch({ loading: true, error: null });
    forkJoin({
      orgs: this.api.getOrgs(1, 50),
      roles: this.api.getRoles(),
      connections: this.api.getConnections(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this._patch({
            orgCount: res.orgs.data.length,
            roleCount: res.roles.data.length,
            connectionCount: res.connections.data.length,
            recentOrgs: res.orgs.data,
            connections: res.connections.data,
            loading: false,
          });
        },
        error: () => this._patch({ error: "Failed to load dashboard data", loading: false }),
      });
  }

  private _patch(partial: Partial<DashboardStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
