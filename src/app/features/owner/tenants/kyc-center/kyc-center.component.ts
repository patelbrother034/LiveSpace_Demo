import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-kyc-center',
  standalone: true,
  imports: [CommonModule, PageHeader, StatusBadge, Avatar, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Compliance & KYC Center" subtitle="Verify and audit resident identification documentation"></app-page-header>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: KYC Directory List -->
        <div class="lg:col-span-2 space-y-4">
          <div class="glass-card p-4">
            <div class="flex items-center justify-between border-b pb-3 mb-4">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Verification Logs</h3>
              <div class="flex items-center gap-2">
                @for (filterState of ['All', 'Submitted', 'Verified', 'Pending']; track filterState) {
                  <button pButton [label]="filterState"
                    [class]="activeFilter() === filterState ? 'p-button-sm rounded-lg bg-indigo-500 text-white' : 'p-button-sm p-button-text text-slate-500'"
                    (click)="activeFilter.set(filterState)">
                  </button>
                }
              </div>
            </div>

            <!-- List table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b text-xs font-semibold text-slate-400 uppercase">
                    <th class="py-3 px-3">Resident</th>
                    <th class="py-3 px-3">Aadhaar/PAN</th>
                    <th class="py-3 px-3 text-center">Status</th>
                    <th class="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y text-xs">
                  @for (t of filteredTenants(); track t.id) {
                    <tr class="hover:bg-slate-50/50 cursor-pointer" [class.bg-indigo-50/20]="selectedTenant()?.id === t.id" (click)="selectedTenant.set(t)">
                      <td class="py-3 px-3">
                        <div class="flex items-center gap-2">
                          <app-avatar [name]="t.fullName" size="sm" />
                          <div>
                            <p class="font-bold text-slate-800 dark:text-white">{{ t.fullName }}</p>
                            <p class="text-[10px] text-slate-400">{{ t.propertyName }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-3 text-slate-500">
                        <p><strong>AADHAAR:</strong> XXXX-XXXX-{{ t.aadhaarNumber?.slice(-4) || 'N/A' }}</p>
                        <p><strong>PAN:</strong> {{ t.panNumber || 'N/A' }}</p>
                      </td>
                      <td class="py-3 px-3 text-center">
                        <app-status-badge [status]="t.kycStatus" />
                      </td>
                      <td class="py-3 px-3 text-center" (click)="$event.stopPropagation()">
                        <button pButton icon="pi pi-pencil" class="p-button-sm p-button-text text-slate-500" pTooltip="Audit Documents" tooltipPosition="left" (click)="selectedTenant.set(t)"></button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="py-6 text-center text-slate-400">No verification requests found matching this filter.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Verification Audit Side Panel -->
        <div class="space-y-6">
          @if (selectedTenant()) {
            <div class="glass-card p-6 space-y-5 animate-fade-in">
              <div class="border-b pb-3 flex items-center justify-between">
                <h3 class="font-bold text-slate-800 dark:text-white">Audit Verification Case</h3>
                <span class="text-[10px] text-slate-400 font-semibold">ID: {{ selectedTenant().id }}</span>
              </div>

              <div class="flex items-center gap-3">
                <app-avatar [name]="selectedTenant().fullName" size="md" />
                <div>
                  <h4 class="font-bold text-sm text-slate-800 dark:text-white">{{ selectedTenant().fullName }}</h4>
                  <p class="text-xs text-slate-400">{{ selectedTenant().email }} • {{ selectedTenant().phone }}</p>
                </div>
              </div>

              <!-- Identity Details Grid -->
              <div class="space-y-3 text-xs bg-slate-50/50 p-4 rounded-xl border">
                <div class="flex justify-between">
                  <span class="text-slate-400">Aadhaar Number</span>
                  <span class="font-semibold text-slate-700">{{ selectedTenant().aadhaarNumber || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">PAN Number</span>
                  <span class="font-semibold text-slate-700">{{ selectedTenant().panNumber || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">KYC Status</span>
                  <app-status-badge [status]="selectedTenant().kycStatus" />
                </div>
              </div>

              <!-- Document check screen -->
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase">Uploaded Document Preview</label>
                <div class="relative rounded-xl border border-indigo-100 dark:border-indigo-900/30 overflow-hidden h-40 bg-slate-900 flex items-center justify-center text-white">
                  <i class="pi pi-file-pdf text-3xl mb-2 text-rose-500 block"></i>
                  <span class="text-xs font-semibold">aadhaar_document_{{ selectedTenant().id }}.pdf</span>
                  <div class="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-all flex items-center justify-center">
                    <button pButton icon="pi pi-external-link" label="Open PDF Document" class="p-button-sm p-button-rounded bg-indigo-500 border-none text-white text-[10px]"></button>
                  </div>
                </div>
              </div>

              <!-- Audit verification actions -->
              <div class="grid grid-cols-2 gap-3 pt-2 border-t">
                <button pButton label="Reject Verification" icon="pi pi-times-circle" 
                  [disabled]="selectedTenant().kycStatus === 'Verified'"
                  (click)="updateStatus('Rejected')"
                  class="p-button-outlined p-button-danger rounded-xl text-xs py-2 w-full">
                </button>
                <button pButton label="Approve KYC" icon="pi pi-check-circle" 
                  [disabled]="selectedTenant().kycStatus === 'Verified'"
                  (click)="updateStatus('Verified')"
                  class="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white text-xs py-2 w-full">
                </button>
              </div>

            </div>
          } @else {
            <div class="glass-card p-8 text-center space-y-3">
              <i class="pi pi-folder-open text-3xl text-slate-300"></i>
              <p class="text-sm font-semibold text-slate-400">Select a resident case from the verification log to audit and approve documentation.</p>
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
export class KycCenterComponent implements OnInit {
  private crudService = inject(CrudService);

  activeFilter = signal<string>('All');
  tenants = signal<any[]>([]);
  selectedTenant = signal<any>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const rawTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);

    const mapped = rawTenants.map((t: any) => {
      const prop = properties.find((p: any) => p.id === t.propertyId);
      return {
        ...t,
        fullName: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        propertyName: prop ? prop.name : 'Unknown Property'
      };
    });

    this.tenants.set(mapped);
    
    // Automatically select the first pending case
    const submitted = mapped.find(t => t.kycStatus === 'Submitted');
    if (submitted) {
      this.selectedTenant.set(submitted);
    } else if (mapped.length > 0) {
      this.selectedTenant.set(mapped[0]);
    }
  }

  filteredTenants = computed(() => {
    const filter = this.activeFilter();
    let list = this.tenants();

    if (filter !== 'All') {
      list = list.filter(t => t.kycStatus === filter);
    }
    return list;
  });

  updateStatus(status: string) {
    const active = this.selectedTenant();
    if (!active) return;

    this.crudService.update<any>(StorageKeys.TENANTS, active.id, { kycStatus: status });
    alert(`KYC Status updated to: ${status}`);
    this.loadData();

    // Reset current selection with updated data
    const updated = this.tenants().find(t => t.id === active.id);
    this.selectedTenant.set(updated);
  }
}
