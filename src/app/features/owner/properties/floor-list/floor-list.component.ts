import { Component, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

interface Floor { id: string; buildingId: string; buildingName: string; floorNumber: string; name: string; totalRooms: number; totalBeds: number; occupiedBeds: number; vacantBeds: number; maintenanceBeds: number; }

@Component({
  selector: 'app-floor-list',
  standalone: true,
  imports: [FormsModule, PageHeader, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Floors" subtitle="Floor-wise room and bed management">
        <button pButton label="Add Floor" icon="pi pi-plus" class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white"></button>
      </app-page-header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <div class="glass-card p-5"><p class="text-xs font-semibold text-slate-400 uppercase">Total Floors</p><p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ floors().length }}</p></div>
        <div class="glass-card p-5"><p class="text-xs font-semibold text-slate-400 uppercase">Total Rooms</p><p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ totalRooms() }}</p></div>
        <div class="glass-card p-5"><p class="text-xs font-semibold text-slate-400 uppercase">Total Beds</p><p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ totalBeds() }}</p></div>
        <div class="glass-card p-5"><p class="text-xs font-semibold text-slate-400 uppercase">Occupancy</p><p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{{ avgOccupancy() }}%</p></div>
      </div>

      <!-- Visual Floor Hierarchy -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-sitemap text-indigo-500 mr-2"></i>Floor Hierarchy</h3>
        @for (building of buildingGroups(); track building.name) {
          <div class="space-y-3">
            <div class="flex items-center gap-3 px-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><i class="pi pi-building text-indigo-600 dark:text-indigo-400 text-sm"></i></div>
              <h4 class="font-semibold text-slate-700 dark:text-slate-300">{{ building.name }}</h4>
            </div>
            <div class="ml-6 border-l-2 border-indigo-100 dark:border-indigo-900/30 pl-4 space-y-2">
              @for (floor of building.floors; track floor.id) {
                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer flex items-center justify-between group"
                     (click)="navigateToRooms(floor.id)">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      [class]="floor.occupiedBeds === floor.totalBeds ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">
                      F{{ floor.floorNumber }}
                    </div>
                    <div>
                      <p class="font-semibold text-sm text-slate-800 dark:text-white">{{ floor.name }}</p>
                      <p class="text-xs text-slate-400">{{ floor.totalRooms }} Rooms · {{ floor.totalBeds }} Beds</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-6">
                    <div class="flex items-center gap-3">
                      <span class="inline-flex items-center gap-1 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span>{{ floor.occupiedBeds }}</span>
                      <span class="inline-flex items-center gap-1 text-xs"><span class="w-2 h-2 rounded-full bg-red-500"></span>{{ floor.vacantBeds }}</span>
                      <span class="inline-flex items-center gap-1 text-xs"><span class="w-2 h-2 rounded-full bg-slate-400"></span>{{ floor.maintenanceBeds }}</span>
                    </div>
                    <div class="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" [style.width.%]="getOccupancy(floor)"></div>
                    </div>
                    <i class="pi pi-chevron-right text-slate-300 group-hover:text-indigo-500 transition-colors"></i>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class FloorListComponent {
  private router = inject(Router);

  floors = signal<Floor[]>([
    { id: 'f-001', buildingId: 'bld-001', buildingName: 'Building A', floorNumber: 'G', name: 'Ground Floor', totalRooms: 3, totalBeds: 9, occupiedBeds: 9, vacantBeds: 0, maintenanceBeds: 0 },
    { id: 'f-002', buildingId: 'bld-001', buildingName: 'Building A', floorNumber: '1', name: 'First Floor', totalRooms: 3, totalBeds: 9, occupiedBeds: 8, vacantBeds: 1, maintenanceBeds: 0 },
    { id: 'f-003', buildingId: 'bld-001', buildingName: 'Building A', floorNumber: '2', name: 'Second Floor', totalRooms: 3, totalBeds: 9, occupiedBeds: 7, vacantBeds: 1, maintenanceBeds: 1 },
    { id: 'f-004', buildingId: 'bld-002', buildingName: 'Building B', floorNumber: 'G', name: 'Ground Floor', totalRooms: 3, totalBeds: 9, occupiedBeds: 8, vacantBeds: 1, maintenanceBeds: 0 },
    { id: 'f-005', buildingId: 'bld-002', buildingName: 'Building B', floorNumber: '1', name: 'First Floor', totalRooms: 3, totalBeds: 9, occupiedBeds: 8, vacantBeds: 0, maintenanceBeds: 1 },
  ]);

  totalRooms = computed(() => this.floors().reduce((s, f) => s + f.totalRooms, 0));
  totalBeds = computed(() => this.floors().reduce((s, f) => s + f.totalBeds, 0));
  avgOccupancy = computed(() => { const t = this.totalBeds(); const o = this.floors().reduce((s, f) => s + f.occupiedBeds, 0); return t ? Math.round((o / t) * 100) : 0; });

  buildingGroups = computed(() => {
    const map = new Map<string, { name: string; floors: Floor[] }>();
    for (const f of this.floors()) {
      if (!map.has(f.buildingName)) map.set(f.buildingName, { name: f.buildingName, floors: [] });
      map.get(f.buildingName)!.floors.push(f);
    }
    return Array.from(map.values());
  });

  getOccupancy(f: Floor): number { return f.totalBeds ? Math.round((f.occupiedBeds / f.totalBeds) * 100) : 0; }
  navigateToRooms(floorId: string) { this.router.navigate(['/owner/properties/prop-001/rooms'], { queryParams: { floor: floorId } }); }
}
