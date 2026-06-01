import { Injectable, type OnDestroy, signal, inject, isDevMode, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, type Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OfflineService implements OnDestroy {
  readonly isOnline = signal(true);
  private onlineSub: Subscription | null = null;
  private offlineSub: Subscription | null = null;

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    this.isOnline.set(navigator.onLine);

    this.onlineSub = fromEvent(window, 'online').subscribe(() => {
      this.isOnline.set(true);
      if (isDevMode()) {
        console.log('OfflineService: connection restored');
      }
    });

    this.offlineSub = fromEvent(window, 'offline').subscribe(() => {
      this.isOnline.set(false);
      if (isDevMode()) {
        console.log('OfflineService: connection lost');
      }
    });
  }

  ngOnDestroy(): void {
    this.onlineSub?.unsubscribe();
    this.offlineSub?.unsubscribe();
  }
}
