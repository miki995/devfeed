import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string, now: number = Date.now()): string {
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) {
      return '';
    }
    const seconds = Math.max(0, Math.floor((now - then) / 1000));
    if (seconds < 60) {
      return 'just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    if (days < 30) {
      return `${days}d`;
    }
    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months}mo`;
    }
    return `${Math.floor(months / 12)}y`;
  }
}
