import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-notice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatusBadge, Avatar, ButtonModule, InputTextModule, TooltipModule, DatePicker],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Checkout Notice Logs" subtitle="Monitor notice periods and coordinate resident departures"></app-page-header>

      <!-- Main Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Notice logs table -->
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-card p-6">
            <div class="flex items-center justify-between border-b pb-3 mb-4">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Residents in Notice Period</h3>
              <button pButton label="Log Notice Request" icon="pi pi-plus" (click)="showLogForm.set(true)"
                class="p-button-sm rounded-lg bg-indigo-500 border-none text-white hover:opacity-90">
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b text-xs font-semibold text-slate-400 uppercase">
                    <th class="py-3 px-3">Resident</th>
                    <th class="py-3 px-3">Room</th>
                    <th class="py-3 px-3">Notice Filed</th>
                    <th class="py-3 px-3">Departure Date</th>
                    <th class="py-3 px-3 text-center">Remaining</th>
                    <th class="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y text-xs">
                  @for (t of noticeTenants(); track t.id) {
                    <tr class="hover:bg-slate-50/50 cursor-pointer" [class.bg-rose-50/10]="selectedTenant()?.id === t.id" (click)="selectedTenant.set(t)">
                      <td class="py-3 px-3">
                        <div class="flex items-center gap-2">
                          <app-avatar [name]="t.fullName" size="sm" />
                          <div>
                            <p class="font-bold text-slate-800 dark:text-white">{{ t.fullName }}</p>
                            <p class="text-[10px] text-slate-400">{{ t.phone }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-3 text-slate-500">
                        <p class="font-semibold">{{ t.propertyName }}</p>
                        <p>Room {{ t.roomNumber }} - Bed {{ t.bedNumber }}</p>
                      </td>
                      <td class="py-3 px-3 text-slate-500">
                        {{ t.noticeDate || 'Recently Logged' }}
                      </td>
                      <td class="py-3 px-3">
                        <p class="font-bold text-rose-500">{{ t.expectedCheckoutDate || '30 days from now' }}</p>
                        <p class="text-[10px] text-slate-400">Notice: 30 days</p>
                      </td>
                      <td class="py-3 px-3 text-center font-bold text-rose-600">
                        {{ t.daysRemaining }} days
                      </td>
                      <td class="py-3 px-3 text-center" (click)="$event.stopPropagation()">
                        <div class="flex items-center justify-center gap-1">
                          <button pButton icon="pi pi-times" class="p-button-sm p-button-text text-slate-400" pTooltip="Cancel Notice" tooltipPosition="top" (click)="cancelNotice(t)"></button>
                          <button pButton icon="pi pi-sign-out" class="p-button-sm p-button-text text-rose-500" pTooltip="Trigger Clearance" tooltipPosition="top" (click)="triggerClearance(t)"></button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="py-8 text-center text-slate-400">No active residents are currently under notice period.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Log Notice form / Details panel -->
        <div class="space-y-6">
          @if (showLogForm()) {
            <div class="glass-card p-6 space-y-5 animate-fade-in">
              <div class="border-b pb-3 flex items-center justify-between">
                <h3 class="font-bold text-slate-800 dark:text-white">Log Departure Notice</h3>
                <button pButton icon="pi pi-times" class="p-button-sm p-button-text text-slate-400" (click)="showLogForm.set(false)"></button>
              </div>

              <div class="space-y-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase">Select Active Resident *</label>
                  <select [(ngModel)]="newNoticeTenantId" class="w-full px-3 py-2 rounded-lg border text-xs bg-white">
                    <option value="">Choose Resident</option>
                    @for (t of activeResidents; track t.id) {
                      <option [value]="t.id">{{ t.fullName }} (Room {{ t.roomNumber }} - Bed {{ t.bedNumber }})</option>
                    }
                  </select>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase">Notice Filed Date *</label>
                  <p-datepicker [(ngModel)]="newNoticeDate" styleClass="w-full" inputStyleClass="w-full text-xs" dateFormat="yy-mm-dd"></p-datepicker>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase">Expected Departure Date *</label>
                  <p-datepicker [(ngModel)]="newCheckoutDate" styleClass="w-full" inputStyleClass="w-full text-xs" dateFormat="yy-mm-dd"></p-datepicker>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase">Checkout Reason *</label>
                  <textarea [(ngModel)]="newNoticeReason" rows="2" class="w-full px-3 py-2 rounded-lg border text-xs bg-white" placeholder="e.g. Completed internship / moving back home"></textarea>
                </div>
              </div>

              <div class="flex gap-2">
                <button pButton label="Cancel" (click)="showLogForm.set(false)" class="p-button-sm p-button-outlined p-button-secondary rounded-lg text-xs py-1.5 flex-1"></button>
                <button pButton label="Log Notice" (click)="executeLogNotice()" class="p-button-sm p-button-danger rounded-lg text-white text-xs py-1.5 flex-1"></button>
              </div>
            </div>
          } @else if (selectedTenant()) {
            <div class="glass-card p-6 space-y-5 animate-fade-in">
              <div class="border-b pb-3">
                <h3 class="font-bold text-slate-800 dark:text-white">Notice Clearance Details</h3>
              </div>

              <div class="flex items-center gap-3">
                <app-avatar [name]="selectedTenant().fullName" size="md" />
                <div>
                  <h4 class="font-bold text-sm text-slate-800 dark:text-white">{{ selectedTenant().fullName }}</h4>
                  <p class="text-xs text-slate-400">Room {{ selectedTenant().roomNumber }} / Bed {{ selectedTenant().bedNumber }}</p>
                </div>
              </div>

              <!-- Details card -->
              <div class="space-y-3 text-xs bg-slate-50/50 p-4 rounded-xl border">
                <div class="flex justify-between">
                  <span class="text-slate-400">Notice Date</span>
                  <span class="font-semibold text-slate-700">{{ selectedTenant().noticeDate || 'Recently Logged' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Departure Scheduled</span>
                  <span class="font-bold text-rose-500">{{ selectedTenant().expectedCheckoutDate || '30 Days From Notice' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Notice Days Count</span>
                  <span class="font-semibold text-slate-700">30 Days</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Pending Dues</span>
                  <span class="font-bold text-red-500">₹{{ selectedTenant().pendingDues | number }}</span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2">
                <button pButton label="Cancel Notice" icon="pi pi-times" (click)="cancelNotice(selectedTenant())"
                  class="p-button-outlined p-button-secondary rounded-xl text-xs py-2 w-full">
                </button>
                <button pButton label="Start Clearance" icon="pi pi-sign-out" (click)="triggerClearance(selectedTenant())"
                  class="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 border-none text-white text-xs py-2 w-full">
                </button>
              </div>

              <div class="p-4 rounded-xl border border-rose-50 bg-rose-50/30 text-[10px] text-rose-700 flex gap-2">
                <i class="pi pi-info-circle text-xs shrink-0 mt-0.5"></i>
                <p>Curfew gate passes and smart key access tags will automatically expire at midnight on the departure scheduled date.</p>
              </div>
            </div>
          } @else {
            <div class="glass-card p-8 text-center space-y-3">
              <i class="pi pi-bell text-3xl text-slate-300"></i>
              <p class="text-sm font-semibold text-slate-400">Select a resident case from the notice logs to manage checkout clearances or log a new departure notice.</p>
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
export class NoticeListComponent implements OnInit {
  private router = inject(Router);
  private crudService = inject(CrudService);

  tenants = signal<any[]>([]);
  activeResidents: any[] = [];
  selectedTenant = signal<any>(null);
  showLogForm = signal<boolean>(false);

  // Log Form Bindings
  newNoticeTenantId = '';
  newNoticeDate = '';
  newCheckoutDate = '';
  newNoticeReason = '';

  ngOnInit() {
    this.loadData();
    this.newNoticeDate = new Date().toISOString().split('T')[0];
    const exp = new Date();
    exp.setDate(exp.getDate() + 30);
    this.newCheckoutDate = exp.toISOString().split('T')[0];
  }

  loadData() {
    const rawTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    // Mapped active residents for Logging notices
    const activeOnly = rawTenants.filter((t: any) => t.status === 'Active');
    this.activeResidents = activeOnly.map((t: any) => {
      const prop = properties.find((p: any) => p.id === t.propertyId);
      const room = rooms.find((r: any) => r.id === t.roomId);
      const bed = beds.find((b: any) => b.id === t.bedId);

      return {
        id: t.id,
        fullName: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        propertyName: prop ? prop.name : 'Unknown Property',
        roomNumber: room ? room.roomNumber : 'N/A',
        bedNumber: bed ? bed.bedNumber.split('-').pop() || bed.bedNumber : 'N/A'
      };
    });

    // Mapped notice residents
    const noticeOnly = rawTenants.filter((t: any) => t.status === 'Notice');
    const mappedNotice = noticeOnly.map((t: any) => {
      const prop = properties.find((p: any) => p.id === t.propertyId);
      const room = rooms.find((r: any) => r.id === t.roomId);
      const bed = beds.find((b: any) => b.id === t.bedId);

      // Compute notice expiry remaining days
      let daysRemaining = 30;
      const expectedOut = t.expectedCheckoutDate || new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (expectedOut) {
        const diffTime = new Date(expectedOut).getTime() - new Date().getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      return {
        ...t,
        fullName: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        propertyName: prop ? prop.name : 'Unknown Property',
        roomNumber: room ? room.roomNumber : 'N/A',
        bedNumber: bed ? bed.bedNumber.split('-').pop() || bed.bedNumber : 'N/A',
        daysRemaining,
        expectedCheckoutDate: expectedOut
      };
    });

    this.tenants.set(mappedNotice);
    if (mappedNotice.length > 0) {
      this.selectedTenant.set(mappedNotice[0]);
    } else {
      this.selectedTenant.set(null);
    }
  }

  noticeTenants = computed(() => {
    return this.tenants().sort((a, b) => a.daysRemaining - b.daysRemaining);
  });

  cancelNotice(t: any) {
    this.crudService.update<any>(StorageKeys.TENANTS, t.id, {
      status: 'Active',
      noticeDate: null,
      expectedCheckoutDate: null,
      checkoutReason: null
    });
    alert(`Checkout notice for ${t.fullName} cancelled successfully. Status set back to ACTIVE.`);
    this.loadData();
  }

  triggerClearance(t: any) {
    this.router.navigate(['/owner/tenants/check-out'], { queryParams: { tenantId: t.id } });
  }

  executeLogNotice() {
    if (!this.newNoticeTenantId) {
      alert('Please select an active resident.');
      return;
    }

    this.crudService.update<any>(StorageKeys.TENANTS, this.newNoticeTenantId, {
      status: 'Notice',
      noticeDate: this.newNoticeDate,
      expectedCheckoutDate: this.newCheckoutDate,
      checkoutReason: this.newNoticeReason
    });

    alert('Checkout notice logged successfully in resident timeline!');
    this.showLogForm.set(false);
    this.newNoticeTenantId = '';
    this.newNoticeReason = '';
    this.loadData();
  }
}
