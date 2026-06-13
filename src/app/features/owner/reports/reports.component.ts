import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  accentClass: string;
  bgClass: string;
  borderClass: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Reports Center" subtitle="Generate, preview, and export operational reports across your portfolio"></app-page-header>

      <!-- Report Category Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (cat of categories; track cat.id) {
          <div class="glass-card p-6 cursor-pointer group hover:scale-[1.02] hover:shadow-xl transition-all duration-300 rounded-2xl border-2"
               [class]="selectedReport() === cat.id ? cat.borderClass + ' shadow-lg' : 'border-transparent'"
               (click)="selectReport(cat.id)">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform duration-200 group-hover:scale-110"
                 [class]="cat.bgClass">
              <i [class]="'pi ' + cat.icon + ' ' + cat.accentClass"></i>
            </div>
            <h3 class="text-base font-bold text-slate-800 dark:text-white mb-1.5">{{ cat.title }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{{ cat.description }}</p>
            <div class="mt-4 flex items-center gap-1 text-xs font-semibold transition-colors" [class]="cat.accentClass">
              <span>{{ selectedReport() === cat.id ? 'Viewing' : 'View Report' }}</span>
              <i class="pi pi-arrow-right text-[10px]" [class.rotate-90]="selectedReport() === cat.id"></i>
            </div>
          </div>
        }
      </div>

      <!-- Report Panels -->
      @if (selectedReport() === 'occupancy') {
        <div class="glass-card p-6 rounded-2xl report-panel">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i class="pi pi-home text-emerald-500"></i> Occupancy Report
              </h3>
              <p class="text-xs text-slate-400 mt-1">Real-time occupancy rates across all properties</p>
            </div>
            <div class="flex gap-2">
              <button pButton label="Export PDF" icon="pi pi-file-pdf" class="p-button-sm p-button-outlined rounded-xl border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" (click)="exportAlert()"></button>
              <button pButton label="Export CSV" icon="pi pi-download" class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white hover:opacity-90" (click)="exportAlert()"></button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                  <th class="py-3 px-3">Property Name</th>
                  <th class="py-3 px-3 text-center">Total Beds</th>
                  <th class="py-3 px-3 text-center">Occupied</th>
                  <th class="py-3 px-3 text-center">Vacant</th>
                  <th class="py-3 px-3 text-center">Occupancy %</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                @for (row of occupancyData(); track row.name) {
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="py-3.5 px-3 font-medium text-slate-800 dark:text-white">{{ row.name }}</td>
                    <td class="py-3.5 px-3 text-center text-slate-600 dark:text-slate-300">{{ row.totalBeds }}</td>
                    <td class="py-3.5 px-3 text-center">
                      <span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">{{ row.occupied }}</span>
                    </td>
                    <td class="py-3.5 px-3 text-center">
                      <span class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">{{ row.vacant }}</span>
                    </td>
                    <td class="py-3.5 px-3 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <div class="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" [style.width.%]="row.occupancyPct"></div>
                        </div>
                        <span class="font-bold text-slate-700 dark:text-slate-200 text-xs">{{ row.occupancyPct }}%</span>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 font-bold text-sm">
                  <td class="py-3.5 px-3 text-emerald-700 dark:text-emerald-300">TOTAL</td>
                  <td class="py-3.5 px-3 text-center text-emerald-700 dark:text-emerald-300">{{ occupancySummary().totalBeds }}</td>
                  <td class="py-3.5 px-3 text-center text-emerald-700 dark:text-emerald-300">{{ occupancySummary().occupied }}</td>
                  <td class="py-3.5 px-3 text-center text-emerald-700 dark:text-emerald-300">{{ occupancySummary().vacant }}</td>
                  <td class="py-3.5 px-3 text-center text-emerald-700 dark:text-emerald-300">{{ occupancySummary().avgPct }}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      }

      @if (selectedReport() === 'revenue') {
        <div class="glass-card p-6 rounded-2xl report-panel">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i class="pi pi-indian-rupee text-indigo-500"></i> Revenue Report
              </h3>
              <p class="text-xs text-slate-400 mt-1">Monthly Profit & Loss summary (Jan–Jun 2026)</p>
            </div>
            <div class="flex gap-2">
              <button pButton label="Export PDF" icon="pi pi-file-pdf" class="p-button-sm p-button-outlined rounded-xl border-indigo-300 text-indigo-600 dark:border-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30" (click)="exportAlert()"></button>
              <button pButton label="Export CSV" icon="pi pi-download" class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90" (click)="exportAlert()"></button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                  <th class="py-3 px-3">Month</th>
                  <th class="py-3 px-3 text-right">Rent Collected</th>
                  <th class="py-3 px-3 text-right">Expenses</th>
                  <th class="py-3 px-3 text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                @for (row of revenueData(); track row.month) {
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="py-3.5 px-3 font-medium text-slate-800 dark:text-white">{{ row.month }}</td>
                    <td class="py-3.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">₹{{ row.rent | number }}</td>
                    <td class="py-3.5 px-3 text-right text-rose-500 font-semibold">₹{{ row.expenses | number }}</td>
                    <td class="py-3.5 px-3 text-right font-bold" [class]="row.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'">
                      ₹{{ row.profit | number }}
                    </td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 font-bold text-sm">
                  <td class="py-3.5 px-3 text-indigo-700 dark:text-indigo-300">TOTAL</td>
                  <td class="py-3.5 px-3 text-right text-indigo-700 dark:text-indigo-300">₹{{ revenueSummary().totalRent | number }}</td>
                  <td class="py-3.5 px-3 text-right text-indigo-700 dark:text-indigo-300">₹{{ revenueSummary().totalExpenses | number }}</td>
                  <td class="py-3.5 px-3 text-right text-indigo-700 dark:text-indigo-300">₹{{ revenueSummary().totalProfit | number }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      }

      @if (selectedReport() === 'turnover') {
        <div class="glass-card p-6 rounded-2xl report-panel">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i class="pi pi-users text-amber-500"></i> Tenant Turnover Report
              </h3>
              <p class="text-xs text-slate-400 mt-1">Tenant status breakdown and turnover trends</p>
            </div>
            <div class="flex gap-2">
              <button pButton label="Export PDF" icon="pi pi-file-pdf" class="p-button-sm p-button-outlined rounded-xl border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30" (click)="exportAlert()"></button>
              <button pButton label="Export CSV" icon="pi pi-download" class="p-button-sm rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 border-none text-white hover:opacity-90" (click)="exportAlert()"></button>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            @for (stat of turnoverStats(); track stat.label) {
              <div class="p-5 rounded-2xl border text-center" [class]="stat.cardClass">
                <p class="text-3xl font-black mb-1" [class]="stat.valueClass">{{ stat.count }}</p>
                <p class="text-sm font-semibold" [class]="stat.labelClass">{{ stat.label }}</p>
              </div>
            }
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                  <th class="py-3 px-3">Status</th>
                  <th class="py-3 px-3 text-center">Count</th>
                  <th class="py-3 px-3 text-center">Percentage</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                @for (row of turnoverData(); track row.status) {
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="py-3.5 px-3 font-medium text-slate-800 dark:text-white flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full" [class]="row.dotClass"></span>
                      {{ row.status }}
                    </td>
                    <td class="py-3.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-200">{{ row.count }}</td>
                    <td class="py-3.5 px-3 text-center text-slate-500 dark:text-slate-400">{{ row.percentage }}%</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      @if (selectedReport() === 'maintenance') {
        <div class="glass-card p-6 rounded-2xl report-panel">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i class="pi pi-wrench text-rose-500"></i> Maintenance Cost Report
              </h3>
              <p class="text-xs text-slate-400 mt-1">Ticket breakdown by category and priority</p>
            </div>
            <div class="flex gap-2">
              <button pButton label="Export PDF" icon="pi pi-file-pdf" class="p-button-sm p-button-outlined rounded-xl border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30" (click)="exportAlert()"></button>
              <button pButton label="Export CSV" icon="pi pi-download" class="p-button-sm rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 border-none text-white hover:opacity-90" (click)="exportAlert()"></button>
            </div>
          </div>

          <!-- Priority summary cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            @for (p of maintenancePrioritySummary(); track p.priority) {
              <div class="p-4 rounded-2xl border" [class]="p.cardClass">
                <p class="text-2xl font-black" [class]="p.valueClass">{{ p.count }}</p>
                <p class="text-xs font-semibold mt-1" [class]="p.labelClass">{{ p.priority }} Priority</p>
              </div>
            }
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                  <th class="py-3 px-3">Category</th>
                  <th class="py-3 px-3 text-center">Total Tickets</th>
                  <th class="py-3 px-3 text-center">Open</th>
                  <th class="py-3 px-3 text-center">Resolved</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                @for (row of maintenanceData(); track row.category) {
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="py-3.5 px-3 font-medium text-slate-800 dark:text-white">{{ row.category }}</td>
                    <td class="py-3.5 px-3 text-center font-semibold text-slate-700 dark:text-slate-200">{{ row.total }}</td>
                    <td class="py-3.5 px-3 text-center text-amber-600 dark:text-amber-400 font-semibold">{{ row.open }}</td>
                    <td class="py-3.5 px-3 text-center text-emerald-600 dark:text-emerald-400 font-semibold">{{ row.resolved }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 font-bold text-sm">
                  <td class="py-3.5 px-3 text-rose-700 dark:text-rose-300">TOTAL</td>
                  <td class="py-3.5 px-3 text-center text-rose-700 dark:text-rose-300">{{ maintenanceSummary().total }}</td>
                  <td class="py-3.5 px-3 text-center text-rose-700 dark:text-rose-300">{{ maintenanceSummary().open }}</td>
                  <td class="py-3.5 px-3 text-center text-rose-700 dark:text-rose-300">{{ maintenanceSummary().resolved }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      }
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
    .report-panel {
      animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ReportsComponent implements OnInit {
  private crudService = inject(CrudService);

  selectedReport = signal<string | null>(null);

  categories: ReportCategory[] = [
    {
      id: 'occupancy', title: 'Occupancy Report',
      description: 'Real-time occupancy rate per property with bed-level detail',
      icon: 'pi-home', accentClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderClass: 'border-emerald-400 dark:border-emerald-600'
    },
    {
      id: 'revenue', title: 'Revenue Report',
      description: 'Monthly P&L summary with rent collection and expense tracking',
      icon: 'pi-indian-rupee', accentClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderClass: 'border-indigo-400 dark:border-indigo-600'
    },
    {
      id: 'turnover', title: 'Tenant Turnover',
      description: 'Check-in/check-out trends and tenant status distribution',
      icon: 'pi-users', accentClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/30',
      borderClass: 'border-amber-400 dark:border-amber-600'
    },
    {
      id: 'maintenance', title: 'Maintenance Cost',
      description: 'Ticket breakdown by category and priority with resolution stats',
      icon: 'pi-wrench', accentClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-50 dark:bg-rose-950/30',
      borderClass: 'border-rose-400 dark:border-rose-600'
    }
  ];

  // -- Occupancy --
  occupancyData = signal<any[]>([]);
  occupancySummary = computed(() => {
    const data = this.occupancyData();
    const totalBeds = data.reduce((s, r) => s + r.totalBeds, 0);
    const occupied = data.reduce((s, r) => s + r.occupied, 0);
    const vacant = totalBeds - occupied;
    const avgPct = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;
    return { totalBeds, occupied, vacant, avgPct };
  });

  // -- Revenue --
  revenueData = signal<any[]>([]);
  revenueSummary = computed(() => {
    const data = this.revenueData();
    return {
      totalRent: data.reduce((s, r) => s + r.rent, 0),
      totalExpenses: data.reduce((s, r) => s + r.expenses, 0),
      totalProfit: data.reduce((s, r) => s + r.profit, 0)
    };
  });

  // -- Turnover --
  turnoverData = signal<any[]>([]);
  turnoverStats = computed(() => {
    const data = this.turnoverData();
    const active = data.find(d => d.status === 'Active')?.count || 0;
    const notice = data.find(d => d.status === 'Notice')?.count || 0;
    const checkedOut = data.find(d => d.status === 'Checked-Out')?.count || 0;
    return [
      { label: 'Active Tenants', count: active, cardClass: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800', valueClass: 'text-emerald-600 dark:text-emerald-400', labelClass: 'text-emerald-700 dark:text-emerald-300' },
      { label: 'On Notice', count: notice, cardClass: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800', valueClass: 'text-amber-600 dark:text-amber-400', labelClass: 'text-amber-700 dark:text-amber-300' },
      { label: 'Checked Out', count: checkedOut, cardClass: 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700', valueClass: 'text-slate-600 dark:text-slate-300', labelClass: 'text-slate-600 dark:text-slate-400' }
    ];
  });

  // -- Maintenance --
  maintenanceData = signal<any[]>([]);
  maintenanceSummary = computed(() => {
    const data = this.maintenanceData();
    return {
      total: data.reduce((s, r) => s + r.total, 0),
      open: data.reduce((s, r) => s + r.open, 0),
      resolved: data.reduce((s, r) => s + r.resolved, 0)
    };
  });
  maintenancePrioritySummary = signal<any[]>([]);

  ngOnInit() {
    this.loadOccupancy();
    this.loadRevenue();
    this.loadTurnover();
    this.loadMaintenance();
  }

  selectReport(id: string) {
    this.selectedReport.set(this.selectedReport() === id ? null : id);
  }

  exportAlert() {
    alert('Export feature coming soon!');
  }

  private loadOccupancy() {
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    const rows = properties.map((p: any) => {
      const propBeds = beds.filter((b: any) => b.propertyId === p.id);
      const totalBeds = propBeds.length || p.totalBeds || 0;
      const occupied = propBeds.filter((b: any) => b.status === 'Occupied').length;
      const vacant = totalBeds - occupied;
      const occupancyPct = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;
      return { name: p.name || p.propertyName, totalBeds, occupied, vacant, occupancyPct };
    });
    this.occupancyData.set(rows.length > 0 ? rows : [
      { name: 'Royal Heights PG', totalBeds: 45, occupied: 41, vacant: 4, occupancyPct: 91 },
      { name: 'Apex Elite PG', totalBeds: 60, occupied: 54, vacant: 6, occupancyPct: 90 },
      { name: 'LiveSpace Elite', totalBeds: 35, occupied: 28, vacant: 7, occupancyPct: 80 },
      { name: 'Co-Living Nest', totalBeds: 32, occupied: 25, vacant: 7, occupancyPct: 78 }
    ]);
  }

  private loadRevenue() {
    const transactions = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);
    const expenses = this.crudService.getAll<any>(StorageKeys.EXPENSES);
    const months = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026'];
    const monthMap: Record<string, number> = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5 };

    const rentByMonth = new Array(6).fill(0);
    const expByMonth = new Array(6).fill(0);

    transactions.filter((t: any) => t.type === 'RENT' && t.status === 'Paid').forEach((t: any) => {
      const date = new Date(t.paymentDate || t.createdAt);
      if (date.getFullYear() === 2026) {
        const mi = date.getMonth();
        if (mi >= 0 && mi < 6) rentByMonth[mi] += (t.amount || 0);
      }
    });

    expenses.forEach((e: any) => {
      const date = new Date(e.date || e.createdAt);
      if (date.getFullYear() === 2026) {
        const mi = date.getMonth();
        if (mi >= 0 && mi < 6) expByMonth[mi] += (e.amount || 0);
      }
    });

    const hasData = rentByMonth.some(v => v > 0) || expByMonth.some(v => v > 0);
    if (hasData) {
      this.revenueData.set(months.map((m, i) => ({
        month: m, rent: rentByMonth[i], expenses: expByMonth[i], profit: rentByMonth[i] - expByMonth[i]
      })));
    } else {
      this.revenueData.set([
        { month: 'Jan 2026', rent: 485000, expenses: 125000, profit: 360000 },
        { month: 'Feb 2026', rent: 492000, expenses: 118000, profit: 374000 },
        { month: 'Mar 2026', rent: 510000, expenses: 142000, profit: 368000 },
        { month: 'Apr 2026', rent: 505000, expenses: 131000, profit: 374000 },
        { month: 'May 2026', rent: 520000, expenses: 128000, profit: 392000 },
        { month: 'Jun 2026', rent: 498000, expenses: 135000, profit: 363000 }
      ]);
    }
  }

  private loadTurnover() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const statusMap: Record<string, number> = {};
    tenants.forEach((t: any) => {
      const status = t.status || 'Active';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const total = tenants.length || 1;
    const dotClasses: Record<string, string> = {
      'Active': 'bg-emerald-500', 'Notice': 'bg-amber-500', 'Checked-Out': 'bg-slate-400',
      'Pending': 'bg-blue-500', 'Inactive': 'bg-red-500'
    };

    const rows = Object.entries(statusMap).map(([status, count]) => ({
      status, count, percentage: Math.round((count / total) * 100),
      dotClass: dotClasses[status] || 'bg-slate-400'
    }));

    this.turnoverData.set(rows.length > 0 ? rows : [
      { status: 'Active', count: 128, percentage: 76, dotClass: 'bg-emerald-500' },
      { status: 'Notice', count: 14, percentage: 8, dotClass: 'bg-amber-500' },
      { status: 'Checked-Out', count: 26, percentage: 16, dotClass: 'bg-slate-400' }
    ]);
  }

  private loadMaintenance() {
    const tickets = this.crudService.getAll<any>(StorageKeys.TICKETS);
    const catMap: Record<string, { total: number; open: number; resolved: number }> = {};
    const prioMap: Record<string, number> = {};

    tickets.forEach((t: any) => {
      const cat = t.category || 'General';
      if (!catMap[cat]) catMap[cat] = { total: 0, open: 0, resolved: 0 };
      catMap[cat].total++;
      if (t.status === 'Open' || t.status === 'In Progress') catMap[cat].open++;
      if (t.status === 'Resolved' || t.status === 'Closed') catMap[cat].resolved++;

      const prio = t.priority || 'Medium';
      prioMap[prio] = (prioMap[prio] || 0) + 1;
    });

    const rows = Object.entries(catMap).map(([category, v]) => ({ category, ...v }));
    this.maintenanceData.set(rows.length > 0 ? rows : [
      { category: 'Plumbing', total: 12, open: 3, resolved: 9 },
      { category: 'Electrical', total: 8, open: 2, resolved: 6 },
      { category: 'Furniture', total: 5, open: 1, resolved: 4 },
      { category: 'Appliance', total: 6, open: 2, resolved: 4 },
      { category: 'General', total: 4, open: 1, resolved: 3 }
    ]);

    const prioEntries = Object.keys(prioMap).length > 0
      ? Object.entries(prioMap)
      : [['High', 8], ['Medium', 18], ['Low', 9]] as [string, number][];

    const cardStyles: Record<string, any> = {
      'High': { cardClass: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800', valueClass: 'text-rose-600 dark:text-rose-400', labelClass: 'text-rose-700 dark:text-rose-300' },
      'Medium': { cardClass: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800', valueClass: 'text-amber-600 dark:text-amber-400', labelClass: 'text-amber-700 dark:text-amber-300' },
      'Low': { cardClass: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800', valueClass: 'text-emerald-600 dark:text-emerald-400', labelClass: 'text-emerald-700 dark:text-emerald-300' }
    };
    this.maintenancePrioritySummary.set(
      prioEntries.map(([priority, count]) => ({
        priority, count,
        ...(cardStyles[priority as string] || cardStyles['Medium'])
      }))
    );
  }
}
