import type { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/components/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "workouts",
    loadComponent: () =>
      import("./features/workouts/components/workout-list/workout-list.component").then(
        (m) => m.WorkoutListComponent,
      ),
  },
  {
    path: "exercises",
    loadComponent: () =>
      import("./features/exercises/components/exercise-list/exercise-list.component").then(
        (m) => m.ExerciseListComponent,
      ),
  },
  {
    path: "running",
    loadComponent: () =>
      import("./features/running/components/running-list/running-list.component").then(
        (m) => m.RunningListComponent,
      ),
  },
  {
    path: "progress",
    loadComponent: () =>
      import("./features/progress/components/progress-list/progress-list.component").then(
        (m) => m.ProgressListComponent,
      ),
  },
  {
    path: "auth/login",
    loadComponent: () =>
      import("./features/auth/components/dev-login/dev-login.component").then(
        (m) => m.DevLoginComponent,
      ),
  },
  {
    path: "**",
    redirectTo: "dashboard",
  },
];
