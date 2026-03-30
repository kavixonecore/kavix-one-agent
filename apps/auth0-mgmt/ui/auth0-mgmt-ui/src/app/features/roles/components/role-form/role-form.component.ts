import { Component, inject, output } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { RolesState } from "../../state/roles.state";

@Component({
  selector: "app-role-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: "./role-form.component.html",
  styleUrl: "./role-form.component.scss",
})
export class RoleFormComponent {

  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly state = inject(RolesState);

  readonly form = this.fb.nonNullable.group({
    name: ["", Validators.required],
    description: [""],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const val = this.form.getRawValue();
    this.state.createRole({
      name: val.name,
      description: val.description || undefined,
    });
    this.form.reset();
    this.saved.emit();
  }
}
