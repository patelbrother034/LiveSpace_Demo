import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface BottomNavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-around px-4 z-40 md:hidden pb-safe">
      @for (item of items(); track item.route) {
        <a [routerLink]="item.route"
           routerLinkActive="text-indigo-600 dark:text-indigo-400 font-semibold"
           [routerLinkActiveOptions]="{ exact: item.route === '/owner/dashboard' }"
           class="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] w-12 h-12 transition-all duration-200 relative group"
        >
          <div class="p-1 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
            <i [class]="'pi ' + item.icon + ' text-lg'"></i>
          </div>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: []
})
export class BottomNav {
  private auth = inject(AuthService);

  items = signal<BottomNavItem[]>([
    { icon: 'pi-th-large', label: 'Home', route: '/owner/dashboard' },
    { icon: 'pi-building', label: 'Properties', route: '/owner/properties' },
    { icon: 'pi-users', label: 'Tenants', route: '/owner/tenants' },
    { icon: 'pi-indian-rupee', label: 'Payments', route: '/owner/payments' }
  ]);
}
