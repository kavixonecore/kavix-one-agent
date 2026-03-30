import { Component, inject, input, output, OnInit } from "@angular/core";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MembersState } from "../../state/members.state";

@Component({
  selector: "app-role-assign",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: "./role-assign.component.html",
  styleUrl: "./role-assign.component.scss",
})
export class RoleAssignComponent implements OnInit {

  orgId = input.required<string>();
  userId = input.required<string>();
  closed = output<void>();

  readonly state = inject(MembersState);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    roleIds: [[] as string[]],
  });

  ngOnInit(): void {
    const existing = this.state.memberRoles()[this.userId()];
    if (existing) {
      this.form.patchValue({ roleIds: existing.map((r) => r.id) });
    }
  }

  onAssign(): void {
    const roleIds = this.form.getRawValue().roleIds;
    this.state.assignRoles(this.orgId(), this.userId(), roleIds);
    this.closed.emit();
  }
}
