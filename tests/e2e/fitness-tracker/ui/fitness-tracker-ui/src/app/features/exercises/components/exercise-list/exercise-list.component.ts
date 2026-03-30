import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { AgGridModule } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { ExercisesState } from "../../state/exercises.state";
import { ExerciseFormComponent } from "../exercise-form/exercise-form.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ErrorAlertComponent } from "../../../../shared/components/error-alert/error-alert.component";
import { MuscleGroup } from "../../../../interfaces";
import type { IExercise } from "../../../../interfaces";

@Component({
  selector: "app-exercise-list",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    AgGridModule,
    ExerciseFormComponent,
    LoadingComponent,
    ErrorAlertComponent,
  ],
  templateUrl: "./exercise-list.component.html",
  styleUrl: "./exercise-list.component.scss",
})
export class ExerciseListComponent implements OnInit {

  protected readonly state = inject(ExercisesState);
  private readonly fb = inject(FormBuilder);

  protected readonly filterForm: FormGroup = this.fb.group({
    muscleGroup: [""],
    name: [""],
  });

  protected readonly muscleGroups = Object.values(MuscleGroup);

  protected readonly columnDefs: ColDef<IExercise>[] = [
    { field: "name", headerName: "Name", flex: 2 },
    { field: "muscleGroup", headerName: "Muscle Group", flex: 1 },
    { field: "difficultyLevel", headerName: "Difficulty", flex: 1 },
    { field: "equipmentRequired", headerName: "Equipment", flex: 2,
      valueFormatter: (params) => (params.value as string[])?.join(", ") ?? "" },
  ];

  protected readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  ngOnInit(): void {
    this.state.loadExercises();
  }

  protected onFilter(): void {
    const values = this.filterForm.value as Record<string, string>;
    const query: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val) {
        query[key] = val;
      }
    }
    this.state.loadExercises(query);
  }

  protected onClear(): void {
    this.filterForm.reset();
    this.state.loadExercises();
  }

  protected onRowClicked(event: { data: IExercise | undefined }): void {
    if (event.data) {
      this.state.openForm(event.data);
    }
  }

  protected onRetry(): void {
    this.state.loadExercises();
  }
}
