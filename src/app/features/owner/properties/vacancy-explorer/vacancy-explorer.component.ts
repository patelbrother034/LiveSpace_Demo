import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

interface VacantBed { id: string; label: string; roomNumber: string; roomType: string; floor: string; building: string; property: string; monthlyRent: number; amenities: string[]; vacantSince: string; daysVacant: number; }

@Component({
  selector: 'app-vacancy-explorer',
  standalone: true,
  imports: [FormsModule, PageHeader, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Vacancy Explorer" subtitle="Find and manage vacant beds across your portfolio"></app-page-header>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <div class="glass-card p-5 border-l-4 border-red-500">
          <p class="text-xs font-semibold text-slate-400 uppercase">Total Vacant</p>
          <p class="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">{{ vacantBeds().length }}</p>
          <p class="text-xs text-slate-400 mt-1">beds available</p>
        </div>
        <div class="glass-card p-5 border-l-4 border-amber-500">
          <p class="text-xs font-semibold text-slate-400 uppercase">Avg Days Vacant</p>
          <p class="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{{ avgDaysVacant() }}</p>
          <p class="text-xs text-slate-400 mt-1">days average</p>
        </div>
        <div class="glass-card p-5 border-l-4 border-purple-500">
          <p class="text-xs font-semibold text-slate-400 uppercase">Revenue Loss</p>
          <p class="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">₹{{ totalRevenueLoss().toLocaleString() }}</p>
          <p class="text-xs text-slate-400 mt-1">per month</p>
        </div>
        <div class="glass-card p-5 border-l-4 border-indigo-500">
          <p class="text-xs font-semibold text-slate-400 uppercase">Vacancy Rate</p>
          <p class="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{{ vacancyRate() }}%</p>
          <p class="text-xs text-slate-400 mt-1">across portfolio</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="relative w-full sm:w-80">
          <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input type="text" pInputText placeholder="Search vacant beds..."
            class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm"
            [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
        </div>
        <div class="flex gap-2">
          <button pButton [label]="'All (' + vacantBeds().length + ')'" class="p-button-sm rounded-lg" [class]="!sortBy() ? 'bg-indigo-500 border-indigo-500 text-white' : 'p-button-outlined'" (click)="sortBy.set('')"></button>
          <button pButton label="Longest Vacant" icon="pi pi-sort-amount-down" class="p-button-sm rounded-lg" [class]="sortBy() === 'days' ? 'bg-indigo-500 border-indigo-500 text-white' : 'p-button-outlined'" (click)="sortBy.set('days')"></button>
          <button pButton label="Cheapest First" icon="pi pi-sort-amount-up" class="p-button-sm rounded-lg" [class]="sortBy() === 'rent' ? 'bg-indigo-500 border-indigo-500 text-white' : 'p-button-outlined'" (click)="sortBy.set('rent')"></button>
        </div>
      </div>

      <!-- Vacant Beds List -->
      <div class="space-y-4">
        @for (bed of filteredBeds(); track bed.id) {
          <div class="glass-card p-5 hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold shrink-0">
                {{ bed.label }}
              </div>
              <div>
                <p class="font-bold text-slate-800 dark:text-white">Bed {{ bed.label }} · Room {{ bed.roomNumber }}</p>
                <p class="text-xs text-slate-400">{{ bed.floor }} · {{ bed.building }} · {{ bed.property }}</p>
                <div class="flex flex-wrap gap-1.5 mt-2">
                  @for (a of bed.amenities; track a) {
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{{ a }}</span>
                  }
                </div>
              </div>
            </div>
            <div class="flex items-center gap-6 shrink-0">
              <div class="text-center">
                <p class="text-lg font-bold text-slate-800 dark:text-white">₹{{ bed.monthlyRent.toLocaleString() }}</p>
                <p class="text-[10px] text-slate-400">per month</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-bold" [class]="bed.daysVacant > 30 ? 'text-red-600' : bed.daysVacant > 14 ? 'text-amber-600' : 'text-blue-600'">{{ bed.daysVacant }}</p>
                <p class="text-[10px] text-slate-400">days vacant</p>
              </div>
              <button pButton label="Assign" icon="pi pi-user-plus" class="p-button-sm rounded-lg bg-emerald-600 border-emerald-600 text-white" (click)="assignTenant(bed.id)"></button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class VacancyExplorerComponent {
  private router = inject(Router);
  searchQuery = signal('');
  sortBy = signal('');

  vacantBeds = signal<VacantBed[]>([
    { id: 'v1', label: 'G01-C', roomNumber: 'G01', roomType: 'Triple', floor: 'Ground Floor', building: 'Building A', property: 'Royal Heights PG', monthlyRent: 8000, amenities: ['AC', 'WiFi', 'Attached Bath'], vacantSince: '2026-05-20', daysVacant: 10 },
    { id: 'v2', label: '103-C', roomNumber: '103', roomType: 'Triple', floor: '1st Floor', building: 'Building A', property: 'Royal Heights PG', monthlyRent: 7500, amenities: ['WiFi'], vacantSince: '2026-05-01', daysVacant: 29 },
    { id: 'v3', label: '202-A', roomNumber: '202', roomType: 'Double', floor: '2nd Floor', building: 'Building A', property: 'Royal Heights PG', monthlyRent: 7000, amenities: ['WiFi'], vacantSince: '2026-05-10', daysVacant: 20 },
    { id: 'v4', label: 'A201-B', roomNumber: '201', roomType: 'Double', floor: '2nd Floor', building: 'Block A', property: 'Apex Elite PG', monthlyRent: 9000, amenities: ['AC', 'WiFi', 'Gym Access'], vacantSince: '2026-04-15', daysVacant: 45 },
    { id: 'v5', label: 'B102-A', roomNumber: '102', roomType: 'Single', floor: '1st Floor', building: 'Block B', property: 'Apex Elite PG', monthlyRent: 12000, amenities: ['AC', 'WiFi', 'Attached Bath', 'Balcony'], vacantSince: '2026-05-25', daysVacant: 5 },
  ]);

  filteredBeds = computed(() => {
    let list = this.vacantBeds();
    const q = this.searchQuery().toLowerCase();
    if (q) list = list.filter(b => b.label.toLowerCase().includes(q) || b.roomNumber.toLowerCase().includes(q) || b.property.toLowerCase().includes(q));
    if (this.sortBy() === 'days') list = [...list].sort((a, b) => b.daysVacant - a.daysVacant);
    if (this.sortBy() === 'rent') list = [...list].sort((a, b) => a.monthlyRent - b.monthlyRent);
    return list;
  });

  avgDaysVacant = computed(() => { const beds = this.vacantBeds(); return beds.length ? Math.round(beds.reduce((s, b) => s + b.daysVacant, 0) / beds.length) : 0; });
  totalRevenueLoss = computed(() => this.vacantBeds().reduce((s, b) => s + b.monthlyRent, 0));
  vacancyRate = computed(() => Math.round((this.vacantBeds().length / 45) * 100)); // 45 = total beds approx

  assignTenant(bedId: string) { this.router.navigate(['/owner/tenants/check-in'], { queryParams: { bed: bedId } }); }
}
