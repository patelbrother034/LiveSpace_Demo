import { Component, signal, computed, inject, input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

interface Building {
  id: string;
  propertyId: string;
  name: string;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  status: string;
  description: string;
  yearBuilt: string;
  gradient: string;
}

@Component({
  selector: 'app-building-list',
  standalone: true,
  imports: [FormsModule, PageHeader, StatusBadge, ButtonModule, InputTextModule, DialogModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Buildings" subtitle="Manage buildings within your property">
        <button pButton label="Add Building" icon="pi pi-plus"
          (click)="showAddDialog.set(true)"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- KPI Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Buildings</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ buildings().length }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Floors</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ totalFloors() }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Rooms</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ totalRooms() }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Occupancy</p>
          <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{{ avgOccupancy() }}%</p>
        </div>
      </div>

      <!-- Search -->
      <div class="glass-card p-4">
        <div class="relative w-full sm:w-80">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input type="text" pInputText placeholder="Search buildings..."
            class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm"
            [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
        </div>
      </div>

      <!-- Building Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 stagger-children">
        @for (building of filteredBuildings(); track building.id) {
          <div class="glass-card overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
               (click)="navigateToDetail(building.id)">
            <div class="h-28 relative" [class]="building.gradient">
              <div class="absolute inset-0 bg-black/10"></div>
              <div class="absolute top-3 right-3">
                <app-status-badge [status]="building.status" />
              </div>
              <div class="absolute bottom-4 left-4">
                <h3 class="text-lg font-bold text-white drop-shadow-md">{{ building.name }}</h3>
                <p class="text-xs text-white/80 mt-0.5">{{ building.description }}</p>
              </div>
            </div>
            <div class="p-5 space-y-4">
              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ building.totalFloors }}</p>
                  <p class="text-[10px] text-blue-500/80 uppercase font-medium">Floors</p>
                </div>
                <div class="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                  <p class="text-lg font-bold text-indigo-600 dark:text-indigo-400">{{ building.totalRooms }}</p>
                  <p class="text-[10px] text-indigo-500/80 uppercase font-medium">Rooms</p>
                </div>
                <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ getOccupancy(building) }}%</p>
                  <p class="text-[10px] text-emerald-500/80 uppercase font-medium">Occupied</p>
                </div>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                  [style.width.%]="getOccupancy(building)"></div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Add Building Dialog -->
      <p-dialog header="Add Building" [(visible)]="showAddDialog" [modal]="true" [style]="{width: '500px'}" [dismissableMask]="true">
        <div class="space-y-4 pt-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Building Name</label>
            <input pInputText class="w-full rounded-lg" placeholder="e.g., Building A" [(ngModel)]="newBuilding.name" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Floors</label>
              <input pInputText type="number" class="w-full rounded-lg" [(ngModel)]="newBuilding.totalFloors" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year Built</label>
              <input pInputText class="w-full rounded-lg" placeholder="2020" [(ngModel)]="newBuilding.yearBuilt" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input pInputText class="w-full rounded-lg" placeholder="Short description" [(ngModel)]="newBuilding.description" />
          </div>
        </div>
        <ng-template #footer>
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-text p-button-sm" (click)="showAddDialog.set(false)"></button>
          <button pButton label="Create Building" icon="pi pi-check" class="p-button-sm rounded-lg bg-indigo-600 border-indigo-600" (click)="addBuilding()"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class BuildingListComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchQuery = signal('');
  showAddDialog = signal(false);
  newBuilding = { name: '', totalFloors: 3, yearBuilt: '2023', description: '' };

  buildings = signal<Building[]>([
    { id: 'bld-001', propertyId: 'prop-001', name: 'Building A – Main Block', totalFloors: 3, totalRooms: 9, totalBeds: 27, occupiedBeds: 25, status: 'Active', description: 'Primary residential block', yearBuilt: '2019', gradient: 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500' },
    { id: 'bld-002', propertyId: 'prop-001', name: 'Building B – Annex', totalFloors: 2, totalRooms: 6, totalBeds: 18, occupiedBeds: 16, status: 'Active', description: 'Secondary wing with premium rooms', yearBuilt: '2021', gradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500' },
    { id: 'bld-003', propertyId: 'prop-002', name: 'Tower C – Executive', totalFloors: 4, totalRooms: 12, totalBeds: 36, occupiedBeds: 30, status: 'Active', description: 'Executive tower with coworking', yearBuilt: '2022', gradient: 'bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600' },
  ]);

  filteredBuildings = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.buildings();
    return this.buildings().filter(b => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  });

  totalFloors = computed(() => this.buildings().reduce((s, b) => s + b.totalFloors, 0));
  totalRooms = computed(() => this.buildings().reduce((s, b) => s + b.totalRooms, 0));
  avgOccupancy = computed(() => {
    const total = this.buildings().reduce((s, b) => s + b.totalBeds, 0);
    const occ = this.buildings().reduce((s, b) => s + b.occupiedBeds, 0);
    return total ? Math.round((occ / total) * 100) : 0;
  });

  getOccupancy(b: Building): number { return b.totalBeds ? Math.round((b.occupiedBeds / b.totalBeds) * 100) : 0; }

  navigateToDetail(id: string) { this.router.navigate([id], { relativeTo: this.route }); }

  addBuilding() {
    const id = 'bld-' + Date.now();
    this.buildings.update(list => [...list, {
      id, propertyId: 'prop-001', name: this.newBuilding.name, totalFloors: this.newBuilding.totalFloors,
      totalRooms: 0, totalBeds: 0, occupiedBeds: 0, status: 'Active', description: this.newBuilding.description,
      yearBuilt: this.newBuilding.yearBuilt, gradient: 'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600'
    }]);
    this.showAddDialog.set(false);
    this.newBuilding = { name: '', totalFloors: 3, yearBuilt: '2023', description: '' };
  }
}
