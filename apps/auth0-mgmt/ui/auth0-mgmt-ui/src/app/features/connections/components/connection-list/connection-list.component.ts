import { Component, OnInit, inject, input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { ConnectionsState } from "../../state/connections.state";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";
import { ConnectionToggleComponent } from "../connection-toggle/connection-toggle.component";

@Component({
  selector: "app-connection-list",
  standalone: true,
  imports: [
    MatCardModule,
    MatSlideToggleModule,
    MatChipsModule,
    LoadingComponent,
    ConnectionToggleComponent,
  ],
  templateUrl: "./connection-list.component.html",
  styleUrl: "./connection-list.component.scss",
})
export class ConnectionListComponent implements OnInit {

  orgId = input.required<string>();
  readonly state = inject(ConnectionsState);

  ngOnInit(): void {
    this.state.loadAllConnections();
    this.state.loadOrgConnections(this.orgId());
  }
}
