import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService, Notification } from './api.service';

@Component({
  selector: 'app-notification-bell',
  imports: [DatePipe],
  template: `
    <div class="bell-wrap">
      <button class="bell" (click)="toggle()" title="Notifications">
        🔔
        @if (unread() > 0) { <span class="dot">{{ unread() }}</span> }
      </button>
      @if (open()) {
        <div class="bell-panel glass">
          <div class="bell-head">
            <span>Notifications</span>
            <button (click)="markAllRead()">Mark all read</button>
          </div>
          @if (notifications().length === 0) {
            <p class="empty" style="border:none">Nothing yet.</p>
          }
          @for (n of notifications(); track n.id) {
            <div class="notif" [class.unread]="!n.read" (click)="markRead(n)">
              <span class="n-icon">{{ iconFor(n.type) }}</span>
              <div>
                <div class="n-msg">{{ n.message }}</div>
                <div class="n-time">{{ n.createdAt | date:'MMM d, h:mm a' }}</div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationBell {
  private api = inject(ApiService);
  notifications = signal<Notification[]>([]);
  open = signal(false);
  unread = computed(() => this.notifications().filter(n => !n.read).length);

  constructor() {
    this.load();
  }

  toggle() {
    this.open.update(v => !v);
    if (this.open()) this.load();
  }

  load() {
    this.api.getNotifications().subscribe({ next: ns => this.notifications.set(ns), error: () => {} });
  }

  markRead(n: Notification) {
    if (n.read) return;
    this.api.markNotificationRead(n.id).subscribe({
      next: () => this.notifications.update(l => l.map(x => x.id === n.id ? { ...x, read: true } : x)),
      error: () => {},
    });
  }

  markAllRead() {
    this.api.markAllNotificationsRead().subscribe({
      next: () => this.notifications.update(l => l.map(x => ({ ...x, read: true }))),
      error: () => {},
    });
  }

  iconFor(type: string): string {
    switch (type) {
      case 'POSTING_APPROVED': return '✅';
      case 'POSTING_REJECTED': return '⛔';
      case 'POSTING_CLOSED': return '⏰';
      case 'NEW_APPLICATION': return '📥';
      default: return '🔔';
    }
  }
}
