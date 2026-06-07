import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface BillingRecord { id: string; organization: string; plan: string; amount: number; status: string; lastPayment: string; nextDue: string; }

@Component({
  selector: 'app-admin-billing',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Billing & Revenue" subtitle="Track SaaS subscription revenue and billing" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total MRR</p><p class="text-xl font-extrabold text-emerald-600 mt-1">₹{{ totalMRR() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Active Subs</p><p class="text-xl font-extrabold text-indigo-600 mt-1">{{ activeCount() }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Churn Rate</p><p class="text-xl font-extrabold text-amber-600 mt-1">2.1%</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">ARPU</p><p class="text-xl font-extrabold text-purple-600 mt-1">₹{{ arpu() | number:'1.0-0' }}</p></div>
      </div>

      <!-- Revenue Trend -->
      <div class="glass-card p-5 space-y-3">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Revenue Trend (6 months)</h4>
        <svg viewBox="0 0 600 120" class="w-full h-24">
          <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/><stop offset="100%" stop-color="#6366f1" stop-opacity="0"/></linearGradient></defs>
          <path d="M0,100 L100,85 L200,78 L300,65 L400,55 L500,42 L600,35 L600,120 L0,120Z" fill="url(#revGrad)" />
          <polyline points="0,100 100,85 200,78 300,65 400,55 500,42 600,35" fill="none" stroke="#6366f1" stroke-width="2.5" />
          @for (p of trendPoints; track p.x) { <circle [attr.cx]="p.x" [attr.cy]="p.y" r="4" fill="#6366f1" /> }
        </svg>
        <div class="flex justify-between text-[10px] text-slate-400 font-bold"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
      </div>

      <div class="glass-card overflow-hidden"><div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
            <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Organization</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Plan</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Amount</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Status</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Last Payment</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Next Due</th>
          </tr></thead>
          <tbody>
            @for (b of billing(); track b.id) {
              <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="p-3 font-bold text-slate-800 dark:text-white">{{ b.organization }}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="b.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' : b.plan === 'Growth' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'">{{ b.plan }}</span></td>
                <td class="p-3 font-bold text-emerald-600">₹{{ b.amount | number:'1.0-0' }}/mo</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="b.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">{{ b.status }}</span></td>
                <td class="p-3 text-slate-500">{{ b.lastPayment }}</td>
                <td class="p-3 text-slate-500">{{ b.nextDue }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div></div>
    </div>
  `, styles: [``]
})
export class AdminBilling {
  trendPoints = [{ x: 0, y: 100 }, { x: 100, y: 85 }, { x: 200, y: 78 }, { x: 300, y: 65 }, { x: 400, y: 55 }, { x: 500, y: 42 }, { x: 600, y: 35 }];
  billing = signal<BillingRecord[]>([
    { id: 'b1', organization: 'Sunrise PG Network', plan: 'Enterprise', amount: 24999, status: 'Active', lastPayment: 'Jun 1, 2026', nextDue: 'Jul 1, 2026' },
    { id: 'b2', organization: 'Green Valley Hostels', plan: 'Growth', amount: 9999, status: 'Active', lastPayment: 'Jun 1, 2026', nextDue: 'Jul 1, 2026' },
    { id: 'b3', organization: 'Metro Living Spaces', plan: 'Enterprise', amount: 24999, status: 'Active', lastPayment: 'May 28, 2026', nextDue: 'Jun 28, 2026' },
    { id: 'b4', organization: 'StudyNest PG', plan: 'Starter', amount: 4999, status: 'Active', lastPayment: 'Jun 2, 2026', nextDue: 'Jul 2, 2026' },
    { id: 'b5', organization: 'CampusStay', plan: 'Growth', amount: 9999, status: 'Active', lastPayment: 'May 15, 2026', nextDue: 'Jun 15, 2026' },
    { id: 'b6', organization: 'NestAway PG', plan: 'Starter', amount: 4999, status: 'Churned', lastPayment: 'Apr 1, 2026', nextDue: 'Overdue' },
  ]);
  totalMRR = computed(() => this.billing().filter(b => b.status === 'Active').reduce((s, b) => s + b.amount, 0));
  activeCount = computed(() => this.billing().filter(b => b.status === 'Active').length);
  arpu = computed(() => this.activeCount() ? Math.round(this.totalMRR() / this.activeCount()) : 0);
}
