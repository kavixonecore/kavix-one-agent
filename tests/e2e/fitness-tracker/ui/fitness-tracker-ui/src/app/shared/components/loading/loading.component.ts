import { Component, input } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-loading",
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: "./loading.component.html",
  styleUrl: "./loading.component.scss",
})
export class LoadingComponent {

  readonly message = input<string>("Loading...");
  readonly diameter = input<number>(48);
}
