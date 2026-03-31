import type { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    loadComponent: () =>
      import("./features/dashboard/components/dashboard/dashboard.component")
        .then((m) => m.DashboardComponent),
  },
  {
    path: "organizations",
    loadComponent: () =>
      import("./features/organizations/components/org-list/org-list.component")
        .then((m) => m.OrgListComponent),
  },
  {
    path: "organizations/:id",
    loadComponent: () =>
      import("./features/organizations/components/org-detail/org-detail.component")
        .then((m) => m.OrgDetailComponent),
  },
  {
    path: "roles",
    loadComponent: () =>
      import("./features/roles/components/role-list/role-list.component")
        .then((m) => m.RoleListComponent),
  },
  {
    path: "audit",
    loadComponent: () =>
      import("./features/audit/components/audit-log/audit-log.component")
        .then((m) => m.AuditLogComponent),
  },
  {
    path: "settings",
    loadComponent: () =>
      import("./features/settings/components/settings/settings.component")
        .then((m) => m.SettingsComponent),
  },
  { path: "**", redirectTo: "dashboard" },
];
