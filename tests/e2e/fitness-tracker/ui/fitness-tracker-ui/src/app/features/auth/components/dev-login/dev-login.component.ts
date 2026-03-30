import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { StorageService } from "../../../../core/services/storage.service";
import { NotificationService } from "../../../../core/services/notification.service";
import { STORAGE_KEYS } from "../../../../core/constants/storage-keys";

@Component({
  selector: "app-dev-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: "./dev-login.component.html",
  styleUrl: "./dev-login.component.scss",
})
export class DevLoginComponent {

  private readonly storage = inject(StorageService);
  private readonly notify = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  protected readonly form: FormGroup = this.fb.group({
    token: [""],
  });

  protected get currentToken(): string | null {
    return this.storage.getRaw(STORAGE_KEYS.ACCESS_TOKEN);
  }

  protected get hasToken(): boolean {
    return this.currentToken !== null && this.currentToken !== "";
  }

  protected onSave(): void {
    const token = (this.form.get("token")?.value as string)?.trim();
    if (token) {
      this.storage.setRaw(STORAGE_KEYS.ACCESS_TOKEN, token);
      this.notify.success("Token saved");
    }
  }

  protected onClear(): void {
    this.storage.removeRaw(STORAGE_KEYS.ACCESS_TOKEN);
    this.form.reset();
    this.notify.info("Token cleared");
  }
}
