import { Component, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileHeader } from './mobile-header/mobile-header';
import { BottomNav } from './bottom-nav/bottom-nav';
import { Sidebar } from '../main-layout/sidebar/sidebar';
import { NotificationPanel } from '../../shared/components/notification-panel/notification-panel';

@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  imports: [RouterOutlet, MobileHeader, BottomNav, Sidebar, NotificationPanel],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pt-14 pb-16 flex flex-col transition-colors duration-300 md:hidden">
      <!-- Mobile Header -->
      <app-mobile-header (toggleSidebar)="toggleMenu()" (openNotifications)="openNotifs()" />

      <!-- Sliding Menu (Sidebar Drawer) -->
      @if (menuOpen()) {
        <div class="fixed inset-0 z-50 flex">
          <!-- Overlay Backdrop -->
          <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300" 
               (click)="closeMenu()"></div>
          
          <!-- Slide Panel -->
          <div class="relative w-72 bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-in">
            <app-sidebar [collapsed]="false" (toggleCollapse)="closeMenu()" />
          </div>
        </div>
      }

      <!-- Main Body content -->
      <main class="flex-1 overflow-y-auto p-4">
        <router-outlet />
      </main>

      <!-- Bottom Nav -->
      <app-bottom-nav />

      <!-- Notification Drawer -->
      <app-notification-panel #notifPanel />
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class MobileLayout {
  menuOpen = signal(false);
  notifPanel = viewChild<NotificationPanel>('notifPanel');

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  openNotifs() {
    this.notifPanel()?.show();
  }
}
