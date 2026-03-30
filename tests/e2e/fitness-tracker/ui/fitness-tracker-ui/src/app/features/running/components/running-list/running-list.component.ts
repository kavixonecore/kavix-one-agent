import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { NgxChartsModule, ScaleType } from "@swimlane/ngx-charts";
import type { Color } from "@swimlane/ngx-charts";
import { AgGridModule } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { RunningState } from "../../state/running.state";
import { RunningFormComponent } from "../running-form/running-form.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ErrorAlertComponent } from "../../../../shared/components/error-alert/error-alert.component";
import type { IRunningLog } from "../../../../interfaces";

@Component({
  selector: "app-running-list",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NgxChartsModule,
    AgGridModule,
    RunningFormComponent,
    LoadingComponent,
    ErrorAlertComponent,
  ],
  templateUrl: "./running-list.component.html",
  styleUrl: "./running-list.component.scss",
})
export class RunningListComponent implements OnInit {

  protected readonly state = inject(RunningState);

  protected readonly lineColorScheme: Color = {
    name: "line",
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ["#5AA454"],
  };

  protected readonly columnDefs: ColDef<IRunningLog>[] = [
    { field: "createdAt", headerName: "Date", flex: 1,
      valueFormatter: (p) => (p.value as string)?.slice(0, 10) ?? "" },
    { field: "distanceMiles", headerName: "Distance (mi)", flex: 1 },
    { field: "durationMinutes", headerName: "Duration (min)", flex: 1 },
    { field: "paceMinutesPerMile", headerName: "Pace (min/mi)", flex: 1,
      valueFormatter: (p) => (p.value as number)?.toFixed(2) ?? "" },
    { field: "routeName", headerName: "Route", flex: 1 },
    { field: "weather", headerName: "Weather", flex: 1 },
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

  protected onRowClicked(event: { data: IRunningLog | undefined }): void {
    if (event.data) {
      this.state.openForm(event.data);
    }
  }
}
