import { Component, output, inject } from '@angular/core';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [Avatar, ThemeToggle],
  template: `
    <header class="h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40 md:hidden">
      <!-- Menu Button -->
      <button (click)="toggleSidebar.emit()"
              class="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
        <i class="pi pi-bars text-lg"></i>
      </button>

      <!-- App Title -->
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow shadow-indigo-500/20">
          <i class="pi pi-building text-white text-xs"></i>
        </div>
        <span class="text-sm font-bold text-slate-800 dark:text-white">LiveSpace Pro</span>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-1">
        <app-theme-toggle />
        
        <!-- Notification Bell -->
        <button (click)="openNotifications.emit()"
                class="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
          <i class="pi pi-bell text-base"></i>
          <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
        </button>

        <!-- User Avatar -->
        <app-avatar [name]="userName" size="sm" [online]="true" class="ml-1" />
      </div>
    </header>
  `,
  styles: []
})
export class MobileHeader {
  toggleSidebar = output<void>();
  openNotifications = output<void>();

  private auth = inject(AuthService);
  userName = this.auth.currentUser()?.name || 'Demo User';
}
