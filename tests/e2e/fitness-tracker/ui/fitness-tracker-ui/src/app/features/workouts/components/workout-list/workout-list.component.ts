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
import { WorkoutsState } from "../../state/workouts.state";
import { WorkoutFormComponent } from "../workout-form/workout-form.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ErrorAlertComponent } from "../../../../shared/components/error-alert/error-alert.component";
import { WorkoutType, WorkoutStatus } from "../../../../interfaces";
import type { IWorkout } from "../../../../interfaces";

@Component({
  selector: "app-workout-list",
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
    WorkoutFormComponent,
    LoadingComponent,
    ErrorAlertComponent,
  ],
  templateUrl: "./workout-list.component.html",
  styleUrl: "./workout-list.component.scss",
})
export class WorkoutListComponent implements OnInit {

  protected readonly state = inject(WorkoutsState);
  private readonly fb = inject(FormBuilder);

  protected readonly filterForm: FormGroup = this.fb.group({
    startDate: [""],
    endDate: [""],
    status: [""],
    workoutType: [""],
  });

  protected readonly workoutTypes = Object.values(WorkoutType);
  protected readonly workoutStatuses = Object.values(WorkoutStatus);

  protected readonly columnDefs: ColDef<IWorkout>[] = [
    { field: "name", headerName: "Name", flex: 2 },
    { field: "workoutType", headerName: "Type", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "durationMinutes", headerName: "Duration (min)", flex: 1 },
  ];

  protected readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  ngOnInit(): void {
    this.state.loadWorkouts();
  }

  protected onFilter(): void {
    const values = this.filterForm.value as Record<string, string>;
    const query: Record<string, string> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val) {
        query[key] = val;
      }
    }
    this.state.loadWorkouts(query);
  }

  protected onClear(): void {
    this.filterForm.reset();
    this.state.loadWorkouts();
  }

  protected onEdit(workout: IWorkout): void {
    this.state.openForm(workout);
  }

  protected onDelete(workout: IWorkout): void {
    if (confirm(`Delete workout "${workout.name}"?`)) {
      this.state.deleteWorkout(workout.id);
    }
  }

  protected onRowClicked(event: { data: IWorkout | undefined }): void {
    if (event.data) {
      this.state.openForm(event.data);
    }
  }

  protected onRetry(): void {
    this.state.loadWorkouts();
  }
}
