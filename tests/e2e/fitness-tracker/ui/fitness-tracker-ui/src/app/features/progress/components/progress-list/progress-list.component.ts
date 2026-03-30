import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { NgxChartsModule, ScaleType } from "@swimlane/ngx-charts";
import type { Color } from "@swimlane/ngx-charts";
import { AgGridModule } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { ProgressState } from "../../state/progress.state";
import { ProgressFormComponent } from "../progress-form/progress-form.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ErrorAlertComponent } from "../../../../shared/components/error-alert/error-alert.component";
import type { IProgressMetric } from "../../../../interfaces";

@Component({
  selector: "app-progress-list",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgxChartsModule,
    AgGridModule,
    ProgressFormComponent,
    LoadingComponent,
    ErrorAlertComponent,
  ],
  templateUrl: "./progress-list.component.html",
  styleUrl: "./progress-list.component.scss",
})
export class ProgressListComponent implements OnInit {

  protected readonly state = inject(ProgressState);

  protected readonly lineColorScheme: Color = {
    name: "line",
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ["#5AA454", "#E44D25"],
  };

  protected readonly columnDefs: ColDef<IProgressMetric>[] = [
    { field: "metricType", headerName: "Type", flex: 1 },
    { field: "value", headerName: "Value", flex: 1 },
    { field: "unit", headerName: "Unit", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "customMetricName", headerName: "Custom Name", flex: 1 },
    { field: "notes", headerName: "Notes", flex: 1 },
  ];

  protected readonly defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  ngOnInit(): void {
    this.state.loadAll();
  }

  protected onRetry(): void {
    this.state.loadAll();
  }

  protected onRowClicked(event: { data: IProgressMetric | undefined }): void {
    if (event.data) {
      this.state.openForm(event.data);
    }
  }
}
