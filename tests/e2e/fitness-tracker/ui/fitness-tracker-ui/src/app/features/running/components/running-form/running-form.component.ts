import { Component, inject, OnInit, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { RunningState } from "../../state/running.state";
import type { ICreateRunningLog } from "../../../../interfaces";

@Component({
  selector: "app-running-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: "./running-form.component.html",
  styleUrl: "./running-form.component.scss",
})
export class RunningFormComponent implements OnInit {

  protected readonly state = inject(RunningState);
  private readonly fb = inject(FormBuilder);

  protected form: FormGroup = this.fb.group({
    workoutId: ["", Validators.required],
    distanceMiles: [null, [Validators.required, Validators.min(0.01)]],
    durationMinutes: [null, [Validators.required, Validators.min(0.1)]],
    routeName: [""],
    elevationGainFeet: [null],
    heartRateAvg: [null],
    weather: [""],
    notes: [""],
  });

  protected readonly calculatedPace = computed(() => {
    const dist = this.form?.get("distanceMiles")?.value as number;
    const dur = this.form?.get("durationMinutes")?.value as number;
    if (dist && dur && dist > 0) {
      return (dur / dist).toFixed(2);
    }
    return null;
  });

  protected get isEditing(): boolean {
    return this.state.editing() !== null;
  }

  ngOnInit(): void {
    const editing = this.state.editing();
    if (editing) {
      this.form.patchValue({
        workoutId: editing.workoutId,
        distanceMiles: editing.distanceMiles,
        durationMinutes: editing.durationMinutes,
        routeName: editing.routeName ?? "",
        elevationGainFeet: editing.elevationGainFeet ?? null,
        heartRateAvg: editing.heartRateAvg ?? null,
        weather: editing.weather ?? "",
        notes: editing.notes ?? "",
      });
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.value as Record<string, unknown>;
    const body: ICreateRunningLog = {
      workoutId: raw["workoutId"] as string,
      distanceMiles: Number(raw["distanceMiles"]),
      durationMinutes: Number(raw["durationMinutes"]),
      ...(raw["routeName"] ? { routeName: raw["routeName"] as string } : {}),
      ...(raw["elevationGainFeet"] ? { elevationGainFeet: Number(raw["elevationGainFeet"]) } : {}),
      ...(raw["heartRateAvg"] ? { heartRateAvg: Number(raw["heartRateAvg"]) } : {}),
      ...(raw["weather"] ? { weather: raw["weather"] as string } : {}),
      ...(raw["notes"] ? { notes: raw["notes"] as string } : {}),
    };
    this.state.createLog(body);
  }

  protected onCancel(): void {
    this.state.closeForm();
  }
}
