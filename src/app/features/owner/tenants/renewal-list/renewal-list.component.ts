import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-renewal-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, Avatar, ButtonModule, InputTextModule, TooltipModule, DatePicker],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Lease Renewals & Extensions" subtitle="Track expiring leases and coordinate resident renewals"></app-page-header>

      <!-- Renewal Pipeline Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Main: Expiring Leases Directory -->
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-card p-6">
            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300 border-b pb-3 mb-4">Upcoming Lease Expirations (Next 60 Days)</h3>
            
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b text-xs font-semibold text-slate-400 uppercase">
                    <th class="py-3 px-3">Resident</th>
                    <th class="py-3 px-3">Room Info</th>
                    <th class="py-3 px-3">Lease Expiry</th>
                    <th class="py-3 px-3 text-center">Remaining Days</th>
                    <th class="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y text-xs">
                  @for (t of expiringTenants(); track t.id) {
                    <tr class="hover:bg-slate-50/50 cursor-pointer" [class.bg-indigo-50/20]="selectedTenant()?.id === t.id" (click)="selectedTenant.set(t)">
                      <td class="py-3 px-3">
                        <div class="flex items-center gap-2">
                          <app-avatar [name]="t.fullName" size="sm" />
                          <div>
                            <p class="font-bold text-slate-800 dark:text-white">{{ t.fullName }}</p>
                            <p class="text-[10px] text-slate-400">{{ t.email }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-3 text-slate-500">
                        <p class="font-semibold">{{ t.propertyName }}</p>
                        <p>Room {{ t.roomNumber }} - Bed {{ t.bedNumber }}</p>
                      </td>
                      <td class="py-3 px-3">
                        <p class="font-bold text-rose-500">{{ t.leaseEndDate }}</p>
                        <p class="text-[10px] text-slate-400">Started: {{ t.leaseStartDate }}</p>
                      </td>
                      <td class="py-3 px-3 text-center font-bold">
                        <span class="px-2 py-0.5 rounded-full" 
                          [class]="t.daysRemaining <= 15 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'">
                          {{ t.daysRemaining }} days
                        </span>
                      </td>
                      <td class="py-3 px-3 text-center" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-center gap-1">
                          <button pButton icon="pi pi-send" class="p-button-sm p-button-text text-indigo-500" pTooltip="Send Reminder Notice" tooltipPosition="top" (click)="sendReminder(t)"></button>
                          <button pButton icon="pi pi-refresh" class="p-button-sm p-button-text text-emerald-500" pTooltip="One-Click Renew" tooltipPosition="top" (click)="selectedTenant.set(t); showRenewalPopup.set(true)"></button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-8 text-center text-slate-400">No leases are currently expiring in the next 60 days.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Detail / Renewal Action Drawer -->
        <div class="space-y-6">
          @if (selectedTenant()) {
            <div class="glass-card p-6 space-y-5 animate-fade-in">
              <div class="border-b pb-3">
                <h3 class="font-bold text-slate-800 dark:text-white">Lease Extension Center</h3>
              </div>

              <div class="flex items-center gap-3">
                <app-avatar [name]="selectedTenant().fullName" size="md" />
                <div>
                  <h4 class="font-bold text-sm text-slate-800 dark:text-white">{{ selectedTenant().fullName }}</h4>
                  <p class="text-xs text-slate-400">Room {{ selectedTenant().roomNumber }} / Bed {{ selectedTenant().bedNumber }}</p>
                </div>
              </div>

              <!-- Lease details -->
              <div class="space-y-3 text-xs bg-slate-50/50 p-4 rounded-xl border">
                <div class="flex justify-between">
                  <span class="text-slate-400">Lease Start</span>
                  <span class="font-semibold text-slate-700">{{ selectedTenant().leaseStartDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Lease Expiry</span>
                  <span class="font-bold text-rose-500">{{ selectedTenant().leaseEndDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Current Monthly Rent</span>
                  <span class="font-bold text-slate-800 dark:text-white">₹{{ selectedTenant().monthlyRent | number }}</span>
                </div>
              </div>

              <!-- Renewal popup / quick form triggers -->
              @if (showRenewalPopup()) {
                <div class="p-4 border border-emerald-100 bg-emerald-50/20 rounded-xl space-y-4 animate-fade-in">
                  <h4 class="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
                    <i class="pi pi-refresh"></i> Configure Lease Extension
                  </h4>
                  <div class="space-y-3">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] font-bold text-slate-400 uppercase">New Lease Start Date</label>
                      <p-datepicker [(ngModel)]="newLeaseStart" styleClass="w-full" inputStyleClass="w-full text-xs" dateFormat="yy-mm-dd"></p-datepicker>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] font-bold text-slate-400 uppercase">New Lease Expiry Date</label>
                      <p-datepicker [(ngModel)]="newLeaseEnd" styleClass="w-full" inputStyleClass="w-full text-xs" dateFormat="yy-mm-dd"></p-datepicker>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] font-bold text-slate-400 uppercase">Extended Monthly Rent (₹)</label>
                      <input type="number" [(ngModel)]="newRent" class="w-full px-3 py-1.5 rounded-lg border text-xs bg-white" />
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button pButton label="Cancel" (click)="showRenewalPopup.set(false)" class="p-button-sm p-button-outlined p-button-secondary rounded-lg text-[10px] py-1 flex-1"></button>
                    <button pButton label="Save Lease Extension" (click)="executeRenewal()" class="p-button-sm p-button-success rounded-lg text-white text-[10px] py-1 flex-1"></button>
                  </div>
                </div>
              } @else {
                <button pButton label="Configure One-Click Renew" icon="pi pi-refresh" (click)="setupRenewalForm()"
                  class="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white text-xs py-2 w-full">
                </button>
              }

              <!-- Notification history alert -->
              <div class="p-4 rounded-xl border border-indigo-50 bg-indigo-50/50 text-[10px] text-indigo-700 flex gap-2">
                <i class="pi pi-info-circle text-xs shrink-0 mt-0.5"></i>
                <p>One-click renewals automatically extend the lease duration in local storage and record a confirmation notification in the resident history.</p>
              </div>

            </div>
          } @else {
            <div class="glass-card p-8 text-center space-y-3">
              <i class="pi pi-clock text-3xl text-slate-300"></i>
              <p class="text-sm font-semibold text-slate-400">Select a resident case from the expiring leases to configure extension and renewal parameters.</p>
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
export class RenewalListComponent implements OnInit {
  private crudService = inject(CrudService);
  private notifyService = inject(NotificationService);

  tenants = signal<any[]>([]);
  selectedTenant = signal<any>(null);
  showRenewalPopup = signal<boolean>(false);

  // Form bindings
  newLeaseStart = '';
  newLeaseEnd = '';
  newRent = 0;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const rawTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    const active = rawTenants.filter((t: any) => t.status === 'Active' || t.status === 'Notice');

    const mapped = active.map((t: any) => {
      const prop = properties.find((p: any) => p.id === t.propertyId);
      const room = rooms.find((r: any) => r.id === t.roomId);
      const bed = beds.find((b: any) => b.id === t.bedId);

      // Compute lease expiry remaining days
      let daysRemaining = 365;
      if (t.leaseEndDate) {
        const diffTime = new Date(t.leaseEndDate).getTime() - new Date().getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      return {
        ...t,
        fullName: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        propertyName: prop ? prop.name : 'Unknown Property',
        roomNumber: room ? room.roomNumber : 'N/A',
        bedNumber: bed ? bed.bedNumber.split('-').pop() || bed.bedNumber : 'N/A',
        daysRemaining
      };
    });

    // Filter only those whose lease expires in the next 60 days
    const expiring = mapped.filter((t: any) => t.daysRemaining <= 60);

    this.tenants.set(expiring);
    if (expiring.length > 0) {
      this.selectedTenant.set(expiring[0]);
    }
  }

  expiringTenants = computed(() => {
    return this.tenants().sort((a, b) => a.daysRemaining - b.daysRemaining);
  });

  setupRenewalForm() {
    const t = this.selectedTenant();
    if (!t) return;

    this.newLeaseStart = new Date().toISOString().split('T')[0];
    
    // Default new lease end date to 1 year later
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    this.newLeaseEnd = end.toISOString().split('T')[0];
    
    this.newRent = t.monthlyRent || t.rent || 0;
    this.showRenewalPopup.set(true);
  }

  executeRenewal() {
    const t = this.selectedTenant();
    if (!t) return;

    this.crudService.update<any>(StorageKeys.TENANTS, t.id, {
      leaseStartDate: this.newLeaseStart,
      leaseEndDate: this.newLeaseEnd,
      monthlyRent: this.newRent,
      rent: this.newRent,
      status: 'Active'
    });

    alert(`Successfully renewed lease for ${t.fullName}! Extended until ${this.newLeaseEnd} at ₹${this.newRent.toLocaleString()}/month.`);
    this.showRenewalPopup.set(false);
    this.loadData();
  }

  sendReminder(t: any) {
    this.notifyService.addNotification({
      orgId: t.orgId || 'org-001',
      userId: t.id,
      title: 'Lease Expiration Reminder',
      message: `Dear ${t.fullName}, your lease in Room ${t.roomNumber} expires on ${t.leaseEndDate}. Please contact operations to extend.`,
      type: 'Info'
    });
    alert(`Lease expiration alert dispatched to ${t.fullName}.`);
  }
}
