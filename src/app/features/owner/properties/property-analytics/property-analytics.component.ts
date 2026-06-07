import { Component, signal } from '@angular/core';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-property-analytics',
  standalone: true,
  imports: [PageHeader, StatCard, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Property Analytics" subtitle="Occupancy trends, revenue charts, and property performance">
        <div class="flex gap-2">
          @for (period of periods; track period) {
            <button pButton [label]="period" class="p-button-sm rounded-lg"
              [class]="activePeriod() === period ? 'bg-indigo-500 border-indigo-500 text-white' : 'p-button-outlined border-slate-300 text-slate-500'"
              (click)="activePeriod.set(period)"></button>
          }
        </div>
      </app-page-header>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
        <app-stat-card label="Occupancy Rate" value="91%" icon="pi-users" color="success" [trend]="4" trendLabel="vs last month" />
        <app-stat-card label="Revenue" value="₹7.15L" icon="pi-indian-rupee" color="primary" [trend]="6" trendLabel="growth" />
        <app-stat-card label="Avg Stay Duration" value="8.3 months" icon="pi-calendar" color="info" [trend]="2" trendLabel="longer stays" />
        <app-stat-card label="Collection Rate" value="94%" icon="pi-check-circle" color="warning" [trend]="-1" trendLabel="vs last month" />
      </div>

      <!-- Occupancy Trend Chart -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-chart-line text-indigo-500 mr-2"></i>Occupancy Trend</h3>
        </div>
        <div class="h-64 flex items-end gap-3 pt-8 pb-2 px-2">
          @for (month of occupancyData(); track month.label) {
            <div class="flex-1 flex flex-col items-center gap-2">
              <span class="text-xs font-bold" [class]="month.value >= 85 ? 'text-emerald-600' : month.value >= 70 ? 'text-blue-600' : 'text-amber-600'">{{ month.value }}%</span>
              <div class="w-full rounded-t-lg transition-all duration-700"
                [style.height.%]="month.value"
                [class]="month.value >= 85 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : month.value >= 70 ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-gradient-to-t from-amber-600 to-amber-400'">
              </div>
              <span class="text-[10px] text-slate-400 font-medium">{{ month.label }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Revenue & Property Comparison -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Breakdown -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-chart-pie text-purple-500 mr-2"></i>Revenue Breakdown</h3>
          <div class="space-y-3">
            @for (item of revenueBreakdown(); track item.label) {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-3 h-3 rounded-full" [class]="item.color"></div>
                  <span class="text-sm text-slate-600 dark:text-slate-400">{{ item.label }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="h-full rounded-full" [class]="item.barColor" [style.width.%]="item.percent"></div>
                  </div>
                  <span class="text-sm font-bold text-slate-800 dark:text-white w-16 text-right">₹{{ item.amount }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Property Comparison -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-building text-teal-500 mr-2"></i>Property Comparison</h3>
          <div class="space-y-4">
            @for (prop of propertyComparison(); track prop.name) {
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-sm text-slate-800 dark:text-white">{{ prop.name }}</span>
                  <span class="text-sm font-bold" [class]="prop.occupancy >= 85 ? 'text-emerald-600' : 'text-amber-600'">{{ prop.occupancy }}%</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" [class]="prop.occupancy >= 85 ? 'bg-emerald-500' : 'bg-amber-500'" [style.width.%]="prop.occupancy"></div>
                </div>
                <div class="flex justify-between text-xs text-slate-400">
                  <span>{{ prop.beds }} beds</span><span>₹{{ prop.revenue }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class PropertyAnalyticsComponent {
  activePeriod = signal('6M');
  periods = ['1M', '3M', '6M', '1Y'];

  occupancyData = signal([
    { label: 'Dec', value: 78 }, { label: 'Jan', value: 82 }, { label: 'Feb', value: 85 },
    { label: 'Mar', value: 88 }, { label: 'Apr', value: 89 }, { label: 'May', value: 91 },
  ]);

  revenueBreakdown = signal([
    { label: 'Room Rent', amount: '5.8L', percent: 81, color: 'bg-indigo-500', barColor: 'bg-indigo-500' },
    { label: 'Maintenance', amount: '0.6L', percent: 8, color: 'bg-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Food Charges', amount: '0.5L', percent: 7, color: 'bg-amber-500', barColor: 'bg-amber-500' },
    { label: 'Other', amount: '0.25L', percent: 4, color: 'bg-slate-400', barColor: 'bg-slate-400' },
  ]);

  propertyComparison = signal([
    { name: 'Royal Heights PG', occupancy: 91, beds: 45, revenue: '1.65L' },
    { name: 'Apex Elite PG', occupancy: 90, beds: 60, revenue: '2.45L' },
    { name: 'LiveSpace Elite', occupancy: 80, beds: 35, revenue: '1.85L' },
    { name: 'Co-Living Nest', occupancy: 78, beds: 32, revenue: '1.20L' },
  ]);
}
