import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface PaymentTab {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  colorClass: string;
}

@Component({
  selector: 'app-payment-hub',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Hub Header -->
      <div class="glass-card p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <i class="pi pi-indian-rupee text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Payments Hub</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Unified financial command center for all your properties</p>
            </div>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <a routerLink="transactions"
               class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow hover:opacity-90 transition-opacity cursor-pointer">
              <i class="pi pi-plus text-xs"></i> Record Payment
            </a>
            <a routerLink="invoices"
               class="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <i class="pi pi-file-pdf text-xs"></i> Invoices
            </a>
          </div>
        </div>

        <!-- Tab Navigation Bar -->
        <div class="mt-6 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
          @for (tab of tabs; track tab.route) {
            <a [routerLink]="tab.route"
               routerLinkActive="payment-tab-active"
               [routerLinkActiveOptions]="{ exact: false }"
               class="payment-tab flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border border-transparent
                      text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer">
              <i [class]="'pi ' + tab.icon + ' text-sm'"></i>
              <span>{{ tab.label }}</span>
              @if (tab.badge && tab.badge > 0) {
                <span class="ml-1 text-[10px] font-black bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center">{{ tab.badge }}</span>
              }
            </a>
          }
        </div>
      </div>

      <!-- Tab Content via Router Outlet -->
      <router-outlet />

    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    :host ::ng-deep .payment-tab-active {
      background: linear-gradient(135deg, rgb(16 185 129 / 0.12), rgb(20 184 166 / 0.10)) !important;
      border-color: rgb(16 185 129 / 0.4) !important;
      color: rgb(16 185 129) !important;
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class PaymentHubComponent {
  router = inject(Router);

  tabs: PaymentTab[] = [
    { label: 'Overview',       icon: 'pi-th-large',      route: 'overview',         colorClass: 'text-emerald-500' },
    { label: 'Transactions',   icon: 'pi-arrows-h',      route: 'transactions',     colorClass: 'text-blue-500' },
    { label: 'Rent Collection',icon: 'pi-home',          route: 'rent-collection',  colorClass: 'text-indigo-500' },
    { label: 'Invoices',       icon: 'pi-file-pdf',      route: 'invoices',         badge: 3, colorClass: 'text-violet-500' },
    { label: 'Receipts',       icon: 'pi-receipt',       route: 'receipts',         colorClass: 'text-teal-500' },
    { label: 'Outstanding Dues',icon: 'pi-exclamation-triangle', route: 'dues',     colorClass: 'text-amber-500' },
    { label: 'Expenses',       icon: 'pi-wallet',        route: 'expenses',         colorClass: 'text-rose-500' },
    { label: 'Revenue',        icon: 'pi-chart-line',    route: 'revenue',          colorClass: 'text-green-500' },
    { label: 'GST',            icon: 'pi-percentage',    route: 'gst',              colorClass: 'text-orange-500' },
  ];
}
