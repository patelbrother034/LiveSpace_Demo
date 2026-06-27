import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';
import { PropertyContextService } from '../../../core/services/property-context.service';

interface Tenant {
  id: string;
  fullName: string;
  roomId: string;
  propertyId: string;
  floorId?: string;
  status: string;
  attendanceStatus?: string; // Present, Absent, Late
}

@Component({
  selector: 'app-warden-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Roll Call & Curfew" subtitle="Conduct daily student roll calls, log curfew limits, and track trends" />

      <!-- Curfew & Attendance Toggle Panel -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Attendance Sheet Roll Call -->
        <div class="xl:col-span-2 space-y-4">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Attendance Roll Sheet</h4>
            
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 font-semibold">Select Floor:</span>
              <select [(ngModel)]="activeFloor" (change)="onFloorChanged()"
                class="p-1 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
                @for (floor of floors(); track floor.id) {
                  <option [value]="floor.id">{{ getBuildingName(floor.buildingId) }} - {{ floor.name }}</option>
                }
              </select>
              <button pButton label="Bulk Present" icon="pi pi-check-square" (click)="bulkMarkPresent()"
                class="p-button-xs rounded-lg bg-indigo-500 border-none text-white hover:bg-indigo-600">
              </button>
            </div>
          </div>

          <div class="glass-card p-5 space-y-3.5 max-h-[500px] overflow-y-auto">
            @for (t of filteredTenants(); track t.id) {
              <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                <div class="space-y-0.5">
                  <h5 class="text-xs font-bold text-slate-800 dark:text-white">{{ t.fullName }}</h5>
                  <p class="text-[9.5px] text-slate-500 uppercase font-semibold">Room {{ t.roomId.replace('room-', '').toUpperCase() }}</p>
                </div>

                <!-- Status Selectors -->
                <div class="flex items-center gap-1">
                  @for (st of ['Present', 'Absent', 'Late']; track st) {
                    <button (click)="toggleAttendance(t.id, st)"
                      class="px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase border-none cursor-pointer transition-all"
                      [class]="t.attendanceStatus === st ? 
                        (st === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 
                         st === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 
                         'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400') : 
                        'bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-600'">
                      {{ st }}
                    </button>
                  }
                </div>
              </div>
            } @empty {
              <p class="text-xs text-slate-400 italic text-center py-6">No residents registered on this floor.</p>
            }
          </div>
        </div>

        <!-- Curfew limits and trends chart -->
        <div class="xl:col-span-1 space-y-6">
          
          <!-- Config Curfew panel -->
          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Curfew Threshold Limits</h4>
            
            <div class="space-y-3 text-xs">
              <div class="space-y-1">
                <label class="font-bold text-slate-500 uppercase text-[9px]">Night Curfew Deadline</label>
                <select [(ngModel)]="curfewHour"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
                  <option value="21:30">09:30 PM</option>
                  <option value="22:00">10:00 PM</option>
                  <option value="22:30">10:30 PM</option>
                  <option value="23:00">11:00 PM</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="font-bold text-slate-500 uppercase text-[9px]">Late Penalty Surcharge (₹)</label>
                <input type="number" [(ngModel)]="penaltyFee"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
              </div>

              <button pButton label="Update Curfew Parameters" (click)="saveCurfewSettings()"
                class="w-full py-2.5 rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 font-bold shadow-md shadow-indigo-500/10">
              </button>
            </div>
          </div>

          <!-- SVG Curfew Violations Line Chart -->
          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Late Entry Curfew Trends</h4>
            
            <div class="relative h-44 flex items-center justify-center">
              <!-- Custom Curfew Trend SVG Chart -->
              <svg viewBox="0 0 300 120" class="w-full h-full overflow-visible">
                <!-- Grid Lines -->
                <line x1="20" y1="20" x2="280" y2="20" stroke="#f1f5f9" stroke-width="1" class="dark:stroke-slate-800" />
                <line x1="20" y1="60" x2="280" y2="60" stroke="#f1f5f9" stroke-width="1" class="dark:stroke-slate-800" />
                <line x1="20" y1="100" x2="280" y2="100" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800/80" />
                
                <!-- Area underneath curve -->
                <path d="M 20 100 L 20 80 Q 63.3 75 106.6 40 T 193.3 55 T 280 20 L 280 100 Z" fill="url(#grad)" opacity="0.15" />
                
                <!-- Spline Line -->
                <path d="M 20 80 Q 63.3 75 106.6 40 T 193.3 55 T 280 20" fill="none" stroke="hsl(243, 75%, 59%)" stroke-width="2.5" />
                
                <!-- Data Points circles -->
                <circle cx="20" cy="80" r="3.5" fill="hsl(243, 75%, 59%)" stroke="#fff" stroke-width="1.5" />
                <circle cx="106.6" cy="40" r="3.5" fill="hsl(243, 75%, 59%)" stroke="#fff" stroke-width="1.5" />
                <circle cx="193.3" cy="55" r="3.5" fill="hsl(243, 75%, 59%)" stroke="#fff" stroke-width="1.5" />
                <circle cx="280" cy="20" r="3.5" fill="hsl(243, 75%, 59%)" stroke="#fff" stroke-width="1.5" />

                <!-- Text Labels -->
                <text x="20" y="115" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">Mon</text>
                <text x="106.6" y="115" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">Wed</text>
                <text x="193.3" y="115" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">Fri</text>
                <text x="280" y="115" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">Sun</text>

                <!-- Gradients -->
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="hsl(243, 75%, 59%)" />
                    <stop offset="100%" stop-color="#fff" stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p class="text-[9.5px] text-slate-500 italic text-center">7-Day Curfew Violation rate (Late check-ins peaked Sunday night)</p>
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
export class WardenAttendance implements OnInit {
  private crudService = inject(CrudService);
  private propertyContext = inject(PropertyContextService);

  propertyId = computed(() => this.propertyContext.activePropertyId() || 'prop-001');

  activeFloor = '';
  tenants = signal<Tenant[]>([]);
  floors = signal<any[]>([]);
  buildings = signal<any[]>([]);

  // Curfew Params
  curfewHour = '22:00';
  penaltyFee = 250;

  filteredTenants = computed(() => {
    const fId = this.activeFloor;
    if (!fId) return [];
    return this.tenants().filter(t => t.floorId === fId);
  });

  ngOnInit() {
    this.loadData();
    this.loadCurfewSettings();
  }

  loadData() {
    const propId = this.propertyId();

    // Load buildings
    const allBuildings = this.crudService.getAll<any>(StorageKeys.BUILDINGS);
    this.buildings.set(allBuildings);

    // Load floors
    const allFloors = this.crudService.getAll<any>(StorageKeys.FLOORS);
    const propFloors = allFloors.filter(f => f.propertyId === propId);
    this.floors.set(propFloors);

    if (propFloors.length > 0 && !this.activeFloor) {
      this.activeFloor = propFloors[0].id;
    }

    // Load tenants
    const list = this.crudService.getAll<Tenant>(StorageKeys.TENANTS);
    const active = list.filter(t => t.propertyId === propId && t.status === 'Active');
    
    // Wire pre-existing roll status
    active.forEach(t => {
      if (!t.attendanceStatus) {
        t.attendanceStatus = 'Present';
      }
    });

    this.tenants.set(active);
  }

  getBuildingName(bldId: string): string {
    const bld = this.buildings().find(b => b.id === bldId);
    return bld ? bld.name : 'Building';
  }

  loadCurfewSettings() {
    const curfew = localStorage.getItem('lsp_curfew_config');
    if (curfew) {
      const parsed = JSON.parse(curfew);
      this.curfewHour = parsed.curfewHour;
      this.penaltyFee = parsed.penaltyFee;
    }
  }

  onFloorChanged() {
    // Reload from state to clear intermediate updates if unsaved
  }

  toggleAttendance(tenantId: string, status: string) {
    const list = this.tenants();
    const idx = list.findIndex(t => t.id === tenantId);
    if (idx !== -1) {
      list[idx].attendanceStatus = status;
      this.tenants.set([...list]);
      
      // Persist status log directly in lsp_tenants
      const allTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
      const dbIdx = allTenants.findIndex(t => t.id === tenantId);
      if (dbIdx !== -1) {
        allTenants[dbIdx].attendanceStatus = status;
        localStorage.setItem(StorageKeys.TENANTS, JSON.stringify(allTenants));
      }
    }
  }

  bulkMarkPresent() {
    const propId = this.propertyId();
    const list = this.tenants();
    list.forEach(t => {
      if (t.floorId === this.activeFloor) {
        t.attendanceStatus = 'Present';
      }
    });
    this.tenants.set([...list]);

    const allTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    allTenants.forEach(t => {
      if (t.propertyId === propId && t.floorId === this.activeFloor) {
        t.attendanceStatus = 'Present';
      }
    });
    localStorage.setItem(StorageKeys.TENANTS, JSON.stringify(allTenants));
    
    const floorObj = this.floors().find(f => f.id === this.activeFloor);
    const floorName = floorObj ? floorObj.name : 'Selected Floor';
    alert(`Successfully marked all residents of ${floorName} present!`);
  }

  saveCurfewSettings() {
    const config = { curfewHour: this.curfewHour, penaltyFee: this.penaltyFee };
    localStorage.setItem('lsp_curfew_config', JSON.stringify(config));
    alert('Curfew operational boundaries modified successfully!');
  }
}
