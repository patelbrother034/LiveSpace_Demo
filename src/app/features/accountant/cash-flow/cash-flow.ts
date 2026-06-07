import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface CashFlowItem { category: string; inflow: number; outflow: number; }
interface MonthData { month: string; inflow: number; outflow: number; }

@Component({
  selector: 'app-accountant-cash-flow',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Cash Flow Analysis" subtitle="Track cash inflows and outflows across your properties" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Net Cash Flow</p><p class="text-xl font-extrabold text-emerald-600 mt-1">₹{{ netFlow() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Cash Inflows (MTD)</p><p class="text-xl font-extrabold text-blue-600 mt-1">₹{{ totalInflow() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Cash Outflows (MTD)</p><p class="text-xl font-extrabold text-red-500 mt-1">₹{{ totalOutflow() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Projected Next Month</p><p class="text-xl font-extrabold text-purple-600 mt-1">₹1,85,000</p></div>
      </div>

      <!-- Monthly Bar Chart -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-chart-bar mr-2 text-indigo-500"></i>Monthly Cash Flow (Last 6 Months)</h4>
        <div class="flex items-end gap-3 h-48 px-4">
          @for (m of monthlyData; track m.month) {
            <div class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full flex gap-1 items-end justify-center h-36">
                <div class="w-5 rounded-t-md bg-emerald-500/80 transition-all hover:bg-emerald-500" [style.height.%]="(m.inflow / maxValue) * 100" title="Inflow: ₹{{m.inflow}}"></div>
                <div class="w-5 rounded-t-md bg-red-400/80 transition-all hover:bg-red-400" [style.height.%]="(m.outflow / maxValue) * 100" title="Outflow: ₹{{m.outflow}}"></div>
              </div>
              <span class="text-[10px] font-bold text-slate-500">{{ m.month }}</span>
            </div>
          }
        </div>
        <div class="flex justify-center gap-6 text-xs">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-emerald-500"></span> Inflow</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-red-400"></span> Outflow</span>
        </div>
      </div>

      <!-- Breakdown Table -->
      <div class="glass-card overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-700"><h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Category Breakdown</h4></div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Category</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Inflow (₹)</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Outflow (₹)</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Net (₹)</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Flow</th>
            </tr></thead>
            <tbody>
              @for (item of categories(); track item.category) {
                <tr class="border-b border-slate-100 dark:border-slate-800">
                  <td class="p-3 font-bold text-slate-800 dark:text-white">{{ item.category }}</td>
                  <td class="p-3 text-right font-mono text-emerald-600">{{ item.inflow > 0 ? (item.inflow | number:'1.0-0') : '—' }}</td>
                  <td class="p-3 text-right font-mono text-red-500">{{ item.outflow > 0 ? (item.outflow | number:'1.0-0') : '—' }}</td>
                  <td class="p-3 text-right font-mono font-bold" [class]="(item.inflow - item.outflow) >= 0 ? 'text-emerald-600' : 'text-red-500'">{{ (item.inflow - item.outflow) | number:'1.0-0' }}</td>
                  <td class="p-3"><div class="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full rounded-full" [class]="(item.inflow - item.outflow) >= 0 ? 'bg-emerald-500' : 'bg-red-500'" [style.width.%]="Math.min(100, (Math.abs(item.inflow - item.outflow) / 200000) * 100)"></div></div></td>
                </tr>
              }
            </tbody>
            <tfoot><tr class="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 font-bold">
              <td class="p-3 text-xs uppercase text-slate-500">Total</td>
              <td class="p-3 text-right font-mono text-emerald-600">{{ totalInflow() | number:'1.0-0' }}</td>
              <td class="p-3 text-right font-mono text-red-500">{{ totalOutflow() | number:'1.0-0' }}</td>
              <td class="p-3 text-right font-mono text-indigo-600 font-extrabold">{{ netFlow() | number:'1.0-0' }}</td>
              <td class="p-3"></td>
            </tr></tfoot>
          </table>
        </div>
      </div>
    </div>
  `, styles: [``]
})
export class AccountantCashFlow {
  Math = Math;
  monthlyData: MonthData[] = [
    { month: 'Jan', inflow: 285000, outflow: 142000 },
    { month: 'Feb', inflow: 292000, outflow: 155000 },
    { month: 'Mar', inflow: 305000, outflow: 148000 },
    { month: 'Apr', inflow: 278000, outflow: 162000 },
    { month: 'May', inflow: 310000, outflow: 145000 },
    { month: 'Jun', inflow: 295000, outflow: 138000 },
  ];
  maxValue = 320000;
  categories = signal<CashFlowItem[]>([
    { category: 'Rent Collection', inflow: 215000, outflow: 0 },
    { category: 'Security Deposits', inflow: 40000, outflow: 5000 },
    { category: 'Maintenance', inflow: 0, outflow: 28000 },
    { category: 'Utilities', inflow: 0, outflow: 35000 },
    { category: 'Salaries', inflow: 0, outflow: 55000 },
    { category: 'Food & Mess', inflow: 30000, outflow: 45000 },
    { category: 'Other Income', inflow: 10000, outflow: 0 },
  ]);
  totalInflow = computed(() => this.categories().reduce((s, c) => s + c.inflow, 0));
  totalOutflow = computed(() => this.categories().reduce((s, c) => s + c.outflow, 0));
  netFlow = computed(() => this.totalInflow() - this.totalOutflow());
}
