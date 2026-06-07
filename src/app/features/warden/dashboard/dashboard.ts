import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface Visitor {
  id: string;
  name: string;
  hostName: string;
  purpose: string;
  checkInTime: string;
}

@Component({
  selector: 'app-warden-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeader, StatCard, StatusBadge, ButtonModule, DialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Warden Security Desk" subtitle="Monitor building security, curfew times, and gate passes in real-time" />

      <!-- Security Telemetry KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Gate Status" value="Locked (10 PM Curfew)" icon="pi-lock" color="primary" />
        <app-stat-card label="Residents Checked Out" value="12 Out of 45" icon="pi-sign-out" color="warning" />
        <app-stat-card label="Visitors In Building" [value]="visitorCount().toString()" icon="pi-user" color="success" />
        <app-stat-card label="Pending Passes" value="3 Approval" icon="pi-id-card" color="danger" />
      </div>

      <!-- Emergency Operations Panel -->
      <div class="glass-card p-6 border-l-4 border-red-500 bg-gradient-to-r from-red-500/5 to-orange-500/5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h3 class="text-base font-extrabold text-red-600 dark:text-red-400 flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
              Emergency Broadcast Center
            </h3>
            <p class="text-xs text-slate-500">Deploy immediate evacuation broadcasts, notify parents, and call first responders in one tap.</p>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button (click)="triggerEmergency('Fire')"
            class="py-3 px-4 rounded-xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-extrabold text-xs flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            <i class="pi pi-exclamation-circle text-lg"></i>
            Fire Evacuate
          </button>
          
          <button (click)="triggerEmergency('Medical')"
            class="py-3 px-4 rounded-xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-extrabold text-xs flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            <i class="pi pi-heart-fill text-lg"></i>
            Medical Alert
          </button>

          <button (click)="triggerEmergency('Security')"
            class="py-3 px-4 rounded-xl border border-amber-200 dark:border-amber-950 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-extrabold text-xs flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            <i class="pi pi-shield text-lg"></i>
            Lock Gates
          </button>

          <button (click)="triggerEmergency('Disaster')"
            class="py-3 px-4 rounded-xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-extrabold text-xs flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            <i class="pi pi-cloud text-lg"></i>
            Evacuation Protocol
          </button>

          <button (click)="triggerEmergency('Missing')"
            class="py-3 px-4 rounded-xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-extrabold text-xs flex flex-col items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
            <i class="pi pi-search text-lg"></i>
            Missing Person
          </button>
        </div>
      </div>

      <!-- Active Logs and Curfew Violations -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Live Visitor Log -->
        <div class="xl:col-span-2 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Live Visitors In Building</h4>
          
          <div class="glass-card p-5 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase font-bold text-[10px]">
                    <th class="py-2.5">Visitor</th>
                    <th class="py-2.5">Resident Host</th>
                    <th class="py-2.5">Purpose</th>
                    <th class="py-2.5">Check-In Time</th>
                    <th class="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                  @for (v of visitors(); track v.id) {
                    <tr>
                      <td class="py-3.5 font-bold text-slate-800 dark:text-white">{{ v.name }}</td>
                      <td class="py-3.5">{{ v.hostName }}</td>
                      <td class="py-3.5 text-slate-500">{{ v.purpose }}</td>
                      <td class="py-3.5">{{ v.checkInTime | date:'shortTime' }}</td>
                      <td class="py-3.5"><app-status-badge status="Active" /></td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-6 text-center text-slate-400 italic">No visitors checked in today.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Curfew Violation Warnings -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Curfew Threshold Warnings</h4>
          
          <div class="glass-card p-5 space-y-4 max-h-[360px] overflow-y-auto">
            <div class="p-3.5 rounded-xl border border-amber-100 dark:border-amber-950/40 bg-amber-500/5 space-y-2 text-xs">
              <div class="flex justify-between items-center">
                <span class="font-extrabold text-amber-500">Late Out of Bounds</span>
                <span class="text-[9px] text-slate-400">9:45 PM</span>
              </div>
              <p class="text-slate-700 dark:text-slate-300"><b>Rahul Sharma</b> (Room 102) has not checked in through the gate pass scanner yet.</p>
              <div class="flex justify-end gap-2 pt-1.5">
                <button pButton label="SMS Parent" class="p-button-xs p-button-outlined rounded-lg text-[10px] py-1 border-amber-300 text-amber-600" (click)="notifyParent()"></button>
              </div>
            </div>

            <div class="p-3.5 rounded-xl border border-red-100 dark:border-red-950/40 bg-red-500/5 space-y-2 text-xs">
              <div class="flex justify-between items-center">
                <span class="font-extrabold text-red-500">Unapproved Leave</span>
                <span class="text-[9px] text-slate-400">6:15 PM</span>
              </div>
              <p class="text-slate-700 dark:text-slate-300"><b>Deepak Mishra</b> (Room 205) is currently marked absent without an active gate pass.</p>
              <div class="flex justify-end gap-2 pt-1.5">
                <button pButton label="Alert Parent" class="p-button-xs rounded-lg text-[10px] py-1 bg-red-500 text-white border-none" (click)="notifyParent()"></button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Emergency Broadcast Modal Dialog -->
      <p-dialog [(visible)]="emergencyDialog" [header]="'EMERGENCY BROADCAST STATUS: ' + emergencyType"
        [modal]="true" [style]="{width: '520px'}" styleClass="rounded-2xl border-l-8 border-red-500 dark:bg-slate-900">
        <div class="space-y-5 p-2 text-xs">
          
          <div class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 flex items-center gap-3">
            <i class="pi pi-exclamation-triangle text-red-500 text-3xl animate-pulse"></i>
            <div>
              <h4 class="font-extrabold text-red-700 dark:text-red-400 text-sm">Critical Evacuation Protocol Activated</h4>
              <p class="text-slate-600 dark:text-slate-400 mt-0.5">Siren deployed, electronic doors set to fail-safe exit mode, and local emergency centers dispatched.</p>
            </div>
          </div>

          <!-- Progress Metrics -->
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p class="text-[10px] text-slate-500 font-semibold uppercase">SMS Broadcats Sent</p>
              <h4 class="text-base font-extrabold text-emerald-500">100% Successful</h4>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <p class="text-[10px] text-slate-500 font-semibold uppercase">Evacuation Evident Rate</p>
              <h4 class="text-base font-extrabold text-indigo-500">38 / 45 Residents</h4>
            </div>
          </div>

          <!-- Activity logs logs -->
          <div class="space-y-2">
            <h5 class="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Broadcast Dispatch logs:</h5>
            <div class="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[10px] space-y-1.5 border border-slate-800">
              <p class="text-emerald-400">> [0.00s] INITIALIZING BROADCAST PROTOCOL...</p>
              <p class="text-emerald-400">> [0.08s] DIALING FIRE RESPONDERS DEPT & LOCAL AMBULANCE SERVICE...</p>
              <p class="text-indigo-400">> [0.45s] SMS DISPATCHED TO 45 RESIDENTS & 45 ASSOCIATED PARENTS.</p>
              <p class="text-indigo-400">> [0.98s] PUSH SYSTEM ALERTS TRANSMITTED TO LIVESPACE APP NODES.</p>
              <p class="text-amber-400">> [1.50s] SIREN REVERB CYCLE: ACTIVE.</p>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button pButton label="Silence Siren & Reset System" class="p-button-danger p-button-sm rounded-xl px-4 py-2 border-none bg-red-600 text-white" (click)="emergencyDialog = false"></button>
          </div>

        </div>
      </p-dialog>

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
export class WardenDashboard implements OnInit {
  private crudService = inject(CrudService);

  visitors = signal<Visitor[]>([]);
  visitorCount = computed(() => this.visitors().length);

  emergencyDialog = false;
  emergencyType = 'Fire';

  ngOnInit() {
    this.loadVisitors();
  }

  loadVisitors() {
    const list = localStorage.getItem('lsp_visitors');
    if (list) {
      this.visitors.set(JSON.parse(list));
    } else {
      const seed: Visitor[] = [
        { id: 'v-1', name: 'Amit Patel', hostName: 'Aditya Patel', purpose: 'Family Visit', checkInTime: new Date(Date.now() - 3600000).toISOString() },
        { id: 'v-2', name: 'Vikram Mehta', hostName: 'Rajesh Sen', purpose: 'Project Study', checkInTime: new Date(Date.now() - 7200000).toISOString() }
      ];
      localStorage.setItem('lsp_visitors', JSON.stringify(seed));
      this.visitors.set(seed);
    }
  }

  triggerEmergency(type: string) {
    this.emergencyType = type;
    this.emergencyDialog = true;
  }

  notifyParent() {
    alert('SMS notification sent to resident parent phone successfully!');
  }
}
