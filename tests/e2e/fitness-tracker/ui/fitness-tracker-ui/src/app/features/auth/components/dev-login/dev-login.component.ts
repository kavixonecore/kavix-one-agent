import { Component, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "@auth0/auth0-angular";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { environment } from "../../../../../environments/environment";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./dev-login.component.html",
  styleUrl: "./dev-login.component.scss",
})
export class DevLoginComponent {

  private readonly auth = inject(AuthService);
  readonly isLoading = signal(false);

  loginWithGoogle(): void {
    this.redirectWithConnection("google-oauth2");
  }

  loginWithGitHub(): void {
    this.redirectWithConnection("github");
  }

  loginWithApple(): void {
    this.redirectWithConnection("apple");
  }

  loginWithMicrosoft(): void {
    this.redirectWithConnection("windowslive");
  }

  loginDefault(): void {
    this.isLoading.set(true);
    this.auth.loginWithRedirect({
      authorizationParams: {
        organization: environment.auth0.organizationId,
      },
    });
  }

  private redirectWithConnection(connection: string): void {
    this.isLoading.set(true);
    this.auth.loginWithRedirect({
      authorizationParams: {
        organization: environment.auth0.organizationId,
        connection,
      },
    });
  }
}
