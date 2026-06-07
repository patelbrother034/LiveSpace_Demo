import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

interface Bed { id: string; label: string; roomNumber: string; floorName: string; buildingName: string; status: string; tenantName?: string; monthlyRent: number; checkInDate?: string; }

@Component({
  selector: 'app-bed-list',
  standalone: true,
  imports: [FormsModule, PageHeader, StatusBadge, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="All Beds" subtitle="Complete bed inventory across all properties"></app-page-header>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-2xl font-extrabold text-slate-800 dark:text-white">{{ beds().length }}</p><p class="text-[10px] text-slate-400 uppercase font-semibold mt-1">Total Beds</p></div>
        <div class="glass-card p-4 text-center"><p class="text-2xl font-extrabold text-emerald-600">{{ countByStatus('Occupied') }}</p><p class="text-[10px] text-emerald-500/80 uppercase font-semibold mt-1">Occupied</p></div>
        <div class="glass-card p-4 text-center"><p class="text-2xl font-extrabold text-red-600">{{ countByStatus('Vacant') }}</p><p class="text-[10px] text-red-500/80 uppercase font-semibold mt-1">Vacant</p></div>
        <div class="glass-card p-4 text-center"><p class="text-2xl font-extrabold text-blue-600">{{ countByStatus('Reserved') }}</p><p class="text-[10px] text-blue-500/80 uppercase font-semibold mt-1">Reserved</p></div>
        <div class="glass-card p-4 text-center"><p class="text-2xl font-extrabold text-amber-600">{{ countByStatus('Notice') }}</p><p class="text-[10px] text-amber-500/80 uppercase font-semibold mt-1">Notice</p></div>
        <div class="glass-card p-4 text-center"><p class="text-2xl font-extrabold text-slate-500">{{ countByStatus('Maintenance') }}</p><p class="text-[10px] text-slate-400 uppercase font-semibold mt-1">Maintenance</p></div>
      </div>

      <div class="glass-card p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="relative w-full sm:w-80">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="text" pInputText placeholder="Search beds, tenants..." class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
          </div>
          <div class="flex gap-2">
            @for (status of statusFilters; track status) {
              <button pButton [label]="status" class="p-button-sm rounded-lg" [class]="activeFilter() === status ? 'bg-indigo-500 border-indigo-500 text-white' : 'p-button-outlined border-slate-300 text-slate-500'" (click)="activeFilter.set(activeFilter() === status ? '' : status)"></button>
            }
          </div>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                <th class="py-3.5 px-5">Bed</th><th class="py-3.5 px-4">Room</th><th class="py-3.5 px-4">Floor</th><th class="py-3.5 px-4">Building</th>
                <th class="py-3.5 px-4">Tenant</th><th class="py-3.5 px-4 text-right">Rent</th><th class="py-3.5 px-4 text-center">Status</th><th class="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
              @for (bed of filteredBeds(); track bed.id) {
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" (click)="navigateToDetail(bed.id)">
                  <td class="py-3.5 px-5 font-semibold text-sm text-slate-800 dark:text-white">{{ bed.label }}</td>
                  <td class="py-3.5 px-4 text-sm text-slate-500">{{ bed.roomNumber }}</td>
                  <td class="py-3.5 px-4 text-sm text-slate-500">{{ bed.floorName }}</td>
                  <td class="py-3.5 px-4 text-sm text-slate-500">{{ bed.buildingName }}</td>
                  <td class="py-3.5 px-4 text-sm">{{ bed.tenantName || '—' }}</td>
                  <td class="py-3.5 px-4 text-sm text-right font-semibold">₹{{ bed.monthlyRent.toLocaleString() }}</td>
                  <td class="py-3.5 px-4 text-center"><app-status-badge [status]="bed.status" /></td>
                  <td class="py-3.5 px-4 text-center">
                    <button pButton icon="pi pi-eye" class="p-button-sm p-button-text p-button-rounded text-slate-500" (click)="$event.stopPropagation(); navigateToDetail(bed.id)"></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class BedListComponent {
  private router = inject(Router);
  searchQuery = signal('');
  activeFilter = signal('');
  statusFilters = ['Occupied', 'Vacant', 'Reserved', 'Notice', 'Maintenance'];

  beds = signal<Bed[]>([
    { id: 'bed-001', label: 'G01-A', roomNumber: 'G01', floorName: 'Ground', buildingName: 'Bldg A', status: 'Occupied', tenantName: 'Rahul Sharma', monthlyRent: 8000, checkInDate: '2026-01-15' },
    { id: 'bed-002', label: 'G01-B', roomNumber: 'G01', floorName: 'Ground', buildingName: 'Bldg A', status: 'Occupied', tenantName: 'Amit Kumar', monthlyRent: 8000, checkInDate: '2026-02-01' },
    { id: 'bed-003', label: 'G01-C', roomNumber: 'G01', floorName: 'Ground', buildingName: 'Bldg A', status: 'Vacant', monthlyRent: 8000 },
    { id: 'bed-004', label: 'G02-A', roomNumber: 'G02', floorName: 'Ground', buildingName: 'Bldg A', status: 'Occupied', tenantName: 'Priya Mehra', monthlyRent: 10000, checkInDate: '2025-11-01' },
    { id: 'bed-005', label: 'G02-B', roomNumber: 'G02', floorName: 'Ground', buildingName: 'Bldg A', status: 'Notice', tenantName: 'Ravi Tiwari', monthlyRent: 10000, checkInDate: '2025-09-15' },
    { id: 'bed-006', label: '101-A', roomNumber: '101', floorName: '1st Floor', buildingName: 'Bldg A', status: 'Occupied', tenantName: 'Sneha Joshi', monthlyRent: 15000, checkInDate: '2026-03-01' },
    { id: 'bed-007', label: '102-A', roomNumber: '102', floorName: '1st Floor', buildingName: 'Bldg A', status: 'Occupied', tenantName: 'Vikram Singh', monthlyRent: 9500, checkInDate: '2025-12-01' },
    { id: 'bed-008', label: '102-B', roomNumber: '102', floorName: '1st Floor', buildingName: 'Bldg A', status: 'Reserved', monthlyRent: 9500 },
    { id: 'bed-009', label: '201-A', roomNumber: '201', floorName: '2nd Floor', buildingName: 'Bldg A', status: 'Maintenance', monthlyRent: 9000 },
  ]);

  filteredBeds = computed(() => {
    let list = this.beds();
    const q = this.searchQuery().toLowerCase();
    const f = this.activeFilter();
    if (q) list = list.filter(b => b.label.toLowerCase().includes(q) || (b.tenantName || '').toLowerCase().includes(q) || b.roomNumber.toLowerCase().includes(q));
    if (f) list = list.filter(b => b.status === f);
    return list;
  });

  countByStatus(status: string): number { return this.beds().filter(b => b.status === status).length; }
  navigateToDetail(id: string) { this.router.navigate(['/owner/properties/prop-001/beds', id]); }
}
