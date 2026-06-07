import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface BedRecord { id: string; label: string; roomNumber: string; floor: string; building: string; status: string; tenantName?: string; tenantPhone?: string; monthlyRent: number; lastUpdated: string; }

@Component({
  selector: 'app-occupancy-explorer',
  standalone: true,
  imports: [FormsModule, PageHeader, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Occupancy Explorer" subtitle="Filter and search beds across all properties by status"></app-page-header>

      <!-- Status Filter Chips -->
      <div class="glass-card p-5">
        <div class="flex flex-wrap gap-3 mb-4">
          @for (s of statuses; track s.key) {
            <button (click)="toggleFilter(s.key)"
              class="px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 flex items-center gap-2"
              [class]="activeFilters().includes(s.key) ? s.activeClass : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400 hover:border-slate-300'">
              <span class="w-3 h-3 rounded-full" [class]="s.dotClass"></span>
              {{ s.label }} ({{ countByStatus(s.key) }})
            </button>
          }
        </div>
        <div class="relative w-full sm:w-96">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input type="text" pInputText placeholder="Search by bed, room, tenant..."
            class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm"
            [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
        </div>
      </div>

      <!-- Results Count -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500">Showing <span class="font-bold text-slate-800 dark:text-white">{{ filteredBeds().length }}</span> of {{ allBeds().length }} beds</p>
      </div>

      <!-- Bed Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        @for (bed of filteredBeds(); track bed.id) {
          <div class="p-3 rounded-xl border-2 text-center cursor-pointer hover:shadow-md transition-all"
            [class]="bed.status === 'Occupied' ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10' : bed.status === 'Vacant' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' : bed.status === 'Reserved' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10' : bed.status === 'Notice' ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10' : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/30'">
            <div class="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2"
              [class]="bed.status === 'Occupied' ? 'bg-emerald-200 text-emerald-700' : bed.status === 'Vacant' ? 'bg-red-200 text-red-700' : bed.status === 'Reserved' ? 'bg-blue-200 text-blue-700' : bed.status === 'Notice' ? 'bg-amber-200 text-amber-700' : 'bg-slate-200 text-slate-600'">
              <i [class]="bed.status === 'Occupied' ? 'pi pi-user' : bed.status === 'Vacant' ? 'pi pi-minus' : bed.status === 'Reserved' ? 'pi pi-bookmark' : bed.status === 'Notice' ? 'pi pi-exclamation-triangle' : 'pi pi-wrench'" class="text-sm"></i>
            </div>
            <p class="font-bold text-xs text-slate-800 dark:text-white">{{ bed.label }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">{{ bed.roomNumber }}</p>
            @if (bed.tenantName) { <p class="text-[10px] text-slate-500 mt-1 truncate">{{ bed.tenantName }}</p> }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class OccupancyExplorerComponent {
  searchQuery = signal('');
  activeFilters = signal<string[]>([]);

  statuses = [
    { key: 'Occupied', label: 'Occupied', dotClass: 'bg-emerald-500', activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { key: 'Vacant', label: 'Vacant', dotClass: 'bg-red-500', activeClass: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
    { key: 'Reserved', label: 'Reserved', dotClass: 'bg-blue-500', activeClass: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
    { key: 'Notice', label: 'Notice', dotClass: 'bg-amber-500', activeClass: 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' },
    { key: 'Maintenance', label: 'Maintenance', dotClass: 'bg-slate-400', activeClass: 'border-slate-500 bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300' },
  ];

  allBeds = signal<BedRecord[]>([
    { id: 'b1', label: 'G01-A', roomNumber: 'G01', floor: 'GF', building: 'A', status: 'Occupied', tenantName: 'Rahul S.', tenantPhone: '9876543210', monthlyRent: 8000, lastUpdated: '2026-05-01' },
    { id: 'b2', label: 'G01-B', roomNumber: 'G01', floor: 'GF', building: 'A', status: 'Occupied', tenantName: 'Amit K.', monthlyRent: 8000, lastUpdated: '2026-05-01' },
    { id: 'b3', label: 'G01-C', roomNumber: 'G01', floor: 'GF', building: 'A', status: 'Vacant', monthlyRent: 8000, lastUpdated: '2026-05-20' },
    { id: 'b4', label: 'G02-A', roomNumber: 'G02', floor: 'GF', building: 'A', status: 'Occupied', tenantName: 'Priya M.', monthlyRent: 10000, lastUpdated: '2026-04-15' },
    { id: 'b5', label: 'G02-B', roomNumber: 'G02', floor: 'GF', building: 'A', status: 'Notice', tenantName: 'Ravi T.', monthlyRent: 10000, lastUpdated: '2026-05-25' },
    { id: 'b6', label: '101-A', roomNumber: '101', floor: '1F', building: 'A', status: 'Occupied', tenantName: 'Sneha J.', monthlyRent: 15000, lastUpdated: '2026-03-01' },
    { id: 'b7', label: '102-A', roomNumber: '102', floor: '1F', building: 'A', status: 'Reserved', monthlyRent: 9500, lastUpdated: '2026-05-28' },
    { id: 'b8', label: '102-B', roomNumber: '102', floor: '1F', building: 'A', status: 'Occupied', tenantName: 'Vikram S.', monthlyRent: 9500, lastUpdated: '2026-01-10' },
    { id: 'b9', label: '201-A', roomNumber: '201', floor: '2F', building: 'A', status: 'Maintenance', monthlyRent: 9000, lastUpdated: '2026-05-15' },
    { id: 'b10', label: '201-B', roomNumber: '201', floor: '2F', building: 'A', status: 'Occupied', tenantName: 'Neha P.', monthlyRent: 9000, lastUpdated: '2026-02-20' },
    { id: 'b11', label: '202-A', roomNumber: '202', floor: '2F', building: 'A', status: 'Vacant', monthlyRent: 7000, lastUpdated: '2026-05-10' },
    { id: 'b12', label: '202-B', roomNumber: '202', floor: '2F', building: 'A', status: 'Occupied', tenantName: 'Karan M.', monthlyRent: 7000, lastUpdated: '2025-11-01' },
  ]);

  filteredBeds = computed(() => {
    let list = this.allBeds();
    const q = this.searchQuery().toLowerCase();
    const filters = this.activeFilters();
    if (filters.length > 0) list = list.filter(b => filters.includes(b.status));
    if (q) list = list.filter(b => b.label.toLowerCase().includes(q) || (b.tenantName || '').toLowerCase().includes(q) || b.roomNumber.toLowerCase().includes(q));
    return list;
  });

  countByStatus(status: string): number { return this.allBeds().filter(b => b.status === status).length; }

  toggleFilter(status: string) {
    this.activeFilters.update(f => f.includes(status) ? f.filter(s => s !== status) : [...f, status]);
  }
}
