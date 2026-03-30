import { Component, OnInit, inject, input } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef, CellClickedEvent } from "ag-grid-community";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from "@angular/material/dialog";
import { DateTime } from "luxon";
import { InvitationsState } from "../../state/invitations.state";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import {
  ConfirmDialogComponent,
} from "../../../../shared/components/confirm-dialog/confirm-dialog.component";
import type { ConfirmDialogData } from "../../../../shared/components/confirm-dialog/confirm-dialog.component";
import { InviteFormComponent } from "../invite-form/invite-form.component";

@Component({
  selector: "app-invite-list",
  standalone: true,
  imports: [
    AgGridAngular,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    InviteFormComponent,
  ],
  templateUrl: "./invite-list.component.html",
  styleUrl: "./invite-list.component.scss",
})
export class InviteListComponent implements OnInit {

  orgId = input.required<string>();
  readonly state = inject(InvitationsState);
  private readonly dialog = inject(MatDialog);

  showForm = false;

  columnDefs: ColDef[] = [
    { field: "inviteeEmail", headerName: "Email", flex: 1 },
    { field: "inviterName", headerName: "Invited By", flex: 1 },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      valueFormatter: (p) => this.formatDate(p.value as string),
    },
    {
      field: "expiresAt",
      headerName: "Expires",
      flex: 1,
      valueFormatter: (p) => this.formatDate(p.value as string),
    },
    {
      headerName: "Actions",
      width: 120,
      cellRenderer: () => `<button class="grid-btn del-btn">Revoke</button>`,
      onCellClicked: (params: CellClickedEvent) => this.onRevoke(params),
    },
  ];

  ngOnInit(): void {
    this.state.loadInvitations(this.orgId());
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  private formatDate(iso: string): string {
    return DateTime.fromISO(iso).toLocaleString(DateTime.DATETIME_SHORT);
  }

  private onRevoke(params: CellClickedEvent): void {
    if (!params.data?.id) return;
    const data: ConfirmDialogData = {
      title: "Revoke Invitation",
      message: `Revoke invitation for ${params.data.inviteeEmail}?`,
      confirmText: "Revoke",
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { data, width: "400px" });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.state.deleteInvitation(params.data!.id!, this.orgId());
    });
  }
}
