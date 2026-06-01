import { Component, inject } from '@angular/core';
import { OfflineService } from '../../services/offline.service';

@Component({
  selector: 'app-offline-banner',
  templateUrl: './offline-banner.html',
})
export class OfflineBanner {
  private readonly offline = inject(OfflineService);
  readonly isOnline = this.offline.isOnline;
}
