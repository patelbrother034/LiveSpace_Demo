import { Component, output, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SearchBar } from '../../../shared/components/search-bar/search-bar';
import { ThemeToggle } from '../../../shared/components/theme-toggle/theme-toggle';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SearchBar, ThemeToggle, Avatar],
  template: `
    <header class="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between px-6 shrink-0 z-30">
      <!-- Left: Hamburger + Search -->
      <div class="flex items-center gap-4">
        <button (click)="toggleSidebar.emit()"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                title="Toggle Sidebar">
          <i class="pi pi-bars text-lg"></i>
        </button>
        <app-search-bar />
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">
        <app-theme-toggle />

        <!-- Switch Workspace/Role Button -->
        <button (click)="switchRole()"
                title="Switch Workspace / Role"
                class="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
          <i class="pi pi-sync text-lg"></i>
        </button>

        <!-- Notification Bell -->
        <button (click)="openNotifications.emit()"
                title="Notifications"
                class="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
          <i class="pi pi-bell text-lg"></i>
          <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
        </button>

        <!-- User -->
        <div class="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700">
          <div class="hidden md:block text-right">
            <p class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ userName() }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ userRole() }}</p>
          </div>
          <app-avatar [name]="userName()" size="sm" [online]="true" />
        </div>
      </div>
    </header>
  `,
  styles: ``
})
export class Header {
  toggleSidebar = output<void>();
  openNotifications = output<void>();

  private auth = inject(AuthService);
  private router = inject(Router);

  userName = computed(() => this.auth.currentUser()?.name || 'Demo User');
  userRole = computed(() => this.auth.currentUser()?.role || 'Owner');

  switchRole() {
    this.router.navigate(['/auth/role-select']);
  }
}
