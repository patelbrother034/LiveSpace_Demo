import { Component, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { NotificationPanel } from '../../shared/components/notification-panel/notification-panel';
import { QuickNavigator } from '../../shared/components/quick-navigator/quick-navigator';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Header, Footer, NotificationPanel, QuickNavigator],
  template: `
    <div class="flex h-screen bg-[var(--surface-ground)] dark:bg-slate-900 transition-colors duration-300">
      <!-- Sidebar -->
      <app-sidebar [collapsed]="sidebarCollapsed()" (toggleCollapse)="toggleSidebar()" />

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
           [style.margin-left]="sidebarCollapsed() ? '72px' : '272px'">
        <app-header (toggleSidebar)="toggleSidebar()" (openNotifications)="openNotifs()" />
        <div class="flex-1 overflow-y-auto flex flex-col">
          <main class="flex-1 p-6 bg-[var(--surface-ground)] dark:bg-slate-900">
            <router-outlet />
          </main>
          <app-footer />
        </div>
      </div>

      <!-- Notification Panel -->
      <app-notification-panel #notifPanel />

      <!-- Floating Universal Quick Navigator -->
      <app-quick-navigator />
    </div>
  `,
  styles: ``
})
export class MainLayout {
  sidebarCollapsed = signal(false);
  notifPanel = viewChild<NotificationPanel>('notifPanel');

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  openNotifs() {
    this.notifPanel()?.show();
  }
}
