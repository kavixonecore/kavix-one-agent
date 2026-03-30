import { Injectable, signal, computed } from "@angular/core";

interface AppStateModel {
  sidebarCollapsed: boolean;
  currentOrgId: string | null;
}

@Injectable({ providedIn: "root" })
export class AppState {

  private readonly _state = signal<AppStateModel>({
    sidebarCollapsed: false,
    currentOrgId: null,
  });

  readonly sidebarCollapsed = computed(() => this._state().sidebarCollapsed);
  readonly currentOrgId = computed(() => this._state().currentOrgId);

  setSidebarCollapsed(collapsed: boolean): void {
    this._patch({ sidebarCollapsed: collapsed });
  }

  setCurrentOrgId(orgId: string | null): void {
    this._patch({ currentOrgId: orgId });
  }

  private _patch(partial: Partial<AppStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
