import type { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "dashboard",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/dashboard/components/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: "workouts",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/workouts/components/workout-list/workout-list.component").then(
        (m) => m.WorkoutListComponent,
      ),
  },
  {
    path: "exercises",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/exercises/components/exercise-list/exercise-list.component").then(
        (m) => m.ExerciseListComponent,
      ),
  },
  {
    path: "running",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./features/running/components/running-list/running-list.component").then(
        (m) => m.RunningListComponent,
      ),
  },
  {
    path: "progress",
    canActivate: [authGuard],
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
