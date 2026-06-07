import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { NotificationService } from '../../../../core/services/notification.service';

interface AgingTenant {
  id: string;
  fullName: string;
  propertyName: string;
  roomNumber: string;
  bedNumber: string;
  phone: string;
  pendingDues: number;
  paymentStatus: string;
  daysOverdue: number;
  severityClass: string;
  severityLabel: string;
  checked: boolean;
}

@Component({
  selector: 'app-outstanding-dues',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, Avatar, ButtonModule, CheckboxModule, TooltipModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Outstanding Dues & Aging" subtitle="Analyze, audit, and chase aging receivables across your properties"></app-page-header>

      <!-- Aging Cohort Quick Statistics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card p-5 border-l-4 border-emerald-500">
          <p class="text-xs text-slate-400 font-bold uppercase">1 - 7 Days (Recent)</p>
          <p class="text-xl font-bold text-slate-800 dark:text-white">₹{{ agingSums().recent | number }}</p>
          <span class="text-[10px] text-slate-400">Low action priority</span>
        </div>
        <div class="glass-card p-5 border-l-4 border-amber-500">
          <p class="text-xs text-slate-400 font-bold uppercase">8 - 15 Days (Actionable)</p>
          <p class="text-xl font-bold text-slate-800 dark:text-white">₹{{ agingSums().actionable | number }}</p>
          <span class="text-[10px] text-amber-500 font-semibold">Reminders suggested</span>
        </div>
        <div class="glass-card p-5 border-l-4 border-orange-500">
          <p class="text-xs text-slate-400 font-bold uppercase">16 - 30 Days (Critical)</p>
          <p class="text-xl font-bold text-slate-800 dark:text-white">₹{{ agingSums().critical | number }}</p>
          <span class="text-[10px] text-orange-500 font-semibold">Immediate collection notice</span>
        </div>
        <div class="glass-card p-5 border-l-4 border-red-500">
          <p class="text-xs text-slate-400 font-bold uppercase">30+ Days (Severe)</p>
          <p class="text-xl font-bold text-slate-800 dark:text-white">₹{{ agingSums().severe | number }}</p>
          <span class="text-[10px] text-red-500 font-semibold">Curfew/access review</span>
        </div>
      </div>

      <!-- Main Aging Directory -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Outstanding Invoices Aging Analysis</h3>
          <div class="flex gap-2">
            <button pButton label="Batch Send Auto-Reminders" icon="pi pi-send" (click)="sendBatchReminders()"
              [disabled]="!hasSelectedTenants()"
              class="p-button-sm rounded-lg bg-indigo-500 border-none text-white hover:opacity-90">
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b text-xs font-semibold text-slate-400 uppercase">
                <th class="py-3 px-3 text-center w-10">
                  <p-checkbox [binary]="true" [ngModel]="allChecked()" (ngModelChange)="toggleAll($event)"></p-checkbox>
                </th>
                <th class="py-3 px-3">Resident</th>
                <th class="py-3 px-3">Property</th>
                <th class="py-3 px-3 text-right">Dues Outstanding</th>
                <th class="py-3 px-3 text-center">Days Overdue</th>
                <th class="py-3 px-3 text-center">Severity Status</th>
                <th class="py-3 px-3 text-center">Remind</th>
              </tr>
            </thead>
            <tbody class="divide-y text-xs">
              @for (t of tenants(); track t.id) {
                <tr class="hover:bg-slate-50/50">
                  <td class="py-3.5 px-3 text-center">
                    <p-checkbox [binary]="true" [(ngModel)]="t.checked"></p-checkbox>
                  </td>
                  <td class="py-3.5 px-3">
                    <div class="flex items-center gap-2">
                      <app-avatar [name]="t.fullName" size="sm" />
                      <div>
                        <p class="font-bold text-slate-800 dark:text-white">{{ t.fullName }}</p>
                        <p class="text-[10px] text-slate-400">{{ t.phone }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-3 text-slate-500">
                    <p class="font-semibold">{{ t.propertyName }}</p>
                    <p>Room {{ t.roomNumber }} - Bed {{ t.bedNumber }}</p>
                  </td>
                  <td class="py-3.5 px-3 text-right font-bold text-slate-800">
                    ₹{{ t.pendingDues | number }}
                  </td>
                  <td class="py-3.5 px-3 text-center font-bold text-slate-600">
                    {{ t.daysOverdue }} days
                  </td>
                  <td class="py-3.5 px-3 text-center">
                    <span class="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px]" [class]="t.severityClass">
                      {{ t.severityLabel }}
                    </span>
                  </td>
                  <td class="py-3.5 px-3 text-center">
                    <button pButton icon="pi pi-send" class="p-button-sm p-button-text text-indigo-500" pTooltip="Send SMS Reminder" tooltipPosition="top" (click)="sendIndividualReminder(t)"></button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-400">Excellent! All resident accounts are settled with zero outstanding receivables.</td>
                </tr>
              }
            </tbody>
          </table>
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
export class OutstandingDuesComponent implements OnInit {
  private crudService = inject(CrudService);
  private notifyService = inject(NotificationService);

  tenants = signal<AgingTenant[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const rawTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    const activePending = rawTenants.filter(
      (t: any) => (t.status === 'Active' || t.status === 'Notice') && t.pendingDues > 0
    );

    const mapped = activePending.map((t: any) => {
      const prop = properties.find((p: any) => p.id === t.propertyId);
      const room = rooms.find((r: any) => r.id === t.roomId);
      const bed = beds.find((b: any) => b.id === t.bedId);

      // Simulate overdue days based on payment status or generic cohort
      let daysOverdue = 4;
      if (t.paymentStatus === 'Overdue') {
        daysOverdue = 22; // Critical category
      } else if (t.pendingDues > (t.monthlyRent * 2)) {
        daysOverdue = 45; // Severe category
      } else if (t.pendingDues > t.monthlyRent) {
        daysOverdue = 12; // Actionable category
      }

      // Severity styling
      let severityClass = 'bg-emerald-100 text-emerald-800';
      let severityLabel = 'Recent';
      if (daysOverdue > 30) {
        severityClass = 'bg-red-100 text-red-800';
        severityLabel = 'Severe';
      } else if (daysOverdue > 15) {
        severityClass = 'bg-orange-100 text-orange-800';
        severityLabel = 'Critical';
      } else if (daysOverdue > 7) {
        severityClass = 'bg-amber-100 text-amber-800';
        severityLabel = 'Actionable';
      }

      return {
        id: t.id,
        fullName: t.fullName || `${t.firstName} ${t.lastName}`,
        propertyName: prop ? prop.name : 'Unknown Property',
        roomNumber: room ? room.roomNumber : 'N/A',
        bedNumber: bed ? bed.bedNumber.split('-').pop() || bed.bedNumber : 'N/A',
        phone: t.phone || '',
        pendingDues: t.pendingDues || 0,
        paymentStatus: t.paymentStatus || 'Pending',
        daysOverdue,
        severityClass,
        severityLabel,
        checked: false
      };
    });

    this.tenants.set(mapped);
  }

  agingSums = computed(() => {
    const list = this.tenants();
    let recent = 0;
    let actionable = 0;
    let critical = 0;
    let severe = 0;

    list.forEach(t => {
      if (t.daysOverdue <= 7) recent += t.pendingDues;
      else if (t.daysOverdue <= 15) actionable += t.pendingDues;
      else if (t.daysOverdue <= 30) critical += t.pendingDues;
      else severe += t.pendingDues;
    });

    return { recent, actionable, critical, severe };
  });

  hasSelectedTenants = computed(() => {
    return this.tenants().some(t => t.checked);
  });

  allChecked = computed(() => {
    const list = this.tenants();
    return list.length > 0 && list.every(t => t.checked);
  });

  toggleAll(checked: boolean) {
    this.tenants.update(list => list.map(t => ({ ...t, checked })));
  }

  sendIndividualReminder(t: AgingTenant) {
    this.notifyService.addNotification({
      orgId: 'org-001',
      userId: t.id,
      title: 'Lease Overdue Rent Alert',
      message: `Dear ${t.fullName}, your accounts show aging dues of ₹${t.pendingDues.toLocaleString()} which are now ${t.daysOverdue} days overdue. Please settle immediately.`,
      type: 'Payment'
    });
    alert(`Lease alert dispatched to ${t.fullName}.`);
  }

  sendBatchReminders() {
    const selected = this.tenants().filter(t => t.checked);
    selected.forEach(t => {
      this.notifyService.addNotification({
        orgId: 'org-001',
        userId: t.id,
        title: 'Outstanding Rent Batch Reminder',
        message: `Dear ${t.fullName}, this is an automated batch chase alert to settle outstanding dues of ₹${t.pendingDues.toLocaleString()} today.`,
        type: 'Payment'
      });
    });

    alert(`Batch payment chase alerts successfully dispatched to ${selected.length} residents.`);
    this.tenants.update(list => list.map(t => ({ ...t, checked: false })));
  }
}
