import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { ExercisesState } from "../../state/exercises.state";
import { MuscleGroup, DifficultyLevel } from "../../../../interfaces";
import type { ICreateExercise, MuscleGroupValue, DifficultyLevelValue } from "../../../../interfaces";

@Component({
  selector: "app-exercise-form",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: "./exercise-form.component.html",
  styleUrl: "./exercise-form.component.scss",
})
export class ExerciseFormComponent implements OnInit {

  protected readonly state = inject(ExercisesState);
  private readonly fb = inject(FormBuilder);

  protected readonly muscleGroups = Object.values(MuscleGroup);
  protected readonly difficultyLevels = Object.values(DifficultyLevel);
  protected equipment: string[] = [];

  protected form: FormGroup = this.fb.group({
    name: ["", Validators.required],
    description: ["", Validators.required],
    muscleGroup: ["", Validators.required],
    difficultyLevel: ["", Validators.required],
    instructions: ["", Validators.required],
    newEquipment: [""],
  });

  protected get isEditing(): boolean {
    return this.state.editing() !== null;
  }

  ngOnInit(): void {
    const editing = this.state.editing();
    if (editing) {
      this.form.patchValue({
        name: editing.name,
        description: editing.description,
        muscleGroup: editing.muscleGroup,
        difficultyLevel: editing.difficultyLevel,
        instructions: editing.instructions,
      });
      this.equipment = [...editing.equipmentRequired];
    }
  }

  protected addEquipment(): void {
    const val = (this.form.get("newEquipment")?.value as string)?.trim();
    if (val && !this.equipment.includes(val)) {
      this.equipment = [...this.equipment, val];
    }
    this.form.get("newEquipment")?.setValue("");
  }

  protected removeEquipment(item: string): void {
    this.equipment = this.equipment.filter((e) => e !== item);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.value as Record<string, unknown>;
    const body: ICreateExercise = {
      name: raw["name"] as string,
      description: raw["description"] as string,
      muscleGroup: raw["muscleGroup"] as MuscleGroupValue,
      difficultyLevel: raw["difficultyLevel"] as DifficultyLevelValue,
      equipmentRequired: this.equipment,
      instructions: raw["instructions"] as string,
    };

    const editing = this.state.editing();
    if (editing) {
      this.state.updateExercise(editing.id, body);
    } else {
      this.state.createExercise(body);
    }
  }

  protected onCancel(): void {
    this.state.closeForm();
  }
}
