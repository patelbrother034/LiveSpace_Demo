import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../../../core/services/crud.service';
import { PropertyContextService } from '../../../../core/services/property-context.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { Property } from '../../../../core/models/property.model';
import { Building } from '../../../../core/models/building.model';
import { Floor } from '../../../../core/models/floor.model';
import { Room } from '../../../../core/models/room.model';
import { Bed } from '../../../../core/models/bed.model';
import { Tenant } from '../../../../core/models/tenant.model';
import { BedStatus } from '../../../../core/models/enums/bed-status.enum';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-visual-layout',
  imports: [CommonModule, FormsModule, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
            Visual Bed Layout
          </h1>
          <p class="text-slate-500 dark:text-slate-400">
            Interactive, color-coded floor plan and capacity manager
          </p>
        </div>
        
        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-3 p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> Occupied</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-blue-400"></span> Vacant</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-400"></span> Reserved</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-orange-400"></span> Notice</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-slate-400"></span> Maintenance</div>
          <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500"></span> Blocked</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Interactive Floor Plan -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Selection & Filter Bar -->
          <div class="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <label class="text-sm font-semibold text-slate-500 whitespace-nowrap">Property Context:</label>
              <select 
                class="w-full sm:w-56 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/20"
                [ngModel]="activePropertyId()"
                (ngModelChange)="onPropertyChange($event)"
              >
                @for (p of properties(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>

            <!-- Filter Statuses -->
            <div class="flex items-center gap-2">
              <button 
                pButton 
                label="All" 
                [class]="statusFilter() === null ? 'p-button-sm rounded-lg bg-indigo-500 border-indigo-500 text-white' : 'p-button-sm p-button-outlined rounded-lg border-slate-300 text-slate-500 dark:border-slate-600'"
                (click)="statusFilter.set(null)"
              ></button>
              @for (st of statuses; track st) {
                <button 
                  pButton 
                  [label]="st" 
                  [class]="statusFilter() === st ? 'p-button-sm rounded-lg bg-indigo-500 border-indigo-500 text-white' : 'p-button-sm p-button-outlined rounded-lg border-slate-300 text-slate-500 dark:border-slate-600'"
                  (click)="statusFilter.set(st)"
                ></button>
              }
            </div>
          </div>

          <!-- Dynamic Layout Grid -->
          <div class="space-y-8">
            @for (building of filteredLayout(); track building.id) {
              <div class="space-y-6">
                <div class="flex items-center gap-2">
                  <i class="pi pi-building text-slate-400"></i>
                  <h2 class="text-xl font-bold text-slate-800 dark:text-white">{{ building.name }}</h2>
                </div>

                @for (floor of building.floors; track floor.id) {
                  <div class="glass-card p-6 space-y-4">
                    <h3 class="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {{ floor.name }}
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      @for (room of floor.rooms; track room.id) {
                        <div class="p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 hover:shadow-md transition-all duration-200">
                          <div class="flex items-center justify-between mb-3">
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Room {{ room.roomNumber }}</span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                              {{ room.sharingType }}
                            </span>
                          </div>

                          <!-- Beds visual row -->
                          <div class="flex items-center gap-3">
                            @for (bed of room.beds; track bed.id) {
                              <div 
                                (click)="selectBed(bed)"
                                [pTooltip]="getTooltip(bed)"
                                tooltipPosition="top"
                                class="w-12 h-12 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 border group"
                                [class]="getBedCardClass(bed)"
                              >
                                <span class="w-3.5 h-3.5 rounded-full" [class]="getBedDotClass(bed.status)"></span>
                                <span class="text-[9px] font-bold text-slate-500 uppercase mt-1">{{ bed.bedNumber }}</span>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Sliding Details Panel -->
        <div class="lg:col-span-1">
          @if (selectedBed(); as bed) {
            <div class="glass-card p-6 space-y-6 sticky top-6 animate-slide-in">
              <div class="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <div>
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Bed Detail</h3>
                  <p class="text-xs text-slate-400">ID: {{ bed.id }}</p>
                </div>
                <button 
                  pButton 
                  icon="pi pi-times" 
                  class="p-button-text p-button-rounded text-slate-400" 
                  (click)="selectedBed.set(null)"
                ></button>
              </div>

              <!-- General details -->
              <div class="space-y-4 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-400">Bed Number</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">Bed {{ bed.bedNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Current Status</span>
                  <span class="font-bold uppercase text-xs px-2.5 py-0.5 rounded-full" [class]="getStatusLabelClass(bed.status)">
                    {{ bed.status }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Monthly Rent</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">₹{{ bed.monthlyRent | number }}</span>
                </div>
              </div>

              <!-- Associated Tenant info if occupied -->
              <div class="border-t border-slate-200/50 dark:border-slate-800/50 pt-5 space-y-4">
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">Resident details</h4>
                
                @if (selectedTenant(); as tenant) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {{ tenant.firstName.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-semibold text-slate-800 dark:text-white">{{ tenant.fullName }}</p>
                      <p class="text-xs text-slate-400">{{ tenant.phone }}</p>
                    </div>
                  </div>

                  <div class="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <p><strong>Aadhaar:</strong> {{ tenant.aadhaarNumber }}</p>
                    <p><strong>Lease Ends:</strong> {{ tenant.leaseEndDate }}</p>
                    <p><strong>Status:</strong> <span class="text-emerald-500">{{ tenant.status }}</span></p>
                  </div>
                } @else {
                  <p class="text-xs text-slate-400">No resident currently checked-in.</p>
                }
              </div>

              <!-- Status Action switches -->
              <div class="border-t border-slate-200/50 dark:border-slate-800/50 pt-5 space-y-3">
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">Actions</h4>
                
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    pButton 
                    label="Block Bed" 
                    icon="pi pi-ban"
                    severity="danger"
                    [disabled]="bed.status === 'Occupied'"
                    class="p-button-sm p-button-outlined w-full"
                    (click)="changeBedStatus(bed, 'Blocked')"
                  ></button>
                  <button 
                    pButton 
                    label="Maintenance" 
                    icon="pi pi-cog"
                    severity="secondary"
                    [disabled]="bed.status === 'Occupied'"
                    class="p-button-sm p-button-outlined w-full"
                    (click)="changeBedStatus(bed, 'Maintenance')"
                  ></button>
                  <button 
                    pButton 
                    label="Set Vacant" 
                    icon="pi pi-check"
                    severity="success"
                    [disabled]="bed.status === 'Occupied' || bed.status === 'Vacant'"
                    class="p-button-sm p-button-outlined w-full col-span-2"
                    (click)="changeBedStatus(bed, 'Vacant')"
                  ></button>
                </div>
              </div>
            </div>
          } @else {
            <div class="glass-card p-6 text-center space-y-4 text-slate-400 py-16 sticky top-6">
              <i class="pi pi-box text-3xl"></i>
              <p class="text-sm">Click on any bed to view occupant details, KYC cards, and capacity actions.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class VisualLayout {
  private crud = inject(CrudService);
  private propContext = inject(PropertyContextService);
  private toast = inject(ToastService);

  activePropertyId = signal<string>('prop-001');
  statusFilter = signal<string | null>(null);

  properties = signal<Property[]>([]);
  allBuildings = signal<Building[]>([]);
  allFloors = signal<Floor[]>([]);
  allRooms = signal<Room[]>([]);
  allBeds = signal<Bed[]>([]);
  allTenants = signal<Tenant[]>([]);

  selectedBed = signal<Bed | null>(null);

  statuses = ['Occupied', 'Vacant', 'Reserved', 'Maintenance', 'Blocked'];

  selectedTenant = computed(() => {
    const bed = this.selectedBed();
    if (!bed || bed.status !== BedStatus.Occupied) return null;
    return this.allTenants().find(t => t.bedId === bed.id) || null;
  });

  filteredLayout = computed(() => {
    const propId = this.activePropertyId();
    const filter = this.statusFilter();

    const buildings = this.allBuildings().filter(b => b.propertyId === propId);

    return buildings.map(building => {
      const floors = this.allFloors().filter(f => f.buildingId === building.id);
      
      const mappedFloors = floors.map(floor => {
        const rooms = this.allRooms().filter(r => r.floorId === floor.id);

        const mappedRooms = rooms.map(room => {
          let beds = this.allBeds().filter(b => b.roomId === room.id);
          
          if (filter) {
            beds = beds.filter(b => b.status === filter);
          }

          return { ...room, beds };
        }).filter(r => r.beds.length > 0);

        return { ...floor, rooms: mappedRooms };
      }).filter(f => f.rooms.length > 0);

      return { ...building, floors: mappedFloors };
    }).filter(b => b.floors.length > 0);
  });

  constructor() {
    this.loadLayoutData();
    
    // Bind context if available
    const ctxId = this.propContext.activePropertyId();
    if (ctxId) {
      this.activePropertyId.set(ctxId);
    }
  }

  loadLayoutData() {
    this.properties.set(this.crud.getAll<Property>(StorageKeys.PROPERTIES));
    this.allBuildings.set(this.crud.getAll<Building>(StorageKeys.BUILDINGS));
    this.allFloors.set(this.crud.getAll<Floor>(StorageKeys.FLOORS));
    this.allRooms.set(this.crud.getAll<Room>(StorageKeys.ROOMS));
    this.allBeds.set(this.crud.getAll<Bed>(StorageKeys.BEDS));
    this.allTenants.set(this.crud.getAll<Tenant>(StorageKeys.TENANTS));
  }

  onPropertyChange(id: string) {
    this.activePropertyId.set(id);
    this.propContext.setActiveProperty(id);
    this.selectedBed.set(null);
  }

  selectBed(bed: Bed) {
    this.selectedBed.set(bed);
  }

  getTooltip(bed: Bed): string {
    if (bed.status === BedStatus.Occupied) {
      const tenant = this.allTenants().find(t => t.bedId === bed.id);
      return `Bed ${bed.bedNumber}: Occupied by ${tenant ? tenant.fullName : 'Resident'}`;
    }
    return `Bed ${bed.bedNumber}: ${bed.status}`;
  }

  getBedDotClass(status: BedStatus): string {
    const map: Record<string, string> = {
      [BedStatus.Occupied]: 'bg-emerald-500',
      [BedStatus.Vacant]: 'bg-blue-400',
      [BedStatus.Reserved]: 'bg-amber-400',
      [BedStatus.Maintenance]: 'bg-slate-400',
      [BedStatus.Blocked]: 'bg-red-500',
    };
    return map[status] || 'bg-slate-300';
  }

  getBedCardClass(bed: Bed): string {
    const isSelected = this.selectedBed()?.id === bed.id;
    const border = isSelected ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200/50 dark:border-slate-800/50';
    
    const map: Record<string, string> = {
      [BedStatus.Occupied]: 'bg-emerald-500/5 hover:bg-emerald-500/10',
      [BedStatus.Vacant]: 'bg-blue-400/5 hover:bg-blue-400/10',
      [BedStatus.Reserved]: 'bg-amber-400/5 hover:bg-amber-400/10',
      [BedStatus.Maintenance]: 'bg-slate-400/5 hover:bg-slate-400/10',
      [BedStatus.Blocked]: 'bg-red-500/5 hover:bg-red-500/10',
    };

    return `${border} ${map[bed.status] || 'bg-slate-50'}`;
  }

  getStatusLabelClass(status: BedStatus): string {
    const map: Record<string, string> = {
      [BedStatus.Occupied]: 'bg-emerald-500/10 text-emerald-500',
      [BedStatus.Vacant]: 'bg-blue-500/10 text-blue-500',
      [BedStatus.Reserved]: 'bg-amber-500/10 text-amber-500',
      [BedStatus.Maintenance]: 'bg-slate-500/10 text-slate-500',
      [BedStatus.Blocked]: 'bg-red-500/10 text-red-500',
    };
    return map[status] || 'bg-slate-500/10';
  }

  changeBedStatus(bed: Bed, newStatus: string) {
    const updated = this.crud.update<Bed>(StorageKeys.BEDS, bed.id, { status: newStatus as BedStatus });
    if (updated) {
      this.toast.success('Bed Updated', `Bed ${bed.bedNumber} status updated to ${newStatus}.`);
      this.loadLayoutData();
      
      // Update selected reference
      this.selectedBed.set(updated);
    }
  }
}
