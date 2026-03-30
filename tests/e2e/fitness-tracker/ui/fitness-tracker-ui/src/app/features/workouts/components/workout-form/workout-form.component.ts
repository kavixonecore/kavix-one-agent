import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatIconModule } from "@angular/material/icon";
import { WorkoutsState } from "../../state/workouts.state";
import { WorkoutType, WorkoutStatus } from "../../../../interfaces";
import type { ICreateWorkout, WorkoutTypeValue, WorkoutStatusValue } from "../../../../interfaces";

@Component({
  selector: "app-workout-form",
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
  templateUrl: "./workout-form.component.html",
  styleUrl: "./workout-form.component.scss",
})
export class WorkoutFormComponent implements OnInit {

  protected readonly state = inject(WorkoutsState);
  private readonly fb = inject(FormBuilder);

  protected readonly workoutTypes = Object.values(WorkoutType);
  protected readonly workoutStatuses = Object.values(WorkoutStatus);

  protected form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    workoutType: ["", Validators.required],
    status: ["planned"],
    date: ["", Validators.required],
    durationMinutes: [null],
    notes: [""],
  });

  protected get isEditing(): boolean {
    return this.state.editing() !== null;
  }

  ngOnInit(): void {
    const editing = this.state.editing();
    if (editing) {
      this.form.patchValue({
        name: editing.name,
        workoutType: editing.workoutType,
        status: editing.status,
        date: editing.date,
        durationMinutes: editing.durationMinutes ?? null,
        notes: editing.notes ?? "",
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.value as Record<string, unknown>;
    const body: ICreateWorkout = {
      name: raw["name"] as string,
      workoutType: raw["workoutType"] as WorkoutTypeValue,
      status: raw["status"] as WorkoutStatusValue,
      date: raw["date"] as string,
      ...(raw["durationMinutes"] ? { durationMinutes: Number(raw["durationMinutes"]) } : {}),
      ...(raw["notes"] ? { notes: raw["notes"] as string } : {}),
    };

    const editing = this.state.editing();
    if (editing) {
      this.state.updateWorkout(editing.id, body);
    } else {
      this.state.createWorkout(body);
    }
  }

  protected onCancel(): void {
    this.state.closeForm();
  }
}
