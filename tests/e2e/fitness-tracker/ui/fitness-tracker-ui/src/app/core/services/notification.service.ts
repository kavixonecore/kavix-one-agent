import { Injectable, inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({ providedIn: "root" })
export class NotificationService {

  private readonly snackBar = inject(MatSnackBar);
  private readonly defaultDuration = 4000;

  success(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: this.defaultDuration,
      panelClass: ["snackbar-success"],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 6000,
      panelClass: ["snackbar-error"],
    });
  }

  warn(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: this.defaultDuration,
      panelClass: ["snackbar-warn"],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: this.defaultDuration,
      panelClass: ["snackbar-info"],
    });
  }
}
