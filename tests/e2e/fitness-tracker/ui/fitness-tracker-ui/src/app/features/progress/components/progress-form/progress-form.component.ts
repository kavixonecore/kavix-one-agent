import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { ProgressState } from "../../state/progress.state";
import { MetricType } from "../../../../interfaces";
import type { ICreateProgressMetric, MetricTypeValue } from "../../../../interfaces";

@Component({
  selector: "app-progress-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: "./progress-form.component.html",
  styleUrl: "./progress-form.component.scss",
})
export class ProgressFormComponent implements OnInit {

  protected readonly state = inject(ProgressState);
  private readonly fb = inject(FormBuilder);

  protected readonly metricTypes = Object.values(MetricType);

  protected form: FormGroup = this.fb.group({
    metricType: ["", Validators.required],
    value: [null, [Validators.required, Validators.min(0)]],
    unit: ["", Validators.required],
    date: ["", Validators.required],
    customMetricName: [""],
    notes: [""],
  });

  protected get isCustom(): boolean {
    return this.form.get("metricType")?.value === "custom";
  }

  protected get isEditing(): boolean {
    return this.state.editing() !== null;
  }

  ngOnInit(): void {
    const editing = this.state.editing();
    if (editing) {
      this.form.patchValue({
        metricType: editing.metricType,
        value: editing.value,
        unit: editing.unit,
        date: editing.date,
        customMetricName: editing.customMetricName ?? "",
        notes: editing.notes ?? "",
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.value as Record<string, unknown>;
    const body: ICreateProgressMetric = {
      metricType: raw["metricType"] as MetricTypeValue,
      value: Number(raw["value"]),
      unit: raw["unit"] as string,
      date: raw["date"] as string,
      ...(raw["customMetricName"] ? { customMetricName: raw["customMetricName"] as string } : {}),
      ...(raw["notes"] ? { notes: raw["notes"] as string } : {}),
    };
    this.state.createMetric(body);
  }

  protected onCancel(): void {
    this.state.closeForm();
  }
}
