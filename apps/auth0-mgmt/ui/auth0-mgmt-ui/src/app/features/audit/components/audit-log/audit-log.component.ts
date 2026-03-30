import { Component, OnInit, inject } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { DateTime } from "luxon";
import { AuditState } from "../../state/audit.state";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";

@Component({
  selector: "app-audit-log",
  standalone: true,
  imports: [
    AgGridAngular,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
  ],
  templateUrl: "./audit-log.component.html",
  styleUrl: "./audit-log.component.scss",
})
export class AuditLogComponent implements OnInit {

  readonly state = inject(AuditState);
  private readonly fb = inject(FormBuilder);

  readonly filterForm = this.fb.nonNullable.group({
    orgId: [""],
    userId: [""],
    event: [""],
    startDate: [""],
    endDate: [""],
  });

  columnDefs: ColDef[] = [
    {
      field: "timestamp",
      headerName: "Time",
      flex: 1,
      valueFormatter: (p) => this.formatDate(p.value as string),
      sort: "desc",
    },
    { field: "event", headerName: "Event", flex: 1, filter: true },
    { field: "method", headerName: "Method", width: 100 },
    { field: "path", headerName: "Path", flex: 1 },
    { field: "statusCode", headerName: "Status", width: 100 },
    { field: "ip", headerName: "IP", width: 140 },
    { field: "sub", headerName: "User", flex: 1 },
    { field: "reason", headerName: "Reason", flex: 1 },
  ];

  ngOnInit(): void {
    this.state.loadLogs();
  }

  applyFilters(): void {
    this.state.updateFilters(this.filterForm.getRawValue());
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.state.resetFilters();
  }

  private formatDate(iso: string): string {
    if (!iso) return "";
    return DateTime.fromISO(iso).toLocaleString(DateTime.DATETIME_SHORT);
  }
}
