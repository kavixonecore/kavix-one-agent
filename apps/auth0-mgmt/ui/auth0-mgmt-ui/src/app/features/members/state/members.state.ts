import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IMember, IRole } from "../../../interfaces";

interface MembersStateModel {
  members: IMember[];
  memberRoles: Record<string, IRole[]>;
  allRoles: IRole[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class MembersState {

  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<MembersStateModel>({
    members: [],
    memberRoles: {},
    allRoles: [],
    loading: false,
    error: null,
  });

  readonly members = computed(() => this._state().members);
  readonly memberRoles = computed(() => this._state().memberRoles);
  readonly allRoles = computed(() => this._state().allRoles);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  loadMembers(orgId: string): void {
    this._patch({ loading: true, error: null });
    this.api.getMembers(orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ members: res.data, loading: false }),
        error: () => this._patch({ error: "Failed to load members", loading: false }),
      });
  }

  loadAllRoles(): void {
    this.api.getRoles()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ allRoles: res.data }),
        error: () => this._patch({ error: "Failed to load roles" }),
      });
  }

  addMember(orgId: string, userId: string): void {
    this._patch({ loading: true });
    this.api.addMember(orgId, userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Member added");
          this.loadMembers(orgId);
        },
        error: () => {
          this.notify.error("Failed to add member");
          this._patch({ loading: false });
        },
      });
  }

  removeMember(orgId: string, userId: string): void {
    this._patch({ loading: true });
    this.api.removeMember(orgId, userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Member removed");
          this.loadMembers(orgId);
        },
        error: () => {
          this.notify.error("Failed to remove member");
          this._patch({ loading: false });
        },
      });
  }

  loadMemberRoles(orgId: string, userId: string): void {
    this.api.getMemberRoles(orgId, userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this._state.update((s) => ({
            ...s,
            memberRoles: { ...s.memberRoles, [userId]: res.data },
          }));
        },
        error: () => this.notify.error("Failed to load member roles"),
      });
  }

  assignRoles(orgId: string, userId: string, roleIds: string[]): void {
    this.api.assignRoles({ orgId, userId, roleIds })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Roles assigned");
          this.loadMemberRoles(orgId, userId);
        },
        error: () => this.notify.error("Failed to assign roles"),
      });
  }

  private _patch(partial: Partial<MembersStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
