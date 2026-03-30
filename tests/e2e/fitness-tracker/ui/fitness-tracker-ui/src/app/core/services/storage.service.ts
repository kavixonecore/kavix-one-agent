import { Injectable } from "@angular/core";

const APP_PREFIX = "app-";

@Injectable({ providedIn: "root" })
export class StorageService {

  getItem(key: string): string | null {
    return localStorage.getItem(this.prefixKey(key));
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(this.prefixKey(key), value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefixKey(key));
  }

  getRaw(key: string): string | null {
    return localStorage.getItem(key);
  }

  setRaw(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeRaw(key: string): void {
    localStorage.removeItem(key);
  }

  private prefixKey(key: string): string {
    if (key.startsWith(APP_PREFIX)) {
      return key;
    }
    return `${APP_PREFIX}${key}`;
  }
}
