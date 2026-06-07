import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PropertyType } from '../../../../core/models/enums/property-type.enum';
import { Gender } from '../../../../core/models/enums/gender.enum';

interface MockProperty {
  id: string;
  name: string;
  type: PropertyType;
  gender: Gender;
  address: { street: string; city: string; state: string };
  contactPerson: string;
  phone: string;
  email: string;
  totalBuildings: number;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  vacantBeds: number;
  maintenanceBeds: number;
  noticeBeds: number;
  amenities: string[];
  status: string;
  monthlyRevenue: number;
  gradient: string;
}

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    FormsModule, PageHeader, StatCard, StatusBadge, ButtonModule,
    InputTextModule, TableModule, TagModule, TooltipModule,
    SkeletonLoader, EmptyState
  ],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Properties" subtitle="Manage your PG portfolio">
        <button pButton label="Add Property" icon="pi pi-plus"
          (click)="navigateToAddProperty()"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- KPI Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Total Properties" [value]="properties().length + ' PGs'" icon="pi-building" color="primary" [trend]="12" trendLabel="vs last quarter" />
        <app-stat-card label="Total Beds" [value]="totalBeds() + ' Beds'" icon="pi-th-large" color="info" [trend]="8" trendLabel="capacity added" />
        <app-stat-card label="Occupancy Rate" [value]="occupancyRate() + '%'" icon="pi-users" color="success" [trend]="4" trendLabel="since last month" />
        <app-stat-card label="Monthly Revenue" [value]="'₹' + formattedRevenue()" icon="pi-indian-rupee" color="warning" [trend]="6" trendLabel="revenue growth" />
      </div>

      <!-- Toolbar: Search + View Toggle -->
      <div class="glass-card p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="relative w-full sm:w-80">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="text" pInputText
              placeholder="Search properties..."
              class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)" />
          </div>
          <div class="flex items-center gap-2">
            <button pButton [icon]="'pi pi-th-large'"
              [class]="viewMode() === 'grid' ? 'p-button-sm rounded-lg bg-indigo-500 border-indigo-500 text-white' : 'p-button-sm p-button-outlined rounded-lg border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400'"
              (click)="viewMode.set('grid')" pTooltip="Grid View" tooltipPosition="bottom">
            </button>
            <button pButton [icon]="'pi pi-list'"
              [class]="viewMode() === 'list' ? 'p-button-sm rounded-lg bg-indigo-500 border-indigo-500 text-white' : 'p-button-sm p-button-outlined rounded-lg border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-400'"
              (click)="viewMode.set('list')" pTooltip="List View" tooltipPosition="bottom">
            </button>
          </div>
        </div>
      </div>

      <!-- Content Area with Skeleton Loading & Empty State -->
      @if (isLoading()) {
        @if (viewMode() === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            <app-skeleton-loader variant="card" [count]="4" />
          </div>
        } @else {
          <div class="glass-card p-4 space-y-4">
            <app-skeleton-loader variant="table-row" [count]="4" />
          </div>
        }
      } @else if (filteredProperties().length === 0) {
        <app-empty-state
          icon="pi-building"
          title="No properties found"
          message="We couldn't find any properties matching your search query. Try clearing or expanding your query."
          actionLabel="Clear Search"
          (actionClick)="searchQuery.set('')">
        </app-empty-state>
      } @else {
        <!-- Grid View -->
        @if (viewMode() === 'grid') {
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            @for (prop of filteredProperties(); track prop.id) {
              <div class="glass-card overflow-hidden hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer group"
                   (click)="navigateToDetail(prop.id)">
                <!-- Gradient Header / Image Placeholder -->
                <div class="h-36 relative overflow-hidden" [class]="prop.gradient">
                  <div class="absolute inset-0 bg-black/10"></div>
                  <div class="absolute top-3 right-3">
                    <app-status-badge [status]="prop.status" />
                  </div>
                  <div class="absolute top-3 left-3">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                      {{ prop.type }}
                    </span>
                  </div>
                  <div class="absolute bottom-4 left-4 right-4">
                    <h3 class="text-lg font-bold text-white drop-shadow-md">{{ prop.name }}</h3>
                    <p class="text-xs text-white/80 mt-0.5 flex items-center gap-1">
                      <i class="pi pi-map-marker text-[10px]"></i>
                      {{ prop.address.city }}, {{ prop.address.state }}
                    </p>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-5 space-y-4">
                  <!-- Occupancy Progress -->
                  <div>
                    <div class="flex items-center justify-between text-sm mb-2">
                      <span class="text-slate-500 dark:text-slate-400">Occupancy</span>
                      <span class="font-bold text-slate-800 dark:text-white">{{ getOccupancyPercent(prop) }}%</span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-700"
                        [style.width.%]="getOccupancyPercent(prop)"
                        [class]="getOccupancyPercent(prop) >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : getOccupancyPercent(prop) >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'">
                      </div>
                    </div>
                  </div>

                  <!-- Bed Counts -->
                  <div class="grid grid-cols-3 gap-3">
                    <div class="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ prop.occupiedBeds }}</p>
                      <p class="text-[10px] text-emerald-500/80 uppercase font-medium">Occupied</p>
                    </div>
                    <div class="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ prop.vacantBeds }}</p>
                      <p class="text-[10px] text-blue-500/80 uppercase font-medium">Vacant</p>
                    </div>
                    <div class="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <p class="text-lg font-bold text-amber-600 dark:text-amber-400">{{ prop.noticeBeds }}</p>
                      <p class="text-[10px] text-amber-500/80 uppercase font-medium">Notice</p>
                    </div>
                  </div>

                  <!-- Revenue & Gender -->
                  <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p class="text-xs text-slate-400 dark:text-slate-500">Revenue</p>
                      <p class="font-bold text-slate-800 dark:text-white">₹{{ formatRevenue(prop.monthlyRevenue) }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                        [class]="prop.gender === 'Male' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : prop.gender === 'Female' ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'">
                        {{ prop.gender }}
                      </span>
                      <span class="text-xs text-slate-400">{{ prop.totalRooms }} Rooms</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- List View -->
        @if (viewMode() === 'list') {
          <div class="glass-card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                    <th class="py-4 px-5">Property</th>
                    <th class="py-4 px-4">Type</th>
                    <th class="py-4 px-4">Location</th>
                    <th class="py-4 px-4 text-center">Total Beds</th>
                    <th class="py-4 px-4 text-center">Occupied %</th>
                    <th class="py-4 px-4 text-right">Revenue</th>
                    <th class="py-4 px-4 text-center">Status</th>
                    <th class="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                  @for (prop of filteredProperties(); track prop.id) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                        (click)="navigateToDetail(prop.id)">
                      <td class="py-4 px-5">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-bold" [class]="prop.gradient">
                            {{ prop.name.charAt(0) }}
                          </div>
                          <div>
                            <p class="font-semibold text-slate-800 dark:text-white text-sm">{{ prop.name }}</p>
                            <p class="text-xs text-slate-400 dark:text-slate-500">{{ prop.gender }} • {{ prop.totalRooms }} Rooms</p>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-4">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {{ prop.type }}
                        </span>
                      </td>
                      <td class="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                        {{ prop.address.city }}, {{ prop.address.state }}
                      </td>
                      <td class="py-4 px-4 text-center">
                        <span class="font-bold text-slate-800 dark:text-white">{{ prop.totalBeds }}</span>
                      </td>
                      <td class="py-4 px-4">
                        <div class="flex flex-col items-center gap-1">
                          <span class="text-sm font-bold" [class]="getOccupancyPercent(prop) >= 85 ? 'text-emerald-600 dark:text-emerald-400' : getOccupancyPercent(prop) >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'">
                            {{ getOccupancyPercent(prop) }}%
                          </span>
                          <div class="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div class="h-full rounded-full"
                              [style.width.%]="getOccupancyPercent(prop)"
                              [class]="getOccupancyPercent(prop) >= 85 ? 'bg-emerald-500' : getOccupancyPercent(prop) >= 60 ? 'bg-blue-500' : 'bg-amber-500'">
                            </div>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-4 text-right font-semibold text-slate-800 dark:text-white">
                        ₹{{ formatRevenue(prop.monthlyRevenue) }}
                      </td>
                      <td class="py-4 px-4 text-center">
                        <app-status-badge [status]="prop.status" />
                      </td>
                      <td class="py-4 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                          <button pButton icon="pi pi-eye" class="p-button-sm p-button-text p-button-rounded text-slate-500" pTooltip="View Details" tooltipPosition="top" (click)="$event.stopPropagation(); navigateToDetail(prop.id)"></button>
                          <button pButton icon="pi pi-pencil" class="p-button-sm p-button-text p-button-rounded text-slate-500" pTooltip="Edit" tooltipPosition="top" (click)="$event.stopPropagation()"></button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class PropertyList implements OnInit {
  private router = inject(Router);

  viewMode = signal<'grid' | 'list'>('grid');
  searchQuery = signal('');
  isLoading = signal(true);

  ngOnInit() {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 650);
  }

  properties = signal<MockProperty[]>([
    {
      id: 'prop-001',
      name: 'Royal Heights PG',
      type: PropertyType.PG,
      gender: Gender.Male,
      address: { street: 'Plot 42, Sector 62', city: 'Noida', state: 'Uttar Pradesh' },
      contactPerson: 'Rajesh Kumar',
      phone: '9876543210',
      email: 'royal@livespace.in',
      totalBuildings: 1,
      totalFloors: 3,
      totalRooms: 15,
      totalBeds: 45,
      occupiedBeds: 41,
      vacantBeds: 2,
      maintenanceBeds: 1,
      noticeBeds: 1,
      amenities: ['WiFi', 'AC', 'Laundry', 'Food', 'Parking'],
      status: 'Active',
      monthlyRevenue: 165000,
      gradient: 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500'
    },
    {
      id: 'prop-002',
      name: 'Apex Elite PG',
      type: PropertyType.PG,
      gender: Gender.Unisex,
      address: { street: '24th Main, HSR Layout', city: 'Bangalore', state: 'Karnataka' },
      contactPerson: 'Meena Iyer',
      phone: '9876543211',
      email: 'apex@livespace.in',
      totalBuildings: 2,
      totalFloors: 4,
      totalRooms: 20,
      totalBeds: 60,
      occupiedBeds: 54,
      vacantBeds: 4,
      maintenanceBeds: 0,
      noticeBeds: 2,
      amenities: ['WiFi', 'AC', 'Gym', 'Food', 'Laundry', 'Power Backup'],
      status: 'Active',
      monthlyRevenue: 245000,
      gradient: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500'
    },
    {
      id: 'prop-003',
      name: 'LiveSpace Elite',
      type: PropertyType.CoLiving,
      gender: Gender.Male,
      address: { street: 'DLF Phase 3, Cyber City', city: 'Gurgaon', state: 'Haryana' },
      contactPerson: 'Vikram Singh',
      phone: '9876543212',
      email: 'elite@livespace.in',
      totalBuildings: 1,
      totalFloors: 5,
      totalRooms: 12,
      totalBeds: 35,
      occupiedBeds: 28,
      vacantBeds: 5,
      maintenanceBeds: 1,
      noticeBeds: 1,
      amenities: ['WiFi', 'AC', 'Coworking', 'Food', 'Rooftop Lounge'],
      status: 'Active',
      monthlyRevenue: 185000,
      gradient: 'bg-gradient-to-br from-orange-500 via-rose-500 to-pink-600'
    },
    {
      id: 'prop-004',
      name: 'Co-Living Nest',
      type: PropertyType.Hostel,
      gender: Gender.Female,
      address: { street: 'Katraj–Kondhwa Road', city: 'Pune', state: 'Maharashtra' },
      contactPerson: 'Priya Deshmukh',
      phone: '9876543213',
      email: 'nest@livespace.in',
      totalBuildings: 1,
      totalFloors: 3,
      totalRooms: 11,
      totalBeds: 32,
      occupiedBeds: 25,
      vacantBeds: 5,
      maintenanceBeds: 1,
      noticeBeds: 1,
      amenities: ['WiFi', 'Laundry', 'Food', 'CCTV', 'Library'],
      status: 'Active',
      monthlyRevenue: 120000,
      gradient: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600'
    }
  ]);

  filteredProperties = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.properties();
    return this.properties().filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.address.city.toLowerCase().includes(query) ||
      p.type.toLowerCase().includes(query)
    );
  });

  totalBeds = computed(() => this.properties().reduce((sum, p) => sum + p.totalBeds, 0));

  occupancyRate = computed(() => {
    const total = this.totalBeds();
    const occupied = this.properties().reduce((sum, p) => sum + p.occupiedBeds, 0);
    return total ? Math.round((occupied / total) * 100) : 0;
  });

  formattedRevenue = computed(() => {
    const total = this.properties().reduce((sum, p) => sum + p.monthlyRevenue, 0);
    return this.formatRevenue(total);
  });

  getOccupancyPercent(prop: MockProperty): number {
    return prop.totalBeds ? Math.round((prop.occupiedBeds / prop.totalBeds) * 100) : 0;
  }

  formatRevenue(amount: number): string {
    if (amount >= 100000) return (amount / 100000).toFixed(2) + 'L';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'K';
    return amount.toString();
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/owner/properties', id]);
  }

  navigateToAddProperty() {
    this.router.navigate(['/owner/properties/add']);
  }
}
