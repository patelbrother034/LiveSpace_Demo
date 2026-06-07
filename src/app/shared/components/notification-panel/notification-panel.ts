import { Component, input, output, signal } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-notification-panel',
  imports: [DrawerModule, ButtonModule],
  template: `
    <p-drawer [(visible)]="isVisible" position="right" [style]="{ width: '380px' }" header="Notifications">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ unreadCount() }} unread</span>
        <p-button label="Mark all read" [text]="true" size="small" (onClick)="markAllRead()"></p-button>
      </div>

      <div class="space-y-2">
        @for (notification of notifications(); track notification.id) {
          <div class="flex gap-3 p-3 rounded-xl transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
               [class.bg-indigo-50]="!notification.read"
               [class.dark:bg-indigo-900/20]="!notification.read">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 [class]="notification.iconBg">
              <i [class]="'pi ' + notification.icon + ' text-white text-sm'"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ notification.title }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{{ notification.message }}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ notification.time }}</p>
            </div>
            @if (!notification.read) {
              <div class="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0"></div>
            }
          </div>
        }
      </div>
    </p-drawer>
  `,
  styles: ``
})
export class NotificationPanel {
  isVisible = false;
  visibleChange = output<boolean>();

  notifications = signal([
    { id: 1, icon: 'pi-indian-rupee', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600', title: 'Rent Collected', message: 'Rahul Sharma paid ₹8,500 for Room 201', time: '2 min ago', read: false },
    { id: 2, icon: 'pi-wrench', iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600', title: 'Maintenance Request', message: 'AC not working in Room 305 - reported by Priya', time: '15 min ago', read: false },
    { id: 3, icon: 'pi-user-plus', iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600', title: 'New Tenant Added', message: 'Amit Kumar assigned to Bed B2, Room 104', time: '1 hour ago', read: false },
    { id: 4, icon: 'pi-exclamation-triangle', iconBg: 'bg-gradient-to-br from-red-500 to-rose-600', title: 'Rent Overdue', message: '3 tenants have overdue payments this month', time: '3 hours ago', read: true },
    { id: 5, icon: 'pi-calendar', iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600', title: 'Lease Expiring', message: '5 leases expiring in the next 30 days', time: '5 hours ago', read: true },
    { id: 6, icon: 'pi-check-circle', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600', title: 'Ticket Resolved', message: 'Plumbing issue in Room 412 has been resolved', time: '1 day ago', read: true },
  ]);

  unreadCount = signal(3);

  show() {
    this.isVisible = true;
  }

  markAllRead() {
    this.notifications.update(items =>
      items.map(n => ({ ...n, read: true }))
    );
    this.unreadCount.set(0);
  }
}
