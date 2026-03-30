import { Component, inject } from "@angular/core";
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: "app-confirm-dialog",
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: "./confirm-dialog.component.html",
  styleUrl: "./confirm-dialog.component.scss",
})
export class ConfirmDialogComponent {

  readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
