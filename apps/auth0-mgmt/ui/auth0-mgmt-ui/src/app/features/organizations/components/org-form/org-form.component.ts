import { Component, inject, output } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { OrganizationsState } from "../../state/organizations.state";

@Component({
  selector: "app-org-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: "./org-form.component.html",
  styleUrl: "./org-form.component.scss",
})
export class OrgFormComponent {

  saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly state = inject(OrganizationsState);

  readonly form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    displayName: ["", Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const { name, displayName } = this.form.getRawValue();
    this.state.createOrg({ name, displayName });
    this.form.reset();
    this.saved.emit();
  }
}
