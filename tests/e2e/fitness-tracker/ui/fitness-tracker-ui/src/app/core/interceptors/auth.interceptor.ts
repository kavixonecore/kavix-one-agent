import { inject } from "@angular/core";
import type { HttpInterceptorFn } from "@angular/common/http";
import { StorageService } from "../services/storage.service";
import { STORAGE_KEYS } from "../constants/storage-keys";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const token = storage.getRaw(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
