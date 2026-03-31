import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@auth0/auth0-angular";
import { filter, map, switchMap, take } from "rxjs";
import type { CanActivateFn } from "@angular/router";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoading$.pipe(
    filter((loading) => !loading),
    take(1),
    switchMap(() => auth.isAuthenticated$),
    take(1),
    map((isAuth) => isAuth || router.createUrlTree(["/auth/login"])),
  );
};
