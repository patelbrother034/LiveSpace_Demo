import { Injectable, inject, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../constants/storage-keys.constants';
import { AppNotification } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);

  private allNotifications = signal<AppNotification[]>([]);

  userNotifications = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return [];
    return this.allNotifications()
      .filter(n => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  unreadCount = computed(() => {
    return this.userNotifications().filter(n => !n.isRead).length;
  });

  constructor() {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const stored = this.storage.getItem<AppNotification[]>(StorageKeys.NOTIFICATIONS) || [];
    this.allNotifications.set(stored);
  }

  addNotification(notification: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>): void {
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    const updated = [newNotif, ...this.allNotifications()];
    this.storage.setItem(StorageKeys.NOTIFICATIONS, updated);
    this.allNotifications.set(updated);
  }

  markAsRead(id: string): void {
    const updated = this.allNotifications().map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.storage.setItem(StorageKeys.NOTIFICATIONS, updated);
    this.allNotifications.set(updated);
  }

  markAllAsRead(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    const updated = this.allNotifications().map(n =>
      n.userId === user.id ? { ...n, isRead: true } : n
    );
    this.storage.setItem(StorageKeys.NOTIFICATIONS, updated);
    this.allNotifications.set(updated);
  }

  clearNotification(id: string): void {
    const updated = this.allNotifications().filter(n => n.id !== id);
    this.storage.setItem(StorageKeys.NOTIFICATIONS, updated);
    this.allNotifications.set(updated);
  }
}
