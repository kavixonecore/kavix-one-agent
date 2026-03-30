import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { AppState } from "../../../state-management";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: "./navbar.component.html",
  styleUrl: "./navbar.component.scss",
})
export class NavbarComponent {

  protected readonly appState = inject(AppState);

  protected readonly navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { path: "/workouts", label: "Workouts", icon: "fitness_center" },
    { path: "/exercises", label: "Exercises", icon: "sports_gymnastics" },
    { path: "/running", label: "Running", icon: "directions_run" },
    { path: "/progress", label: "Progress", icon: "trending_up" },
  ];
}
