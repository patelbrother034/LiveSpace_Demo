import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface KpiCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  trend?: number;
}

interface QuickActionCard {
  label: string;
  desc: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  route: string;
}

@Component({
  selector: 'app-payment-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadge, Avatar],
  template: `
    <div class="space-y-8 animate-fade-in">

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        @for (kpi of kpiCards(); track kpi.label) {
          <div class="glass-card p-5 relative overflow-hidden border-l-4 hover:shadow-lg transition-shadow duration-200" [style]="'border-left-color: ' + kpi.borderColor">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{{ kpi.label }}</p>
                <p class="text-2xl font-black text-slate-800 dark:text-white mt-1">{{ kpi.value }}</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{{ kpi.sub }}</p>
              </div>
              <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" [class]="kpi.iconBg">
                <i [class]="'pi ' + kpi.icon + ' text-lg ' + kpi.iconColor"></i>
              </div>
            </div>
            @if (kpi.trend !== undefined) {
              <div class="mt-3 flex items-center gap-1.5 text-[11px] font-semibold"
                   [class]="kpi.trend >= 0 ? 'text-emerald-500' : 'text-rose-500'">
                <i [class]="'pi ' + (kpi.trend >= 0 ? 'pi-arrow-up' : 'pi-arrow-down') + ' text-[10px]'"></i>
                {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}% vs last month
              </div>
            }
          </div>
        }
      </div>

      <!-- Collection Progress Bar -->
      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-white">Monthly Collection Target</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">June 2026 — Across all properties</p>
          </div>
          <span class="text-lg font-black text-emerald-500">{{ collectionPercent() }}%</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden shadow-inner">
          <div
            class="h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500 rounded-full transition-all duration-1000 relative"
            [style.width.%]="collectionPercent()">
            <div class="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-70"></div>
          </div>
        </div>
        <div class="flex justify-between mt-2 text-[11px] text-slate-400">
          <span>₹{{ stats().collected | number }} collected</span>
          <span>Target: ₹{{ stats().target | number }}</span>
        </div>
      </div>

      <!-- Quick Action Cards + Mini Transaction Table -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Quick Actions (2/3 width) -->
        <div class="lg:col-span-2 space-y-4">
          <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Finance Actions</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            @for (action of quickActions; track action.label) {
              <a [routerLink]="action.route"
                 class="glass-card p-4 flex flex-col items-center gap-2.5 text-center cursor-pointer hover:scale-[1.04] hover:shadow-xl transition-all duration-200 group rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110" [class]="action.iconBg">
                  <i [class]="'pi ' + action.icon + ' text-base ' + action.iconColor"></i>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ action.label }}</p>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{{ action.desc }}</p>
                </div>
              </a>
            }
          </div>

          <!-- Recent Transactions Mini Table -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Recent Transactions</h3>
              <a routerLink="../transactions"
                 class="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1">
                View All <i class="pi pi-arrow-right text-[10px]"></i>
              </a>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                    <th class="py-2.5 px-2">Resident</th>
                    <th class="py-2.5 px-2">Amount</th>
                    <th class="py-2.5 px-2">Mode</th>
                    <th class="py-2.5 px-2">Date</th>
                    <th class="py-2.5 px-2">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                  @for (tx of recentTransactions(); track tx.id) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td class="py-3 px-2">
                        <div class="flex items-center gap-2">
                          <app-avatar [name]="tx.entityName" size="sm" />
                          <div>
                            <p class="text-xs font-semibold text-slate-800 dark:text-white">{{ tx.entityName }}</p>
                            <p class="text-[10px] text-slate-400">{{ tx.type }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-2 text-xs font-bold"
                          [class]="tx.type === 'EXPENSE' || tx.type === 'REFUND' ? 'text-rose-500' : 'text-emerald-600'">
                        {{ tx.type === 'EXPENSE' || tx.type === 'REFUND' ? '-' : '+' }}₹{{ tx.amount | number }}
                      </td>
                      <td class="py-3 px-2 text-[11px] text-slate-500">{{ tx.paymentMode || 'UPI' }}</td>
                      <td class="py-3 px-2 text-[11px] text-slate-400">{{ tx.paymentDate || tx.createdAt }}</td>
                      <td class="py-3 px-2">
                        <app-status-badge [status]="tx.status" />
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-6 text-center text-xs text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Overdue Alerts Panel (1/3 width) -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overdue Alerts</h3>
          <div class="glass-card p-5 space-y-3">
            @if (overdueTenants().length === 0) {
              <div class="flex flex-col items-center justify-center py-8 text-center">
                <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-3">
                  <i class="pi pi-check-circle text-emerald-500 text-xl"></i>
                </div>
                <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">All Clear!</p>
                <p class="text-xs text-slate-400 mt-1">No overdue payments</p>
              </div>
            } @else {
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-1">
                <span class="text-xs font-bold text-rose-500">{{ overdueTenants().length }} residents overdue</span>
                <a routerLink="../dues" class="text-[11px] text-indigo-500 font-semibold hover:underline">See all</a>
              </div>
              @for (t of overdueTenants(); track t.id) {
                <div class="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30">
                  <app-avatar [name]="t.fullName" size="sm" />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-800 dark:text-white truncate">{{ t.fullName }}</p>
                    <p class="text-[10px] text-slate-500 truncate">{{ t.propertyName }}</p>
                    <p class="text-[11px] font-black text-rose-600 mt-1">₹{{ t.pendingDues | number }} due</p>
                  </div>
                  <div class="shrink-0">
                    <span class="text-[9px] font-bold px-2 py-1 rounded-full uppercase"
                          [class]="t.paymentStatus === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'">
                      {{ t.paymentStatus }}
                    </span>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Collection Summary Card -->
          <div class="glass-card p-5 space-y-3">
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">5-Month Trend</h4>
            @for (trend of collectionTrends; track trend.month) {
              <div class="space-y-1">
                <div class="flex justify-between text-[11px] font-semibold">
                  <span class="text-slate-500">{{ trend.month }}</span>
                  <span class="text-slate-700 dark:text-slate-300">{{ trend.collectedPercent }}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                       [style.width.%]="trend.collectedPercent"></div>
                </div>
              </div>
            }
          </div>
        </div>

      </div>
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
  `]
})
export class PaymentOverviewComponent implements OnInit {
  private crudService = inject(CrudService);
  private router = inject(Router);

  stats = signal({ target: 0, collected: 0, pending: 0, overdue: 0 });
  recentTransactions = signal<any[]>([]);
  overdueTenants = signal<any[]>([]);

  collectionPercent = computed(() => {
    const s = this.stats();
    return s.target > 0 ? Math.round((s.collected / s.target) * 100) : 0;
  });

  kpiCards = computed<KpiCard[]>(() => {
    const s = this.stats();
    return [
      {
        label: 'Total Collected',
        value: '₹' + this.formatAmount(s.collected),
        sub: 'This calendar month',
        icon: 'pi-check-circle',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
        iconColor: 'text-emerald-500',
        borderColor: '#10b981',
        trend: 8
      },
      {
        label: 'Pending Dues',
        value: '₹' + this.formatAmount(s.pending),
        sub: 'Across all tenants',
        icon: 'pi-clock',
        iconBg: 'bg-amber-50 dark:bg-amber-950/30',
        iconColor: 'text-amber-500',
        borderColor: '#f59e0b',
        trend: -5
      },
      {
        label: 'Overdue Amount',
        value: '₹' + this.formatAmount(s.overdue),
        sub: 'Critical aging > 15 days',
        icon: 'pi-exclamation-triangle',
        iconBg: 'bg-rose-50 dark:bg-rose-950/30',
        iconColor: 'text-rose-500',
        borderColor: '#f43f5e',
        trend: -12
      },
      {
        label: 'Monthly Target',
        value: '₹' + this.formatAmount(s.target),
        sub: this.collectionPercent() + '% collected so far',
        icon: 'pi-chart-bar',
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',
        iconColor: 'text-indigo-500',
        borderColor: '#6366f1',
      }
    ];
  });

  quickActions: QuickActionCard[] = [
    { label: 'Record Payment',   desc: 'Log cash / UPI',    icon: 'pi-indian-rupee', iconBg: 'bg-emerald-50 dark:bg-emerald-950/30', iconColor: 'text-emerald-600', route: '../transactions' },
    { label: 'Rent Collection',  desc: 'Monthly overview',  icon: 'pi-home',         iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',   iconColor: 'text-indigo-600',  route: '../rent-collection' },
    { label: 'Invoices',         desc: 'Generate & print',  icon: 'pi-file-pdf',     iconBg: 'bg-violet-50 dark:bg-violet-950/30',   iconColor: 'text-violet-600',  route: '../invoices' },
    { label: 'Receipts',         desc: 'Payment receipts',  icon: 'pi-receipt',      iconBg: 'bg-teal-50 dark:bg-teal-950/30',       iconColor: 'text-teal-600',    route: '../receipts' },
    { label: 'Outstanding Dues', desc: 'Aging analysis',    icon: 'pi-exclamation-triangle', iconBg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600', route: '../dues' },
    { label: 'Expenses',         desc: 'Track spend',       icon: 'pi-wallet',       iconBg: 'bg-rose-50 dark:bg-rose-950/30',       iconColor: 'text-rose-600',    route: '../expenses' },
    { label: 'Revenue Analytics',desc: 'Revenue insights',  icon: 'pi-chart-line',   iconBg: 'bg-green-50 dark:bg-green-950/30',     iconColor: 'text-green-600',   route: '../revenue' },
    { label: 'GST Dashboard',    desc: 'Tax compliance',    icon: 'pi-percentage',   iconBg: 'bg-orange-50 dark:bg-orange-950/30',   iconColor: 'text-orange-600',  route: '../gst' },
  ];

  collectionTrends = [
    { month: 'Jan 2026', collectedPercent: 96 },
    { month: 'Feb 2026', collectedPercent: 92 },
    { month: 'Mar 2026', collectedPercent: 98 },
    { month: 'Apr 2026', collectedPercent: 94 },
    { month: 'May 2026', collectedPercent: 88 },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const transactions = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);

    const active = tenants.filter((t: any) => t.status === 'Active' || t.status === 'Notice');
    const totalTarget = active.reduce((sum: number, t: any) => sum + (t.monthlyRent || t.rent || 0), 0);
    const totalPending = active.reduce((sum: number, t: any) => sum + (t.pendingDues || 0), 0);
    const totalCollected = Math.max(0, totalTarget - totalPending);
    const overdueAmount = active
      .filter((t: any) => t.paymentStatus === 'Overdue')
      .reduce((sum: number, t: any) => sum + (t.pendingDues || 0), 0);

    this.stats.set({ target: totalTarget, collected: totalCollected, pending: totalPending, overdue: overdueAmount });

    // Recent 5 transactions
    const recent = [...transactions]
      .sort((a: any, b: any) => (b.paymentDate || b.createdAt || '').localeCompare(a.paymentDate || a.createdAt || ''))
      .slice(0, 5);
    this.recentTransactions.set(recent);

    // Overdue tenants (max 5 shown)
    const overdue = active
      .filter((t: any) => t.pendingDues > 0)
      .map((t: any) => {
        const prop = properties.find((p: any) => p.id === t.propertyId);
        return {
          ...t,
          fullName: t.fullName || `${t.firstName} ${t.lastName}`,
          propertyName: prop ? prop.name : 'Unknown Property'
        };
      })
      .slice(0, 5);
    this.overdueTenants.set(overdue);
  }

  private formatAmount(val: number): string {
    if (val >= 100000) return (val / 100000).toFixed(2) + 'L';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toString();
  }
}
