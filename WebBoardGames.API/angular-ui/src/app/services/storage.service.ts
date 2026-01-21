import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  setString(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(key, value);
  }

  getString(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(key);
  }

  setObject<T>(key: string, value: T|null): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }

  getObject<T>(key: string, defaultValue: T | null = null): T | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  }
}
