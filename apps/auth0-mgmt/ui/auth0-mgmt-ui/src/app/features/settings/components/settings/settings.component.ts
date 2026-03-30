import { Component, OnInit, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { SettingsState } from "../../state/settings.state";
import { LoadingComponent } from "../../../../shared/components/loading/loading.component";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    LoadingComponent,
  ],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent implements OnInit {

  readonly state = inject(SettingsState);

  ngOnInit(): void {
    this.state.loadHealth();
  }

  refresh(): void {
    this.state.loadHealth();
  }

  formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  }
}
