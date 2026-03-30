import { Component, OnInit, inject } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RolesState } from "../../state/roles.state";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { RoleFormComponent } from "../role-form/role-form.component";

@Component({
  selector: "app-role-list",
  standalone: true,
  imports: [
    AgGridAngular,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    RoleFormComponent,
  ],
  templateUrl: "./role-list.component.html",
  styleUrl: "./role-list.component.scss",
})
export class RoleListComponent implements OnInit {

  readonly state = inject(RolesState);
  showForm = false;

  columnDefs: ColDef[] = [
    { field: "name", headerName: "Name", flex: 1, filter: true },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "id", headerName: "ID", flex: 1 },
  ];

  ngOnInit(): void {
    this.state.loadRoles();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }
}
