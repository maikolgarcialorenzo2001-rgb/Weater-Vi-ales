import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isLight = signal(false);
  private readonly STORAGE_KEY = 'climaLightMode';

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'true') {
        this.isLight.set(true);
        this.applyTheme();
      }
      effect(() => this.applyTheme());
    }
  }

  toggle(): void {
    this.isLight.update(v => !v);
    localStorage.setItem(this.STORAGE_KEY, String(this.isLight()));
  }

  private applyTheme(): void {
    if (this.isLight()) {
      document.documentElement.classList.add('light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc');
    } else {
      document.documentElement.classList.remove('light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a');
    }
  }
}
