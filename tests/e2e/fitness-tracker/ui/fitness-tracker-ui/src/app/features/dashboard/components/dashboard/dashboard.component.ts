import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { NgxChartsModule, ScaleType } from "@swimlane/ngx-charts";
import type { Color } from "@swimlane/ngx-charts";
import { DashboardState } from "../../state/dashboard.state";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ErrorAlertComponent } from "../../../../shared/components/error-alert/error-alert.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    NgxChartsModule,
    LoadingComponent,
    ErrorAlertComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {

  protected readonly state = inject(DashboardState);

  protected readonly barColorScheme: Color = {
    name: "bar",
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ["#5AA454", "#A10A28", "#C7B42C", "#AAAAAA"],
  };
  protected readonly pieColorScheme: Color = {
    name: "pie",
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ["#5AA454", "#E44D25", "#CFC0BB", "#7aa3e5", "#a8385d"],
  };

  ngOnInit(): void {
    this.state.loadAll();
  }

  protected onRetry(): void {
    this.state.loadAll();
  }
}
