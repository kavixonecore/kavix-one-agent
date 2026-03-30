import { Component, OnInit, inject, input } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef, CellClickedEvent } from "ag-grid-community";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { MembersState } from "../../state/members.state";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import {
  ConfirmDialogComponent,
} from "../../../../shared/components/confirm-dialog/confirm-dialog.component";
import type { ConfirmDialogData } from "../../../../shared/components/confirm-dialog/confirm-dialog.component";
import { MemberFormComponent } from "../member-form/member-form.component";
import { RoleAssignComponent } from "../role-assign/role-assign.component";

@Component({
  selector: "app-member-list",
  standalone: true,
  imports: [
    AgGridAngular,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    MemberFormComponent,
    RoleAssignComponent,
  ],
  templateUrl: "./member-list.component.html",
  styleUrl: "./member-list.component.scss",
})
export class MemberListComponent implements OnInit {

  orgId = input.required<string>();

  readonly state = inject(MembersState);
  private readonly dialog = inject(MatDialog);

  showForm = false;
  selectedUserId: string | null = null;

  columnDefs: ColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "userId", headerName: "User ID", flex: 1 },
    {
      headerName: "Actions",
      width: 200,
      cellRenderer: () => `<button class="grid-btn role-btn">Roles</button> <button class="grid-btn del-btn">Remove</button>`,
      onCellClicked: (params: CellClickedEvent) => this.onActionClick(params),
    },
  ];

  ngOnInit(): void {
    this.state.loadMembers(this.orgId());
    this.state.loadAllRoles();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  selectMemberForRoles(userId: string): void {
    this.selectedUserId = this.selectedUserId === userId ? null : userId;
    if (this.selectedUserId) {
      this.state.loadMemberRoles(this.orgId(), userId);
    }
  }

  private onActionClick(params: CellClickedEvent): void {
    const target = params.event?.target as HTMLElement | undefined;
    if (!target || !params.data) return;

    if (target.classList.contains("del-btn")) {
      this.confirmRemove(params.data.userId ?? "", params.data.name ?? "");
    } else if (target.classList.contains("role-btn")) {
      this.selectMemberForRoles(params.data.userId ?? "");
    }
  }

  private confirmRemove(userId: string, name: string): void {
    const data: ConfirmDialogData = {
      title: "Remove Member",
      message: `Remove "${name || userId}" from this organization?`,
      confirmText: "Remove",
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data, width: "400px" });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.state.removeMember(this.orgId(), userId);
    });
  }
}
