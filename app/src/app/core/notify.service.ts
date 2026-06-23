import { Injectable, effect, inject, signal } from '@angular/core';
import { FeedGlobalStateService } from './feed.state';

function currentPermission(): NotificationPermission {
  return typeof Notification === 'undefined' ? 'denied' : Notification.permission;
}

@Injectable({ providedIn: 'root' })
export class ReleaseNotificationService {
  private readonly state = inject(FeedGlobalStateService);
  private readonly notified = new Set<string>();
  readonly permission = signal<NotificationPermission>(currentPermission());

  constructor() {
    effect(() => {
      if (this.permission() !== 'granted') {
        return;
      }
      const newIds = this.state.newArticleIds();
      for (const release of this.state.latestReleases()) {
        if (newIds.has(release.id) && !this.notified.has(release.id)) {
          this.notified.add(release.id);
          new Notification(`${release.sourceName} — new release`, { body: release.title });
        }
      }
    });
  }

  enable(): void {
    if (typeof Notification === 'undefined') {
      return;
    }
    Notification.requestPermission().then((result) => this.permission.set(result));
  }
}
