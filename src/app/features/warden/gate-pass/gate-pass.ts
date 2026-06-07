import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';

interface GatePass {
  id: string;
  tenantId: string;
  tenantName: string;
  type: string;
  duration: string;
  reason: string;
  status: string;
  createdAt: string;
  overdue?: boolean;
}

interface Visitor {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  phone: string;
  purpose: string;
  checkInTime: string;
}

interface Tenant {
  id: string;
  fullName: string;
}

@Component({
  selector: 'app-warden-gate-pass',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Gate Pass & Visitors" subtitle="Approve student gate passes and log daily guest directories" />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- LEFT PANELS: Gate Pass Approval & Overdue warnings -->
        <div class="xl:col-span-2 space-y-6">
          
          <!-- Gate Pass Approvals Queue -->
          <div class="glass-card p-6 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Pending Out-Pass Requests</h4>
            
            <div class="space-y-3">
              @for (gp of pendingPasses(); track gp.id) {
                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 space-y-3 text-xs">
                  <div class="flex justify-between items-start">
                    <div class="space-y-0.5">
                      <h5 class="font-extrabold text-slate-800 dark:text-white text-sm">{{ gp.tenantName }}</h5>
                      <p class="text-[10px] text-slate-400">Request: <b>{{ gp.type }}</b> · Duration: {{ gp.duration }}</p>
                    </div>
                    <span class="text-[9px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-extrabold">{{ gp.status }}</span>
                  </div>
                  <p class="text-slate-600 dark:text-slate-400 italic">"Reason: {{ gp.reason }}"</p>
                  
                  <div class="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                    <button pButton label="Reject" class="p-button-text p-button-sm text-red-500 hover:bg-red-50" (click)="updatePassStatus(gp.id, 'Rejected')"></button>
                    <button pButton label="Approve Gate Pass" class="p-button-sm rounded-xl bg-emerald-500 border-none text-white hover:bg-emerald-600" (click)="updatePassStatus(gp.id, 'Approved')"></button>
                  </div>
                </div>
              } @empty {
                <p class="text-xs text-slate-400 italic text-center py-4">No pending gate pass requests in queue.</p>
              }
            </div>
          </div>

          <!-- Overdue Out Passes -->
          <div class="glass-card p-6 border-l-4 border-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent space-y-3">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <i class="pi pi-exclamation-triangle text-amber-500 text-base"></i>
              Overdue Returns Checklist
            </h4>
            
            <div class="space-y-2">
              @for (op of overduePasses(); track op.id) {
                <div class="p-3 rounded-xl border border-amber-100 dark:border-amber-950/30 bg-white/40 dark:bg-slate-900/40 flex justify-between items-center text-xs">
                  <div>
                    <h5 class="font-bold text-slate-800 dark:text-white">{{ op.tenantName }}</h5>
                    <p class="text-[10px] text-slate-400">Gate Pass: {{ op.type }} · Scheduled Return: 2 hours ago</p>
                  </div>
                  <button pButton label="Call Resident" icon="pi pi-phone" (click)="alertCall(op.tenantName)"
                    class="p-button-xs p-button-outlined rounded-lg border-amber-300 text-amber-600 hover:bg-amber-50"></button>
                </div>
              } @empty {
                <p class="text-xs text-slate-400 italic py-2">No students currently overdue for return.</p>
              }
            </div>
          </div>

        </div>

        <!-- RIGHT PANEL: Visitor Registration & logs -->
        <div class="xl:col-span-1 space-y-6">
          
          <!-- Visitor Registration form -->
          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">New Visitor Registration</h4>
            
            <div class="space-y-3 text-xs">
              <div class="space-y-1">
                <label class="font-bold text-slate-500 uppercase text-[9px]">Visitor Name</label>
                <input type="text" [(ngModel)]="vName" placeholder="Full name of guest"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-500 uppercase text-[9px]">Phone Contact</label>
                <input type="text" [(ngModel)]="vPhone" placeholder="10-digit number"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-500 uppercase text-[9px]">Resident Host</label>
                <select [(ngModel)]="vHostId"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
                  <option value="">-- Choose Host --</option>
                  @for (t of tenants(); track t.id) {
                    <option [value]="t.id">{{ t.fullName }}</option>
                  }
                </select>
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-500 uppercase text-[9px]">Purpose of Visit</label>
                <input type="text" [(ngModel)]="vPurpose" placeholder="e.g. Study, Delivery, Family"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
              </div>

              <button pButton label="Check-In Visitor" icon="pi pi-check" (click)="saveVisitor()"
                [disabled]="!isVisitorValid()"
                class="w-full py-2.5 rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 font-bold shadow-md shadow-indigo-500/10">
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class WardenGatePass implements OnInit {
  private crudService = inject(CrudService);

  // Lists
  gatePasses = signal<GatePass[]>([]);
  visitors = signal<Visitor[]>([]);
  tenants = signal<Tenant[]>([]);

  pendingPasses = computed(() => this.gatePasses().filter(gp => gp.status === 'Pending'));
  overduePasses = computed(() => this.gatePasses().filter(gp => gp.overdue && gp.status === 'Approved'));

  // Visitor Form inputs
  vName = '';
  vPhone = '';
  vHostId = '';
  vPurpose = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // 1. Get tenants list
    const list = this.crudService.getAll<Tenant>(StorageKeys.TENANTS);
    this.tenants.set(list.filter((t: any) => t.propertyId === 'prop-001' && t.status === 'Active'));

    // 2. Load Gate Passes from lsp_gate_passes
    const passes = this.crudService.getAll<any>(StorageKeys.GATE_PASSES);
    
    // Seed standard gate passes if empty
    if (passes.length === 0) {
      const seed: GatePass[] = [
        { id: 'gp-101', tenantId: 'tenant-001', tenantName: 'Aditya Patel', type: 'Overnight', duration: '1 Night (May 31 - Jun 1)', reason: 'Going to family home in Pune.', status: 'Pending', createdAt: new Date().toISOString() },
        { id: 'gp-102', tenantId: 'tenant-002', tenantName: 'Rahul Sharma', type: 'Leave', duration: '3 Days', reason: 'Medical emergency checkup.', status: 'Pending', createdAt: new Date().toISOString() },
        { id: 'gp-103', tenantId: 'tenant-003', tenantName: 'Rohan Sen', type: 'Temporary Out', duration: '4 Hours', reason: 'Buying college textbooks.', status: 'Approved', overdue: true, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() }
      ];
      localStorage.setItem(StorageKeys.GATE_PASSES, JSON.stringify(seed));
      this.gatePasses.set(seed);
    } else {
      // map full names
      const mapped = passes.map((p: any) => {
        const tenant = list.find((t: any) => t.id === p.tenantId);
        return {
          id: p.id,
          tenantId: p.tenantId,
          tenantName: tenant ? tenant.fullName : 'Resident User',
          type: p.type,
          duration: p.duration || 'Hours',
          reason: p.reason || 'Personal work',
          status: p.status || 'Pending',
          overdue: p.overdue || false,
          createdAt: p.createdAt
        };
      });
      this.gatePasses.set(mapped);
    }

    // 3. Load Visitors
    const activeVisitors = localStorage.getItem('lsp_visitors');
    this.visitors.set(activeVisitors ? JSON.parse(activeVisitors) : []);
  }

  updatePassStatus(passId: string, status: string) {
    const list = this.crudService.getAll<any>(StorageKeys.GATE_PASSES);
    const idx = list.findIndex(p => p.id === passId);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem(StorageKeys.GATE_PASSES, JSON.stringify(list));
      this.loadData();
    }
  }

  isVisitorValid(): boolean {
    return (
      !!this.vName.trim() &&
      !!this.vPhone.trim() &&
      !!this.vHostId &&
      !!this.vPurpose.trim()
    );
  }

  saveVisitor() {
    if (!this.isVisitorValid()) return;

    const host = this.tenants().find(t => t.id === this.vHostId);
    const newVisitor: Visitor = {
      id: 'v-' + Math.random().toString(36).substring(7),
      name: this.vName,
      hostId: this.vHostId,
      hostName: host ? host.fullName : 'Resident',
      phone: this.vPhone,
      purpose: this.vPurpose,
      checkInTime: new Date().toISOString()
    };

    const activeList = this.visitors();
    activeList.unshift(newVisitor);
    localStorage.setItem('lsp_visitors', JSON.stringify(activeList));
    this.visitors.set(activeList);

    // Reset Form
    this.vName = '';
    this.vPhone = '';
    this.vHostId = '';
    this.vPurpose = '';

    alert('Visitor checked in and logged successfully!');
  }

  alertCall(name: string) {
    alert(`Calling ${name} on registered primary mobile number...`);
  }
}
