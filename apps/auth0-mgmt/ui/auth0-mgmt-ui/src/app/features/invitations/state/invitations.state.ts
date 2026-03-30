import { Injectable, inject, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ApiService } from "../../../core/services/api.service";
import { NotificationService } from "../../../core/services/notification.service";
import type { IInvite } from "../../../interfaces";

interface InvitationsStateModel {
  invitations: IInvite[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: "root" })
export class InvitationsState {

  private readonly api = inject(ApiService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<InvitationsStateModel>({
    invitations: [],
    loading: false,
    error: null,
  });

  readonly invitations = computed(() => this._state().invitations);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  loadInvitations(orgId: string): void {
    this._patch({ loading: true, error: null });
    this.api.getInvitations(orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => this._patch({ invitations: res.data, loading: false }),
        error: () => this._patch({ error: "Failed to load invitations", loading: false }),
      });
  }

  createInvitation(body: {
    orgId: string;
    clientId: string;
    inviterName: string;
    inviteeEmail: string;
    connectionId?: string;
    roleIds?: string[];
    ttlSec?: number;
  }): void {
    this._patch({ loading: true });
    this.api.createInvitation(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Invitation sent");
          this.loadInvitations(body.orgId);
        },
        error: () => {
          this.notify.error("Failed to send invitation");
          this._patch({ loading: false });
        },
      });
  }

  deleteInvitation(inviteId: string, orgId: string): void {
    this._patch({ loading: true });
    this.api.deleteInvitation(inviteId, orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.success("Invitation revoked");
          this.loadInvitations(orgId);
        },
        error: () => {
          this.notify.error("Failed to revoke invitation");
          this._patch({ loading: false });
        },
      });
  }

  private _patch(partial: Partial<InvitationsStateModel>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
