import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-revenue-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeader, ButtonModule, TooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Revenue Intelligence Cockpit" subtitle="Interactive cash flow trends, per-property allocations, and visual growth projections">
        <button pButton label="Refresh Projections" icon="pi pi-sync" (click)="loadData()"
          class="p-button-sm rounded-xl bg-indigo-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- Key Performance Metrix Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="glass-card p-6 bg-gradient-to-br from-indigo-500/10 to-transparent">
          <p class="text-xs uppercase font-bold text-slate-400">ARR (Annual Run Rate)</p>
          <h3 class="text-2xl font-black text-slate-800 dark:text-white mt-1">₹{{ (totalIncome() * 12) | number }}</h3>
          <p class="text-[10px] text-emerald-500 font-semibold mt-2 flex items-center gap-1">
            <i class="pi pi-arrow-up-right"></i> +12.4% Projected annual expansion
          </p>
        </div>

        <div class="glass-card p-6 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <p class="text-xs uppercase font-bold text-slate-400">Monthly Operating Yield</p>
          <h3 class="text-2xl font-black text-emerald-600 mt-1">₹{{ (totalIncome() - totalExpenses()) | number }}</h3>
          <p class="text-[10px] text-slate-400 mt-2">Net operational cash surplus generated.</p>
        </div>

        <div class="glass-card p-6 bg-gradient-to-br from-violet-500/10 to-transparent">
          <p class="text-xs uppercase font-bold text-slate-400">Expense Burden Ratio</p>
          <h3 class="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">
            {{ totalIncome() > 0 ? ((totalExpenses() / totalIncome()) * 100 | number:'1.0-1') : 0 }}%
          </h3>
          <p class="text-[10px] text-slate-400 mt-2">Operating costs divided by total gross inflows.</p>
        </div>

        <div class="glass-card p-6 bg-gradient-to-br from-amber-500/10 to-transparent">
          <p class="text-xs uppercase font-bold text-slate-400">Occupancy Yield Optimization</p>
          <h3 class="text-2xl font-black text-amber-600 mt-1">₹{{ averageRentPerBed() | number }}</h3>
          <p class="text-[10px] text-slate-400 mt-2">Average monthly yield collected per active resident.</p>
        </div>
      </div>

      <!-- Main Visual Section: Cash Flow Graph & Property Allocation -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 6-Month Cash Flow Graph Component (Clean Pure CSS Visual Grid) -->
        <div class="glass-card p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-bold text-slate-800 dark:text-white">6-Month Cash Flow Trend</h4>
              <div class="flex gap-4 text-[10px] font-bold">
                <span class="flex items-center gap-1.5 text-emerald-500"><span class="w-2.5 h-2.5 rounded bg-emerald-500"></span> Inflow</span>
                <span class="flex items-center gap-1.5 text-rose-500"><span class="w-2.5 h-2.5 rounded bg-rose-500"></span> Outflow</span>
              </div>
            </div>
            <p class="text-xs text-slate-400 mb-6">Historical operating cash flow matching recorded rental entries and approved caretaker expenses.</p>
          </div>

          <!-- Pure Visual CSS Chart Bars -->
          <div class="flex justify-between items-end h-56 pt-6 px-4 border-b border-slate-100 dark:border-slate-800 relative">
            <!-- Y-Axis Mock lines -->
            <div class="absolute left-0 right-0 top-1/4 border-t border-slate-100 dark:border-slate-800/40 pointer-events-none"></div>
            <div class="absolute left-0 right-0 top-2/4 border-t border-slate-100 dark:border-slate-800/40 pointer-events-none"></div>
            <div class="absolute left-0 right-0 top-3/4 border-t border-slate-100 dark:border-slate-800/40 pointer-events-none"></div>

            @for (m of monthlyTrends(); track m.month) {
              <div class="flex flex-col items-center flex-1 group">
                <div class="flex items-end gap-1.5 justify-center w-full">
                  <!-- Inflow Bar -->
                  <div class="w-4 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-sm transition-all duration-500 group-hover:opacity-80 relative"
                    [style.height.%]="m.inflowHeight"
                    [pTooltip]="'Inflow: ₹' + m.inflow.toLocaleString()" tooltipPosition="top">
                  </div>
                  <!-- Outflow Bar -->
                  <div class="w-4 bg-gradient-to-t from-rose-500 to-pink-500 rounded-t-sm transition-all duration-500 group-hover:opacity-80 relative"
                    [style.height.%]="m.outflowHeight"
                    [pTooltip]="'Outflow: ₹' + m.outflow.toLocaleString()" tooltipPosition="top">
                  </div>
                </div>
                <!-- Label -->
                <span class="text-[9px] font-bold text-slate-400 mt-3">{{ m.monthName }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Property Allocation & Pricing Optimization -->
        <div class="glass-card p-6 flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-slate-800 dark:text-white mb-1">Portfolio Inflow Splits</h4>
            <p class="text-xs text-slate-400 mb-6">Percentage of total organization collections generated by each managed property.</p>
          </div>

          <div class="space-y-4">
            @for (p of propertySplits(); track p.name) {
              <div class="space-y-1.5">
                <div class="flex justify-between items-center text-xs font-semibold">
                  <span class="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[150px]">{{ p.name }}</span>
                  <span class="text-indigo-600 dark:text-indigo-400 font-mono">₹{{ p.revenue | number }} ({{ p.percent }}%)</span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" [style.width.%]="p.percent"></div>
                </div>
              </div>
            }
            @if (propertySplits().length === 0) {
              <p class="text-center py-6 text-slate-400 text-xs">No active property transactions collected.</p>
            }
          </div>

          <div class="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
            <h5 class="font-bold text-xs text-slate-700 dark:text-slate-300 mb-3">Bed Pricing Yield Index</h5>
            <div class="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div class="bg-indigo-50/50 dark:bg-indigo-950/10 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                <p class="text-slate-400">Single</p>
                <p class="font-bold text-indigo-600 mt-0.5">₹18,500/m</p>
              </div>
              <div class="bg-violet-50/50 dark:bg-violet-950/10 p-2 rounded-lg border border-violet-100 dark:border-violet-900/50">
                <p class="text-slate-400">Double</p>
                <p class="font-bold text-violet-600 mt-0.5">₹12,000/m</p>
              </div>
              <div class="bg-purple-50/50 dark:bg-purple-950/10 p-2 rounded-lg border border-purple-100 dark:border-purple-900/50">
                <p class="text-slate-400">Triple</p>
                <p class="font-bold text-purple-600 mt-0.5">₹8,500/m</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Growth Forecasting & Projections Engine -->
      <div class="glass-card p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h4 class="font-bold text-slate-800 dark:text-white">Growth Projection Engine</h4>
            <p class="text-xs text-slate-400 mt-0.5">Configure organic expansion variables to forecast future co-living gross revenues.</p>
          </div>
          <!-- Growth factor toggler -->
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500 font-bold">Expansion Factor:</span>
            <div class="flex border rounded-xl overflow-hidden bg-white/60 dark:bg-slate-900/60">
              <button class="px-3 py-1.5 text-xs font-bold transition-all border-r hover:bg-slate-50"
                [class]="growthFactor() === 0.05 ? 'bg-indigo-500 text-white border-indigo-500' : 'text-slate-600'" (click)="growthFactor.set(0.05)">+5%</button>
              <button class="px-3 py-1.5 text-xs font-bold transition-all border-r hover:bg-slate-50"
                [class]="growthFactor() === 0.10 ? 'bg-indigo-500 text-white border-indigo-500' : 'text-slate-600'" (click)="growthFactor.set(0.10)">+10%</button>
              <button class="px-3 py-1.5 text-xs font-bold transition-all hover:bg-slate-50"
                [class]="growthFactor() === 0.15 ? 'bg-indigo-500 text-white border-indigo-500' : 'text-slate-600'" (click)="growthFactor.set(0.15)">+15%</button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
          @for (f of forecastProjections(); track f.month) {
            <div class="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 text-center">
              <p class="text-[9px] uppercase font-bold text-slate-400">{{ f.monthName }}</p>
              <h5 class="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-2">₹{{ f.predictedRevenue | number:'1.0-0' }}</h5>
              <div class="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-500 mt-1 bg-emerald-50 px-1 py-0.5 rounded">
                <i class="pi pi-chart-line"></i> +{{ f.growthPercent }}%
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class RevenueAnalyticsComponent implements OnInit {
  private crudService = inject(CrudService);

  totalIncome = signal(0);
  totalExpenses = signal(0);
  averageRentPerBed = signal(0);
  growthFactor = signal(0.10); // Default 10% monthly compounded organic growth projection

  transactions: any[] = [];
  properties: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    this.transactions = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);

    // Calculate core metrics
    let incomeSum = 0;
    let expenseSum = 0;

    this.transactions.forEach(tx => {
      const isDebit = !(tx.type === 'EXPENSE' || tx.type === 'REFUND' || tx.type === 'MAINTENANCE');
      if (isDebit) {
        incomeSum += Number(tx.amount || 0);
      } else {
        expenseSum += Number(tx.amount || 0);
      }
    });

    this.totalIncome.set(incomeSum);
    this.totalExpenses.set(expenseSum);

    // Calculate average yield per resident
    const activeTenants = tenants.filter((t: any) => t.status === 'Active');
    const totalPaidSum = activeTenants.reduce((sum: number, t: any) => sum + (t.totalPaid || 0), 0);
    this.averageRentPerBed.set(activeTenants.length > 0 ? Math.round(totalPaidSum / activeTenants.length) : 12000);
  }

  monthlyTrends = computed(() => {
    // Group transactions by last 6 calendar months
    // Let's create an list of last 6 calendar months dynamically
    const months: any[] = [];
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const mStr = d.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
      const mName = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push({ month: mStr, monthName: mName, inflow: 0, outflow: 0 });
    }

    this.transactions.forEach(tx => {
      const dateStr = tx.paymentDate || tx.createdAt || '';
      if (!dateStr) return;
      const txMonth = dateStr.substring(0, 7); // YYYY-MM

      const target = months.find(m => m.month === txMonth);
      if (target) {
        const amount = Number(tx.amount || 0);
        const isDebit = !(tx.type === 'EXPENSE' || tx.type === 'REFUND' || tx.type === 'MAINTENANCE');
        if (isDebit) {
          target.inflow += amount;
        } else {
          target.outflow += amount;
        }
      }
    });

    // Calculate dynamic heights for rendering in 100% relative container
    const maxVal = Math.max(...months.map(m => Math.max(m.inflow, m.outflow)), 1000);
    return months.map(m => ({
      ...m,
      inflowHeight: maxVal > 0 ? (m.inflow / maxVal * 85) + 5 : 5, // minimum 5% height
      outflowHeight: maxVal > 0 ? (m.outflow / maxVal * 85) + 5 : 5
    }));
  });

  propertySplits = computed(() => {
    // Summarize income per property
    const splits: { [key: string]: number } = {};
    let activeTotal = 0;

    this.transactions.forEach(tx => {
      const isDebit = !(tx.type === 'EXPENSE' || tx.type === 'REFUND' || tx.type === 'MAINTENANCE');
      if (!isDebit || !tx.propertyId) return;

      splits[tx.propertyId] = (splits[tx.propertyId] || 0) + Number(tx.amount || 0);
      activeTotal += Number(tx.amount || 0);
    });

    const results = Object.keys(splits).map(propId => {
      const prop = this.properties.find(p => p.id === propId);
      const name = prop ? prop.name : 'Villas & Shared';
      const revenue = splits[propId];
      const percent = activeTotal > 0 ? Math.round(revenue / activeTotal * 100) : 0;
      return { name, revenue, percent };
    });

    // Sort descending by yield
    return results.sort((a, b) => b.revenue - a.revenue);
  });

  forecastProjections = computed(() => {
    // Generate automated forecasts for the next 6 calendar months
    // Base monthly yield is average of recent monthly inflows
    const trends = this.monthlyTrends();
    const activeMonths = trends.filter(t => t.inflow > 0);
    const baseRevenue = activeMonths.length > 0
      ? activeMonths.reduce((sum, m) => sum + m.inflow, 0) / activeMonths.length
      : 85000;

    const rate = this.growthFactor();
    const forecast = [];
    const date = new Date();

    let compoundedRevenue = baseRevenue;

    for (let i = 1; i <= 6; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() + i, 1);
      const mName = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const mStr = d.toISOString().split('T')[0].substring(0, 7);

      compoundedRevenue = compoundedRevenue * (1 + rate);
      const growthPercent = Math.round(((compoundedRevenue / baseRevenue) - 1) * 100);

      forecast.push({
        month: mStr,
        monthName: mName,
        predictedRevenue: Math.round(compoundedRevenue),
        growthPercent
      });
    }

    return forecast;
  });
}
