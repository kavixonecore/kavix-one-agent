import { Component, inject, input, output, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { InvitationsState } from "../../state/invitations.state";
import { RolesState } from "../../../roles/state/roles.state";
import { ConnectionsState } from "../../../connections/state/connections.state";

@Component({
  selector: "app-invite-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: "./invite-form.component.html",
  styleUrl: "./invite-form.component.scss",
})
export class InviteFormComponent implements OnInit {

  orgId = input.required<string>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly state = inject(InvitationsState);
  readonly rolesState = inject(RolesState);
  readonly connectionsState = inject(ConnectionsState);

  readonly form = this.fb.nonNullable.group({
    inviteeEmail: ["", [Validators.required, Validators.email]],
    inviterName: ["", Validators.required],
    clientId: ["", Validators.required],
    connectionId: [""],
    roleIds: [[] as string[]],
    ttlSec: [604800],
  });

  ngOnInit(): void {
    this.rolesState.loadRoles();
    this.connectionsState.loadOrgConnections(this.orgId());
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.state.createInvitation({
      orgId: this.orgId(),
      clientId: val.clientId,
      inviterName: val.inviterName,
      inviteeEmail: val.inviteeEmail,
      connectionId: val.connectionId || undefined,
      roleIds: val.roleIds.length > 0 ? val.roleIds : undefined,
      ttlSec: val.ttlSec ?? undefined,
    });
    this.form.reset();
    this.saved.emit();
  }
}
