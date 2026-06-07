import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-building-detail',
  standalone: true,
  imports: [PageHeader, StatusBadge, ButtonModule, TabsModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header [title]="building().name" subtitle="Building Details & Floor Management">
        <button pButton label="Edit Building" icon="pi pi-pencil" class="p-button-sm p-button-outlined rounded-xl border-indigo-300 text-indigo-600"></button>
      </app-page-header>

      <!-- Building Header Card -->
      <div class="glass-card overflow-hidden">
        <div class="h-40 relative" [class]="building().gradient">
          <div class="absolute inset-0 bg-black/20"></div>
          <div class="absolute bottom-5 left-6">
            <h2 class="text-2xl font-bold text-white drop-shadow-md">{{ building().name }}</h2>
            <p class="text-sm text-white/80 mt-1">{{ building().description }} · Built {{ building().yearBuilt }}</p>
          </div>
          <div class="absolute top-4 right-4">
            <app-status-badge [status]="building().status" />
          </div>
        </div>
        <div class="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div class="text-center">
            <p class="text-2xl font-extrabold text-slate-800 dark:text-white">{{ building().totalFloors }}</p>
            <p class="text-xs text-slate-400 uppercase font-semibold mt-1">Floors</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-extrabold text-slate-800 dark:text-white">{{ building().totalRooms }}</p>
            <p class="text-xs text-slate-400 uppercase font-semibold mt-1">Rooms</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-extrabold text-slate-800 dark:text-white">{{ building().totalBeds }}</p>
            <p class="text-xs text-slate-400 uppercase font-semibold mt-1">Beds</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{{ occupancy() }}%</p>
            <p class="text-xs text-slate-400 uppercase font-semibold mt-1">Occupancy</p>
          </div>
        </div>
      </div>

      <!-- Floors List -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <i class="pi pi-bars text-indigo-500"></i> Floors in {{ building().name }}
        </h3>
        <div class="space-y-3">
          @for (floor of floors(); track floor.id) {
            <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {{ floor.floorNumber }}
                </div>
                <div>
                  <p class="font-semibold text-slate-800 dark:text-white">{{ floor.name }}</p>
                  <p class="text-xs text-slate-400">{{ floor.totalRooms }} Rooms · {{ floor.totalBeds }} Beds</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <p class="text-sm font-bold" [class]="floor.occupancy >= 80 ? 'text-emerald-600' : 'text-amber-600'">{{ floor.occupancy }}%</p>
                  <p class="text-[10px] text-slate-400">Occupied</p>
                </div>
                <i class="pi pi-chevron-right text-slate-300"></i>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class BuildingDetailComponent {
  private route = inject(ActivatedRoute);

  building = signal({
    id: 'bld-001', name: 'Building A – Main Block', description: 'Primary residential block', yearBuilt: '2019',
    totalFloors: 3, totalRooms: 9, totalBeds: 27, occupiedBeds: 25, status: 'Active',
    gradient: 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500'
  });

  floors = signal([
    { id: 'f-1', floorNumber: 'G', name: 'Ground Floor', totalRooms: 3, totalBeds: 9, occupancy: 100 },
    { id: 'f-2', floorNumber: '1', name: 'First Floor', totalRooms: 3, totalBeds: 9, occupancy: 89 },
    { id: 'f-3', floorNumber: '2', name: 'Second Floor', totalRooms: 3, totalBeds: 9, occupancy: 78 },
  ]);

  occupancy = signal(93);
}
