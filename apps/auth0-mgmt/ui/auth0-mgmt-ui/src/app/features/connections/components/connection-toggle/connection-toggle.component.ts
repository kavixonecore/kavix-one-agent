import { Component, inject, input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatChipsModule } from "@angular/material/chips";
import { ConnectionsState } from "../../state/connections.state";

@Component({
  selector: "app-connection-toggle",
  standalone: true,
  imports: [MatCardModule, MatSlideToggleModule, MatChipsModule],
  templateUrl: "./connection-toggle.component.html",
  styleUrl: "./connection-toggle.component.scss",
})
export class ConnectionToggleComponent {

  orgId = input.required<string>();
  connectionId = input.required<string>();
  name = input.required<string>();
  strategy = input.required<string>();
  enabled = input.required<boolean>();
  assignMembershipOnLogin = input.required<boolean>();

  private readonly state = inject(ConnectionsState);

  onEnabledToggle(checked: boolean): void {
    if (checked) {
      this.state.enableConnection(this.orgId(), this.connectionId(), this.assignMembershipOnLogin());
    } else {
      this.state.disableConnection(this.orgId(), this.connectionId());
    }
  }

  onAutoMembershipToggle(checked: boolean): void {
    if (this.enabled()) {
      this.state.enableConnection(this.orgId(), this.connectionId(), checked);
    }
  }
}
