import { Component, input, output } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-error-alert",
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: "./error-alert.component.html",
  styleUrl: "./error-alert.component.scss",
})
export class ErrorAlertComponent {

  readonly message = input.required<string>();
  readonly retryable = input<boolean>(true);
  readonly retry = output<void>();

  protected onRetry(): void {
    this.retry.emit();
  }
}
