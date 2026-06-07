import { Component, input, output, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NavigationService } from '../../../core/services/navigation.service';
import { Avatar } from '../../../shared/components/avatar/avatar';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Avatar],
  template: `
    <aside class="fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 border-r border-slate-200/60 dark:border-slate-700/60"
           [style.width]="collapsed() ? '72px' : '272px'"
           [class]="'bg-slate-50/90 dark:bg-slate-800/80 backdrop-blur-xl'">

      <!-- Logo Area -->
      <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-200/60 dark:border-slate-700/60 shrink-0">
        <div class="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <i class="pi pi-building text-white text-base"></i>
        </div>
        @if (!collapsed()) {
          <div class="overflow-hidden">
            <h2 class="text-base font-bold text-slate-800 dark:text-white whitespace-nowrap">LiveSpace Pro</h2>
          </div>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        @for (item of navItems(); track item.route) {
          <a [routerLink]="item.route"
             routerLinkActive="sidebar-link-active"
             [routerLinkActiveOptions]="{ exact: item.exact || false }"
             class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200 border-l-2 border-transparent group"
             [class.justify-center]="collapsed()">
            <i [class]="'pi ' + item.icon + ' text-base group-hover:scale-110 transition-transform duration-200'" [class.text-lg]="collapsed()"></i>
            @if (!collapsed()) {
              <span class="whitespace-nowrap">{{ item.label }}</span>
              @if (item.badge) {
                <span class="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">{{ item.badge }}</span>
              }
            }
          </a>
        }
      </nav>

      <!-- Collapse Toggle -->
      <div class="px-3 py-2 border-t border-slate-200/60 dark:border-slate-700/60">
        <button (click)="toggleCollapse.emit()"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
                [class.justify-center]="collapsed()">
          <i [class]="collapsed() ? 'pi pi-chevron-right' : 'pi pi-chevron-left'" class="text-sm"></i>
          @if (!collapsed()) {
            <span>Collapse</span>
          }
        </button>
      </div>

      <!-- User Profile -->
      <div class="px-3 py-3 border-t border-slate-200/60 dark:border-slate-700/60 shrink-0">
        <div class="flex items-center gap-3 px-2" [class.justify-center]="collapsed()">
          <app-avatar [name]="userName()" size="sm" [online]="true" />
          @if (!collapsed()) {
            <div class="overflow-hidden">
              <p class="text-sm font-medium text-slate-800 dark:text-white truncate">{{ userName() }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ userRole() }}</p>
            </div>
            <button (click)="logout()" class="ml-auto text-slate-400 hover:text-red-500 transition-colors">
              <i class="pi pi-sign-out text-sm"></i>
            </button>
          }
        </div>
      </div>
    </aside>
  `,
  styles: ``
})
export class Sidebar {
  collapsed = input<boolean>(false);
  toggleCollapse = output<void>();

  private auth = inject(AuthService);
  private router = inject(Router);
  private navService = inject(NavigationService);

  userName = signal('Nikunj Bavishiya');
  userRole = signal('Owner');

  navItems = this.navService.navItems;

  constructor() {
    const user = this.auth.currentUser();
    if (user) {
      this.userName.set(user.name);
      this.userRole.set(user.role);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
