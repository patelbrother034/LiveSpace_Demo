import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';

interface Resident {
  id: string;
  fullName: string;
  roomId: string;
  bedId: string;
  phone: string;
  status: string;
  propertyId: string;
  inBuilding?: boolean; // In Building vs Out
}

interface Room {
  id: string;
  roomNumber: string;
  propertyId: string;
  status: string;
}

@Component({
  selector: 'app-warden-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Resident Status Board" subtitle="Track real-time resident in/out movements and manage room placements" />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Resident Tracker Board -->
        <div class="xl:col-span-2 space-y-4">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">In/Out Tracking Board</h4>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Quick Search:</span>
              <input type="text" [(ngModel)]="searchQuery" placeholder="Search by name..."
                class="p-1 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500 w-44">
            </div>
          </div>

          <div class="glass-card p-5 space-y-3.5 max-h-[500px] overflow-y-auto">
            @for (res of filteredResidents(); track res.id) {
              <div class="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                <div class="space-y-0.5">
                  <h5 class="text-xs font-bold text-slate-800 dark:text-white">{{ res.fullName }}</h5>
                  <p class="text-[9px] text-slate-400">
                    Room {{ res.roomId.replace('room-', '').toUpperCase() }} · Bed {{ res.bedId.replace('bed-', '').toUpperCase() }}
                  </p>
                </div>

                <div class="flex items-center gap-3">
                  <!-- Status Indicator -->
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    [class]="res.inBuilding ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'">
                    {{ res.inBuilding ? 'In Building' : 'Out of PG' }}
                  </span>
                  
                  <!-- Manual Toggle -->
                  <button pButton [label]="res.inBuilding ? 'Mark Out' : 'Mark In'"
                    [class]="res.inBuilding ? 'p-button-outlined p-button-secondary' : 'bg-indigo-500 border-none text-white'"
                    class="p-button-xs rounded-lg px-2.5 py-1 text-[10px]"
                    (click)="toggleInBuilding(res.id)">
                  </button>
                </div>
              </div>
            } @empty {
              <p class="text-xs text-slate-400 italic text-center py-6">No residents found.</p>
            }
          </div>
        </div>

        <!-- Room Allocation Analytics -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Building Map Stats</h4>
          
          <div class="glass-card p-5 space-y-5">
            <div class="space-y-2">
              <span class="text-xs font-semibold text-slate-500">Live Building Population</span>
              <div class="flex justify-between items-center text-xs">
                <span>Total Checked-In Residents:</span>
                <span class="font-extrabold text-slate-800 dark:text-white">{{ residents().length }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span>Currently Inside:</span>
                <span class="font-extrabold text-emerald-500">{{ insCount() }}</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span>Currently Outside:</span>
                <span class="font-extrabold text-amber-500">{{ outsCount() }}</span>
              </div>
            </div>

            <div class="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3">
              <h5 class="text-xs font-bold text-slate-800 dark:text-white">Floor occupancy ratings</h5>
              <div class="space-y-2 text-xs">
                <div>
                  <div class="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>1st Floor (Floor 1)</span>
                    <span>100% full</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-indigo-500 h-full" style="width: 100%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>2nd Floor (Floor 2)</span>
                    <span>80% full</span>
                  </div>
                  <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-indigo-500 h-full" style="width: 80%"></div>
                  </div>
                </div>
              </div>
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
export class WardenRooms implements OnInit {
  private crudService = inject(CrudService);

  residents = signal<Resident[]>([]);
  rooms = signal<Room[]>([]);

  searchQuery = '';

  insCount = computed(() => this.residents().filter(r => r.inBuilding).length);
  outsCount = computed(() => this.residents().filter(r => !r.inBuilding).length);

  filteredResidents = computed(() => {
    const list = this.residents();
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) return list;
    return list.filter(r => r.fullName.toLowerCase().includes(query));
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const listTenants = this.crudService.getAll<Resident>(StorageKeys.TENANTS);
    const active = listTenants.filter(t => t.propertyId === 'prop-001' && t.status === 'Active');
    
    // Seed default in/out state
    active.forEach(t => {
      if (t.inBuilding === undefined) {
        t.inBuilding = Math.random() > 0.3; // Default 70% inside
      }
    });

    this.residents.set(active);

    const listRooms = this.crudService.getAll<Room>(StorageKeys.ROOMS);
    this.rooms.set(listRooms.filter(r => r.propertyId === 'prop-001'));
  }

  toggleInBuilding(residentId: string) {
    const list = this.residents();
    const idx = list.findIndex(r => r.id === residentId);
    if (idx !== -1) {
      list[idx].inBuilding = !list[idx].inBuilding;
      this.residents.set([...list]);
      
      // Update tenant in local storage
      const allTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
      const dbIdx = allTenants.findIndex(t => t.id === residentId);
      if (dbIdx !== -1) {
        allTenants[dbIdx].inBuilding = list[idx].inBuilding;
        localStorage.setItem(StorageKeys.TENANTS, JSON.stringify(allTenants));
      }
    }
  }
}
