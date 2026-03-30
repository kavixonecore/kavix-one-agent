import { Component, inject, input, output } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MembersState } from "../../state/members.state";

@Component({
  selector: "app-member-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: "./member-form.component.html",
  styleUrl: "./member-form.component.scss",
})
export class MemberFormComponent {

  orgId = input.required<string>();
  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly state = inject(MembersState);

  readonly form = this.fb.nonNullable.group({
    userId: ["", Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.state.addMember(this.orgId(), this.form.getRawValue().userId);
    this.form.reset();
    this.saved.emit();
  }
}
