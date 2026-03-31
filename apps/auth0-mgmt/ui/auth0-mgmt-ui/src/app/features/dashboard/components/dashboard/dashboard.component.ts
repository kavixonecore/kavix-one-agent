import { Component, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { DashboardState } from "../../state/dashboard.state";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [RouterLink, MatIconModule, LoadingComponent],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {

  readonly state = inject(DashboardState);

  ngOnInit(): void {
    this.state.loadDashboard();
  }
}
