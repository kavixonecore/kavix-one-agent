import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { OrganizationsState } from "../../state/organizations.state";
import { MemberListComponent } from "../../../members/components/member-list/member-list.component";
import { ConnectionListComponent } from "../../../connections/components/connection-list/connection-list.component";
import { InviteListComponent } from "../../../invitations/components/invite-list/invite-list.component";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";

@Component({
  selector: "app-org-detail",
  standalone: true,
  imports: [
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MemberListComponent,
    ConnectionListComponent,
    InviteListComponent,
    LoadingComponent,
  ],
  templateUrl: "./org-detail.component.html",
  styleUrl: "./org-detail.component.scss",
})
export class OrgDetailComponent implements OnInit {

  readonly state = inject(OrganizationsState);
  private readonly route = inject(ActivatedRoute);

  orgId = "";

  ngOnInit(): void {
    this.orgId = this.route.snapshot.paramMap.get("id") ?? "";
    if (this.orgId) {
      this.state.loadOrg(this.orgId);
    }
  }
}
