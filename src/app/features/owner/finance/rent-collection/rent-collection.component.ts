import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-rent-collection',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatusBadge, Avatar, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Rent Collection Dashboard" subtitle="Monitor revenue targets, outstanding dues, and cash pipelines"></app-page-header>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card p-5 space-y-2">
          <p class="text-xs text-slate-400 font-bold uppercase">Target Collection</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">₹{{ stats().target | number }}</p>
          <span class="text-[10px] text-slate-400">Current calendar month</span>
        </div>
        <div class="glass-card p-5 space-y-2 border-l-4 border-emerald-500">
          <p class="text-xs text-slate-400 font-bold uppercase">Total Collected</p>
          <p class="text-2xl font-bold text-emerald-600">₹{{ stats().collected | number }}</p>
          <span class="text-[10px] text-emerald-500 font-semibold">{{ stats().collectedPercent }}% collection rate</span>
        </div>
        <div class="glass-card p-5 space-y-2 border-l-4 border-amber-500">
          <p class="text-xs text-slate-400 font-bold uppercase">Pending Collections</p>
          <p class="text-2xl font-bold text-amber-600">₹{{ stats().pending | number }}</p>
          <span class="text-[10px] text-amber-500 font-semibold">{{ stats().pendingPercent }}% of target due</span>
        </div>
        <div class="glass-card p-5 space-y-2 border-l-4 border-rose-500">
          <p class="text-xs text-slate-400 font-bold uppercase">Overdue Collections</p>
          <p class="text-2xl font-bold text-rose-600">₹{{ stats().overdue | number }}</p>
          <span class="text-[10px] text-rose-500 font-semibold">Critical aging (&gt;15 days)</span>
        </div>
      </div>

      <!-- Collection progress bar -->
      <div class="glass-card p-6 space-y-3">
        <div class="flex items-center justify-between text-sm">
          <span class="font-bold text-slate-700 dark:text-slate-300">Month-to-Date Progress</span>
          <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ stats().collectedPercent }}% Target Achieved</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden flex shadow-inner">
          <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-md"
            [style.width.%]="stats().collectedPercent">
          </div>
        </div>
      </div>

      <!-- Historical Collection Trend & Overdue List -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Overdue list -->
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-card p-6">
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 border-b pb-3 mb-4">Outstanding Payments Registry</h3>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b text-xs font-semibold text-slate-400 uppercase">
                    <th class="py-3 px-3">Resident</th>
                    <th class="py-3 px-3">Property</th>
                    <th class="py-3 px-3 text-right">Dues (₹)</th>
                    <th class="py-3 px-3 text-center">Status</th>
                    <th class="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y text-xs">
                  @for (t of overdueTenants(); track t.id) {
                    <tr class="hover:bg-slate-50/50">
                      <td class="py-3.5 px-3">
                        <div class="flex items-center gap-2">
                          <app-avatar [name]="t.fullName" size="sm" />
                          <div>
                            <p class="font-bold text-slate-800 dark:text-white">{{ t.fullName }}</p>
                            <p class="text-[10px] text-slate-400">Due: ₹{{ t.monthlyRent }}/mo</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3.5 px-3 text-slate-500">
                        <p class="font-semibold">{{ t.propertyName }}</p>
                        <p>Room {{ t.roomNumber }} - Bed {{ t.bedNumber }}</p>
                      </td>
                      <td class="py-3.5 px-3 text-right font-bold text-rose-500">
                        ₹{{ t.pendingDues | number }}
                      </td>
                      <td class="py-3.5 px-3 text-center">
                        <app-status-badge [status]="t.paymentStatus" />
                      </td>
                      <td class="py-3.5 px-3 text-center">
                        <div class="flex items-center justify-center gap-1">
                          <button pButton icon="pi pi-send" class="p-button-sm p-button-text text-indigo-500" pTooltip="Send SMS Reminder" tooltipPosition="top" (click)="sendReminder(t)"></button>
                          <button pButton icon="pi pi-indian-rupee" class="p-button-sm p-button-text text-emerald-500" pTooltip="Record Cash Collection" tooltipPosition="top" (click)="recordPayment(t)"></button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-8 text-center text-slate-400">Excellent! All resident rent payments are fully settled.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Monthly Trend -->
        <div class="space-y-6">
          <div class="glass-card p-6 space-y-4">
            <h3 class="font-bold text-slate-800 dark:text-white border-b pb-3 flex items-center gap-2">
              <i class="pi pi-chart-bar text-indigo-500"></i> Collection Trend
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed"> rent collection rate over the last 5 calendar cycles:</p>

            <div class="space-y-4 pt-2">
              @for (trend of collectionTrends; track trend.month) {
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-xs font-semibold">
                    <span class="text-slate-500">{{ trend.month }}</span>
                    <span class="text-slate-700">{{ trend.collectedPercent }}% (₹{{ trend.amount | number }})</span>
                  </div>
                  <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-indigo-500 to-indigo-600" [style.width.%]="trend.collectedPercent"></div>
                  </div>
                </div>
              }
            </div>

            <div class="p-4 rounded-xl border border-indigo-50 bg-indigo-50/50 text-[10px] text-indigo-700 flex gap-2 mt-4">
              <i class="pi pi-check-circle text-xs shrink-0 mt-0.5 animate-bounce"></i>
              <p>Average collection turnaround is 4.5 days from rent invoice release, indicating strong tenant payment discipline.</p>
            </div>
          </div>
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
export class RentCollectionComponent implements OnInit {
  private router = inject(Router);
  private crudService = inject(CrudService);
  private notifyService = inject(NotificationService);

  stats = signal<any>({
    target: 0,
    collected: 0,
    collectedPercent: 0,
    pending: 0,
    pendingPercent: 0,
    overdue: 0
  });

  overdueTenants = signal<any[]>([]);

  collectionTrends = [
    { month: 'Jan 2026', collectedPercent: 96, amount: 645000 },
    { month: 'Feb 2026', collectedPercent: 92, amount: 620000 },
    { month: 'Mar 2026', collectedPercent: 98, amount: 660000 },
    { month: 'Apr 2026', collectedPercent: 94, amount: 635000 },
    { month: 'May 2026', collectedPercent: 88, amount: 595000 }
  ];

  ngOnInit() {
    this.calculateStats();
  }

  calculateStats() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    const active = tenants.filter((t: any) => t.status === 'Active' || t.status === 'Notice');

    // Mapped Overdue/Pending list
    const mappedOverdue = active
      .filter((t: any) => t.pendingDues > 0)
      .map((t: any) => {
        const prop = properties.find((p: any) => p.id === t.propertyId);
        const room = rooms.find((r: any) => r.id === t.roomId);
        const bed = beds.find((b: any) => b.id === t.bedId);

        return {
          ...t,
          fullName: t.fullName || `${t.firstName} ${t.lastName}`,
          propertyName: prop ? prop.name : 'Unknown Property',
          roomNumber: room ? room.roomNumber : 'N/A',
          bedNumber: bed ? bed.bedNumber.split('-').pop() || bed.bedNumber : 'N/A'
        };
      });

    this.overdueTenants.set(mappedOverdue);

    // Compute metrics
    const totalTarget = active.reduce((sum: number, t: any) => sum + (t.monthlyRent || t.rent || 0), 0);
    const pendingDues = active.reduce((sum: number, t: any) => sum + (t.pendingDues || 0), 0);
    const collectedVal = Math.max(0, totalTarget - pendingDues);

    const collectedPercent = totalTarget ? Math.round((collectedVal / totalTarget) * 100) : 0;
    const pendingPercent = 100 - collectedPercent;

    // Overdues: Rents overdue > 15 days (simulated as overdue payment status)
    const overdueVal = active
      .filter((t: any) => t.paymentStatus === 'Overdue')
      .reduce((sum: number, t: any) => sum + (t.pendingDues || 0), 0);

    this.stats.set({
      target: totalTarget,
      collected: collectedVal,
      collectedPercent,
      pending: pendingDues,
      pendingPercent,
      overdue: overdueVal
    });
  }

  sendReminder(t: any) {
    this.notifyService.addNotification({
      orgId: t.orgId || 'org-001',
      userId: t.id,
      title: 'Outstanding Rent Reminder',
      message: `Dear ${t.fullName}, this is a reminder to settle your outstanding PG rent dues of ₹${t.pendingDues.toLocaleString()} immediately to avoid late fees.`,
      type: 'Payment'
    });
    alert(`Payment reminder notification successfully dispatched to ${t.fullName}.`);
  }

  recordPayment(t: any) {
    this.router.navigate(['/owner/finance/transactions']);
  }
}
