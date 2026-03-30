import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef, GridReadyEvent, CellClickedEvent } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { OrganizationsState } from "../../state/organizations.state";
import { OrgFormComponent } from "../org-form/org-form.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import {
  ConfirmDialogComponent,
} from "../../../../shared/components/confirm-dialog/confirm-dialog.component";
import type { ConfirmDialogData } from "../../../../shared/components/confirm-dialog/confirm-dialog.component";

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: "app-org-list",
  standalone: true,
  imports: [AgGridAngular, MatButtonModule, MatIconModule, LoadingComponent, OrgFormComponent],
  templateUrl: "./org-list.component.html",
  styleUrl: "./org-list.component.scss",
})
export class OrgListComponent implements OnInit {

  readonly state = inject(OrganizationsState);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  showForm = false;

  columnDefs: ColDef[] = [
    { field: "name", headerName: "Name", flex: 1, filter: true },
    { field: "displayName", headerName: "Display Name", flex: 1, filter: true },
    { field: "id", headerName: "ID", flex: 1 },
    {
      headerName: "Actions",
      width: 160,
      cellRenderer: () => `<button class="grid-btn view-btn">View</button> <button class="grid-btn del-btn">Delete</button>`,
      onCellClicked: (params: CellClickedEvent) => this.onActionClick(params),
    },
  ];

  defaultColDef: ColDef = { sortable: true, resizable: true };

  ngOnInit(): void {
    this.state.loadOrgs();
  }

  onGridReady(_event: GridReadyEvent): void {
    // grid ready
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  private onActionClick(params: CellClickedEvent): void {
    const target = params.event?.target as HTMLElement | undefined;
    if (!target || !params.data) return;

    if (target.classList.contains("view-btn")) {
      this.router.navigate(["/organizations", params.data.id]);
    } else if (target.classList.contains("del-btn")) {
      this.confirmDelete(params.data.id ?? "", params.data.name ?? "");
    }
  }

  private confirmDelete(id: string, name: string): void {
    const data: ConfirmDialogData = {
      title: "Delete Organization",
      message: `Are you sure you want to delete "${name}"?`,
      confirmText: "Delete",
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data, width: "400px" });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.state.deleteOrg(id);
    });
  }
}
