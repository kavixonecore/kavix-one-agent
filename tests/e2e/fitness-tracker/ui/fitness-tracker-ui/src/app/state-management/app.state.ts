import { Injectable, signal, computed } from "@angular/core";

interface AppStateData {
  readonly sidenavOpen: boolean;
  readonly darkMode: boolean;
  readonly loading: boolean;
}

const INITIAL_STATE: AppStateData = {
  sidenavOpen: false,
  darkMode: false,
  loading: false,
};

@Injectable({ providedIn: "root" })
export class AppState {

  private readonly _state = signal<AppStateData>(INITIAL_STATE);

  readonly sidenavOpen = computed(() => this._state().sidenavOpen);
  readonly darkMode = computed(() => this._state().darkMode);
  readonly loading = computed(() => this._state().loading);

  toggleSidenav(): void {
    this._patch({ sidenavOpen: !this._state().sidenavOpen });
  }

  setSidenavOpen(open: boolean): void {
    this._patch({ sidenavOpen: open });
  }

  toggleDarkMode(): void {
    this._patch({ darkMode: !this._state().darkMode });
  }

  setLoading(loading: boolean): void {
    this._patch({ loading });
  }

  private _patch(partial: Partial<AppStateData>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
