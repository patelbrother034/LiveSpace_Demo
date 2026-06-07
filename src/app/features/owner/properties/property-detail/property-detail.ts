import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';
import { DecimalPipe } from '@angular/common';
import { BedStatus } from '../../../../core/models/enums/bed-status.enum';
import { RoomType } from '../../../../core/models/enums/room-type.enum';

interface IPropertyDetail {
  id: string;
  name: string;
  type: string;
  gender: string;
  address: { street: string; city: string; state: string };
  contactPerson: string;
  phone: string;
  email: string;
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
  curfewTime: string;
}


interface RoomDetail {
  id: string;
  roomNumber: string;
  type: RoomType;
  floor: number;
  totalBeds: number;
  monthlyRent: number;
  beds: { id: string; bedNumber: string; status: BedStatus; tenantName: string | null }[];
}

interface PropertyTenant {
  id: string;
  name: string;
  room: string;
  bed: string;
  phone: string;
  rent: number;
  status: string;
  paymentStatus: string;
  joinDate: string;
}

interface Transaction {
  id: string;
  tenantName: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  mode: string;
}

interface Ticket {
  id: string;
  title: string;
  room: string;
  priority: string;
  status: string;
  reportedBy: string;
  date: string;
  description: string;
}

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    PageHeader, StatCard, StatusBadge, Avatar, ButtonModule,
    TabsModule, TagModule, TooltipModule, ChipModule, DecimalPipe
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Back button + Header -->
      <div class="flex items-center gap-3 mb-2">
        <button pButton icon="pi pi-arrow-left" class="p-button-sm p-button-text p-button-rounded text-slate-500" (click)="goBack()"></button>
        <div class="flex-1">
          <app-page-header [title]="property().name" [subtitle]="property().address.city + ', ' + property().address.state">
            <button pButton label="Edit Property" icon="pi pi-pencil"
              class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
            </button>
          </app-page-header>
        </div>
      </div>

      <!-- Tabbed Content -->
      <p-tabs [value]="0">
        <p-tablist>
          <p-tab [value]="0"><i class="pi pi-home mr-2"></i>Overview</p-tab>
          <p-tab [value]="1"><i class="pi pi-th-large mr-2"></i>Rooms & Beds</p-tab>
          <p-tab [value]="2"><i class="pi pi-users mr-2"></i>Tenants</p-tab>
          <p-tab [value]="3"><i class="pi pi-indian-rupee mr-2"></i>Finance</p-tab>
          <p-tab [value]="4"><i class="pi pi-wrench mr-2"></i>Maintenance</p-tab>
        </p-tablist>

        <p-tabpanels>
          <!-- ======== OVERVIEW TAB ======== -->
          <p-tabpanel [value]="0">
            <div class="space-y-6 pt-4">
              <!-- KPI Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <app-stat-card label="Total Beds" [value]="property().totalBeds" icon="pi-th-large" color="primary" />
                <app-stat-card label="Occupied" [value]="property().occupiedBeds" icon="pi-users" color="success" [trend]="4" trendLabel="this month" />
                <app-stat-card label="Vacant" [value]="property().vacantBeds" icon="pi-box" color="info" />
                <app-stat-card label="Revenue" [value]="'₹' + formatRevenue(property().monthlyRevenue)" icon="pi-indian-rupee" color="warning" [trend]="8" trendLabel="vs last month" />
              </div>

              <!-- Property Info + Occupancy Visual -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Property Info Card -->
                <div class="lg:col-span-2 glass-card p-6">
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5">Property Information</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                      <div>
                        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">Property Type</p>
                        <p class="text-sm font-medium text-slate-800 dark:text-white">{{ property().type }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">Gender</p>
                        <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                          [class]="property().gender === 'Male' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : property().gender === 'Female' ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'">
                          {{ property().gender }}
                        </span>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">Address</p>
                        <p class="text-sm text-slate-700 dark:text-slate-300">{{ property().address.street }}</p>
                        <p class="text-sm text-slate-500 dark:text-slate-400">{{ property().address.city }}, {{ property().address.state }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">Curfew Time</p>
                        <p class="text-sm font-medium text-slate-800 dark:text-white">{{ property().curfewTime }}</p>
                      </div>
                    </div>
                    <div class="space-y-4">
                      <div>
                        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">Contact Person</p>
                        <p class="text-sm font-medium text-slate-800 dark:text-white">{{ property().contactPerson }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">Phone</p>
                        <p class="text-sm text-slate-700 dark:text-slate-300">{{ property().phone }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">Email</p>
                        <p class="text-sm text-slate-700 dark:text-slate-300">{{ property().email }}</p>
                      </div>
                      <div>
                        <p class="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold mb-1">Status</p>
                        <app-status-badge [status]="property().status" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Occupancy Visual + Amenities -->
                <div class="space-y-6">
                  <!-- Occupancy Donut Placeholder -->
                  <div class="glass-card p-6">
                    <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5">Bed Utilization</h3>
                    <div class="flex items-center justify-center">
                      <div class="relative w-40 h-40">
                        <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="50" fill="none" stroke-width="12" class="stroke-slate-100 dark:stroke-slate-800" />
                          <circle cx="60" cy="60" r="50" fill="none" stroke-width="12" stroke-linecap="round"
                            class="stroke-emerald-500"
                            [attr.stroke-dasharray]="occupiedDash()"
                            stroke-dashoffset="0" />
                          <circle cx="60" cy="60" r="50" fill="none" stroke-width="12" stroke-linecap="round"
                            class="stroke-amber-400"
                            [attr.stroke-dasharray]="noticeDash()"
                            [attr.stroke-dashoffset]="'-' + occupiedOffset()" />
                          <circle cx="60" cy="60" r="50" fill="none" stroke-width="12" stroke-linecap="round"
                            class="stroke-slate-400"
                            [attr.stroke-dasharray]="maintenanceDash()"
                            [attr.stroke-dashoffset]="'-' + (occupiedOffset() + noticeOffset())" />
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                          <span class="text-2xl font-bold text-slate-800 dark:text-white">{{ occupancyPercent() }}%</span>
                          <span class="text-[10px] text-slate-400 uppercase font-semibold">Occupied</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex justify-center gap-4 mt-4">
                      <div class="flex items-center gap-1.5 text-xs">
                        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span class="text-slate-500 dark:text-slate-400">Occupied ({{ property().occupiedBeds }})</span>
                      </div>
                      <div class="flex items-center gap-1.5 text-xs">
                        <span class="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                        <span class="text-slate-500 dark:text-slate-400">Vacant ({{ property().vacantBeds }})</span>
                      </div>
                      <div class="flex items-center gap-1.5 text-xs">
                        <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                        <span class="text-slate-500 dark:text-slate-400">Notice ({{ property().noticeBeds }})</span>
                      </div>
                    </div>
                  </div>

                  <!-- Amenities -->
                  <div class="glass-card p-6">
                    <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-3">Amenities</h3>
                    <div class="flex flex-wrap gap-2">
                      @for (amenity of property().amenities; track amenity) {
                        <span class="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30">
                          {{ amenity }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </p-tabpanel>

          <!-- ======== ROOMS & BEDS TAB ======== -->
          <p-tabpanel [value]="1">
            <div class="space-y-6 pt-4">
              <!-- Legend -->
              <div class="glass-card p-4">
                <div class="flex flex-wrap items-center gap-5">
                  <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Bed Status:</span>
                  <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><span class="w-3.5 h-3.5 rounded-full bg-emerald-500"></span> Occupied</div>
                  <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><span class="w-3.5 h-3.5 rounded-full bg-blue-400"></span> Vacant</div>
                  <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><span class="w-3.5 h-3.5 rounded-full bg-amber-400"></span> Notice / Reserved</div>
                  <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><span class="w-3.5 h-3.5 rounded-full bg-slate-400"></span> Maintenance</div>
                  <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400"><span class="w-3.5 h-3.5 rounded-full bg-red-500"></span> Blocked</div>
                </div>
              </div>

              <!-- Room Cards Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                @for (room of rooms(); track room.id) {
                  <div class="glass-card p-5 hover:shadow-lg hover:border-indigo-500/30 transition-all duration-200 group">
                    <!-- Room Header -->
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/20">
                          {{ room.roomNumber }}
                        </div>
                        <div>
                          <p class="font-semibold text-sm text-slate-800 dark:text-white">Room {{ room.roomNumber }}</p>
                          <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase">{{ room.type }} • Floor {{ room.floor }}</p>
                        </div>
                      </div>
                      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">₹{{ formatRevenue(room.monthlyRent) }}/m</span>
                    </div>

                    <!-- Beds Grid -->
                    <div class="grid gap-2" [class]="room.totalBeds <= 2 ? 'grid-cols-2' : room.totalBeds <= 4 ? 'grid-cols-2' : 'grid-cols-3'">
                      @for (bed of room.beds; track bed.id) {
                        <div class="relative p-2.5 rounded-lg border transition-all duration-200 cursor-pointer group/bed"
                          [class]="getBedCardClass(bed.status)"
                          [pTooltip]="bed.tenantName ? bed.bedNumber + ' – ' + bed.tenantName : bed.bedNumber + ' – ' + bed.status"
                          tooltipPosition="top">
                          <div class="flex flex-col items-center gap-1">
                            <div class="w-5 h-5 rounded-full" [class]="getBedDotClass(bed.status)"></div>
                            <span class="text-[10px] font-medium text-slate-600 dark:text-slate-400">{{ bed.bedNumber }}</span>
                          </div>
                        </div>
                      }
                    </div>

                    <!-- Room Summary -->
                    <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>{{ room.totalBeds }} Beds</span>
                      <span>{{ getRoomOccupied(room) }} Occupied</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </p-tabpanel>

          <!-- ======== TENANTS TAB ======== -->
          <p-tabpanel [value]="2">
            <div class="space-y-4 pt-4">
              <div class="glass-card overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                        <th class="py-3.5 px-5">Tenant</th>
                        <th class="py-3.5 px-4">Room / Bed</th>
                        <th class="py-3.5 px-4">Phone</th>
                        <th class="py-3.5 px-4 text-right">Rent</th>
                        <th class="py-3.5 px-4 text-center">Payment</th>
                        <th class="py-3.5 px-4 text-center">Status</th>
                        <th class="py-3.5 px-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                      @for (t of tenants(); track t.id) {
                        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                            (click)="navigateToTenant(t.id)">
                          <td class="py-3.5 px-5">
                            <div class="flex items-center gap-2.5">
                              <app-avatar [name]="t.name" size="sm" />
                              <span class="font-medium text-slate-800 dark:text-white">{{ t.name }}</span>
                            </div>
                          </td>
                          <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">{{ t.room }} / {{ t.bed }}</td>
                          <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">{{ t.phone }}</td>
                          <td class="py-3.5 px-4 text-right font-semibold text-slate-800 dark:text-white">₹{{ t.rent | number }}</td>
                          <td class="py-3.5 px-4 text-center"><app-status-badge [status]="t.paymentStatus" /></td>
                          <td class="py-3.5 px-4 text-center"><app-status-badge [status]="t.status" /></td>
                          <td class="py-3.5 px-4 text-slate-400 dark:text-slate-500 text-xs">{{ t.joinDate }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </p-tabpanel>

          <!-- ======== FINANCE TAB ======== -->
          <p-tabpanel [value]="3">
            <div class="space-y-6 pt-4">
              <!-- Revenue Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <app-stat-card label="This Month" value="₹1.65L" icon="pi-indian-rupee" color="success" [trend]="8" trendLabel="vs last month" />
                <app-stat-card label="Pending Dues" value="₹28,500" icon="pi-clock" color="warning" />
                <app-stat-card label="Collection Rate" value="93%" icon="pi-chart-line" color="primary" [trend]="3" trendLabel="improved" />
                <app-stat-card label="Overdue" value="₹14,500" icon="pi-exclamation-triangle" color="danger" />
              </div>

              <!-- Recent Transactions -->
              <div class="glass-card p-6">
                <div class="flex items-center justify-between mb-5">
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
                  <button pButton label="Export" icon="pi pi-download" class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"></button>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                        <th class="py-3 px-4">Tenant</th>
                        <th class="py-3 px-4">Type</th>
                        <th class="py-3 px-4 text-right">Amount</th>
                        <th class="py-3 px-4">Date</th>
                        <th class="py-3 px-4">Mode</th>
                        <th class="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                      @for (tx of transactions(); track tx.id) {
                        <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td class="py-3.5 px-4">
                            <div class="flex items-center gap-2">
                              <app-avatar [name]="tx.tenantName" size="sm" />
                              <span class="font-medium text-slate-800 dark:text-white">{{ tx.tenantName }}</span>
                            </div>
                          </td>
                          <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400">{{ tx.type }}</td>
                          <td class="py-3.5 px-4 text-right font-semibold text-slate-800 dark:text-white">₹{{ tx.amount | number }}</td>
                          <td class="py-3.5 px-4 text-slate-400 dark:text-slate-500 text-xs">{{ tx.date }}</td>
                          <td class="py-3.5 px-4">
                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">{{ tx.mode }}</span>
                          </td>
                          <td class="py-3.5 px-4 text-center"><app-status-badge [status]="tx.status" /></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </p-tabpanel>

          <!-- ======== MAINTENANCE TAB ======== -->
          <p-tabpanel [value]="4">
            <div class="space-y-4 pt-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-lg font-bold text-slate-800 dark:text-white">Active Tickets</h3>
                <button pButton label="Raise Ticket" icon="pi pi-plus"
                  class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90">
                </button>
              </div>

              <div class="space-y-4">
                @for (ticket of tickets(); track ticket.id) {
                  <div class="glass-card p-5 hover:border-indigo-500/30 transition-all duration-200">
                    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div class="flex items-start gap-3.5">
                        <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                          [class]="ticket.priority === 'High' ? 'bg-red-50 dark:bg-red-950/20 text-red-500' : ticket.priority === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'">
                          <i class="pi pi-wrench text-lg"></i>
                        </div>
                        <div>
                          <p class="font-semibold text-slate-800 dark:text-white">{{ ticket.title }}</p>
                          <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">{{ ticket.description }}</p>
                          <div class="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                            <span><i class="pi pi-home mr-1"></i>Room {{ ticket.room }}</span>
                            <span><i class="pi pi-user mr-1"></i>{{ ticket.reportedBy }}</span>
                            <span><i class="pi pi-calendar mr-1"></i>{{ ticket.date }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2.5 shrink-0">
                        <app-status-badge [status]="ticket.status" />
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                          [class]="ticket.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                          {{ ticket.priority }}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
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
    :host ::ng-deep .p-tabs .p-tablist-tab-list {
      border-bottom: 1px solid var(--p-surface-200);
      gap: 0;
    }
    :host ::ng-deep .p-tab {
      padding: 0.875rem 1.25rem;
      font-weight: 600;
      font-size: 0.875rem;
    }
  `]
})
export class PropertyDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  propertyId = signal('prop-001');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.propertyId.set(id);
  }

  // SVG donut math
  private circumference = 2 * Math.PI * 50; // ~314.16

  occupancyPercent = computed(() => {
    const p = this.property();
    return p.totalBeds ? Math.round((p.occupiedBeds / p.totalBeds) * 100) : 0;
  });

  occupiedDash = computed(() => {
    const p = this.property();
    const pct = p.totalBeds ? p.occupiedBeds / p.totalBeds : 0;
    return `${pct * this.circumference} ${this.circumference}`;
  });

  occupiedOffset = computed(() => {
    const p = this.property();
    return p.totalBeds ? (p.occupiedBeds / p.totalBeds) * this.circumference : 0;
  });

  noticeDash = computed(() => {
    const p = this.property();
    const pct = p.totalBeds ? p.noticeBeds / p.totalBeds : 0;
    return `${pct * this.circumference} ${this.circumference}`;
  });

  noticeOffset = computed(() => {
    const p = this.property();
    return p.totalBeds ? (p.noticeBeds / p.totalBeds) * this.circumference : 0;
  });

  maintenanceDash = computed(() => {
    const p = this.property();
    const pct = p.totalBeds ? p.maintenanceBeds / p.totalBeds : 0;
    return `${pct * this.circumference} ${this.circumference}`;
  });

  property = signal<IPropertyDetail>({
    id: 'prop-001',
    name: 'Royal Heights PG',
    type: 'PG',
    gender: 'Male',
    address: { street: 'Plot 42, Sector 62', city: 'Noida', state: 'Uttar Pradesh' },
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'royal@livespace.in',
    totalRooms: 15,
    totalBeds: 45,
    occupiedBeds: 41,
    vacantBeds: 2,
    maintenanceBeds: 1,
    noticeBeds: 1,
    amenities: ['WiFi', 'AC', 'Laundry', 'Food', 'Parking', 'Power Backup', 'Hot Water', 'CCTV'],
    status: 'Active',
    monthlyRevenue: 165000,
    gradient: 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500',
    curfewTime: '10:30 PM'
  });

  rooms = signal<RoomDetail[]>([
    {
      id: 'r-101', roomNumber: '101', type: RoomType.Single, floor: 1, totalBeds: 1, monthlyRent: 14500,
      beds: [{ id: 'b-101a', bedNumber: 'A', status: BedStatus.Occupied, tenantName: 'Aditya Patel' }]
    },
    {
      id: 'r-102', roomNumber: '102', type: RoomType.Double, floor: 1, totalBeds: 2, monthlyRent: 12000,
      beds: [
        { id: 'b-102a', bedNumber: 'A', status: BedStatus.Occupied, tenantName: 'Rohan Sharma' },
        { id: 'b-102b', bedNumber: 'B', status: BedStatus.Occupied, tenantName: 'Vikram Mehta' }
      ]
    },
    {
      id: 'r-103', roomNumber: '103', type: RoomType.Triple, floor: 1, totalBeds: 3, monthlyRent: 9500,
      beds: [
        { id: 'b-103a', bedNumber: 'A', status: BedStatus.Occupied, tenantName: 'Nikhil Joshi' },
        { id: 'b-103b', bedNumber: 'B', status: BedStatus.Occupied, tenantName: 'Karan Gupta' },
        { id: 'b-103c', bedNumber: 'C', status: BedStatus.Vacant, tenantName: null }
      ]
    },
    {
      id: 'r-104', roomNumber: '104', type: RoomType.Double, floor: 1, totalBeds: 2, monthlyRent: 12000,
      beds: [
        { id: 'b-104a', bedNumber: 'A', status: BedStatus.Occupied, tenantName: 'Suresh Nair' },
        { id: 'b-104b', bedNumber: 'B', status: BedStatus.Maintenance, tenantName: null }
      ]
    },
    {
      id: 'r-201', roomNumber: '201', type: RoomType.Triple, floor: 2, totalBeds: 3, monthlyRent: 10000,
      beds: [
        { id: 'b-201a', bedNumber: 'A', status: BedStatus.Occupied, tenantName: 'Amit Tiwari' },
        { id: 'b-201b', bedNumber: 'B', status: BedStatus.Occupied, tenantName: 'Deepak Yadav' },
        { id: 'b-201c', bedNumber: 'C', status: BedStatus.Occupied, tenantName: 'Rahul Verma' }
      ]
    },
    {
      id: 'r-202', roomNumber: '202', type: RoomType.Double, floor: 2, totalBeds: 2, monthlyRent: 12500,
      beds: [
        { id: 'b-202a', bedNumber: 'A', status: BedStatus.Occupied, tenantName: 'Prateek Saxena' },
        { id: 'b-202b', bedNumber: 'B', status: BedStatus.Reserved, tenantName: null }
      ]
    },
    {
      id: 'r-203', roomNumber: '203', type: RoomType.Dormitory, floor: 2, totalBeds: 6, monthlyRent: 7500,
      beds: [
        { id: 'b-203a', bedNumber: 'A', status: BedStatus.Occupied, tenantName: 'Sanjay Mishra' },
        { id: 'b-203b', bedNumber: 'B', status: BedStatus.Occupied, tenantName: 'Vikas Pandey' },
        { id: 'b-203c', bedNumber: 'C', status: BedStatus.Occupied, tenantName: 'Rajat Soni' },
        { id: 'b-203d', bedNumber: 'D', status: BedStatus.Vacant, tenantName: null },
        { id: 'b-203e', bedNumber: 'E', status: BedStatus.Occupied, tenantName: 'Manish Dubey' },
        { id: 'b-203f', bedNumber: 'F', status: BedStatus.Blocked, tenantName: null }
      ]
    },
    {
      id: 'r-301', roomNumber: '301', type: RoomType.Single, floor: 3, totalBeds: 1, monthlyRent: 15000,
      beds: [{ id: 'b-301a', bedNumber: 'A', status: BedStatus.Occupied, tenantName: 'Ankit Chauhan' }]
    }
  ]);

  tenants = signal<PropertyTenant[]>([
    { id: 't-001', name: 'Aditya Patel', room: '101', bed: 'A', phone: '9876543001', rent: 14500, status: 'Active', paymentStatus: 'Paid', joinDate: 'Jan 15, 2026' },
    { id: 't-002', name: 'Rohan Sharma', room: '102', bed: 'A', phone: '9876543002', rent: 12000, status: 'Active', paymentStatus: 'Pending', joinDate: 'Feb 01, 2026' },
    { id: 't-003', name: 'Vikram Mehta', room: '102', bed: 'B', phone: '9876543003', rent: 12000, status: 'Active', paymentStatus: 'Paid', joinDate: 'Feb 01, 2026' },
    { id: 't-004', name: 'Nikhil Joshi', room: '103', bed: 'A', phone: '9876543004', rent: 9500, status: 'Active', paymentStatus: 'Paid', joinDate: 'Mar 10, 2026' },
    { id: 't-005', name: 'Karan Gupta', room: '103', bed: 'B', phone: '9876543005', rent: 9500, status: 'Notice', paymentStatus: 'Overdue', joinDate: 'Nov 20, 2025' },
    { id: 't-006', name: 'Suresh Nair', room: '104', bed: 'A', phone: '9876543006', rent: 12000, status: 'Active', paymentStatus: 'Paid', joinDate: 'Apr 01, 2026' },
    { id: 't-007', name: 'Amit Tiwari', room: '201', bed: 'A', phone: '9876543007', rent: 10000, status: 'Active', paymentStatus: 'Paid', joinDate: 'Jan 05, 2026' },
    { id: 't-008', name: 'Deepak Yadav', room: '201', bed: 'B', phone: '9876543008', rent: 10000, status: 'Active', paymentStatus: 'Partial', joinDate: 'Feb 15, 2026' },
  ]);

  transactions = signal<Transaction[]>([
    { id: 'tx-1', tenantName: 'Aditya Patel', type: 'Rent', amount: 14500, date: 'May 25, 2026', status: 'Paid', mode: 'UPI' },
    { id: 'tx-2', tenantName: 'Rohan Sharma', type: 'Rent', amount: 12000, date: 'May 24, 2026', status: 'Pending', mode: 'Bank' },
    { id: 'tx-3', tenantName: 'Vikram Mehta', type: 'Rent', amount: 12000, date: 'May 23, 2026', status: 'Paid', mode: 'UPI' },
    { id: 'tx-4', tenantName: 'Nikhil Joshi', type: 'Rent', amount: 9500, date: 'May 22, 2026', status: 'Paid', mode: 'Cash' },
    { id: 'tx-5', tenantName: 'Karan Gupta', type: 'Rent', amount: 9500, date: 'May 20, 2026', status: 'Overdue', mode: '—' },
    { id: 'tx-6', tenantName: 'Suresh Nair', type: 'Security Deposit', amount: 24000, date: 'Apr 01, 2026', status: 'Paid', mode: 'NEFT' },
    { id: 'tx-7', tenantName: 'Deepak Yadav', type: 'Rent', amount: 5000, date: 'May 18, 2026', status: 'Partial', mode: 'UPI' },
  ]);

  tickets = signal<Ticket[]>([
    { id: 'tk-1', title: 'Air Conditioner Water Leakage', room: '204', priority: 'High', status: 'Open', reportedBy: 'Rohan Sharma', date: 'May 25, 2026', description: 'AC unit leaking water from indoor unit, damaging wall paint. Urgent attention needed.' },
    { id: 'tk-2', title: 'Geyser Not Heating', room: '102', priority: 'High', status: 'Open', reportedBy: 'Vikram Mehta', date: 'May 24, 2026', description: 'Hot water geyser stopped working completely since yesterday evening.' },
    { id: 'tk-3', title: 'WiFi Connectivity Issue', room: '201', priority: 'Medium', status: 'Open', reportedBy: 'Amit Tiwari', date: 'May 23, 2026', description: 'WiFi signal is extremely weak on 2nd floor. Keeps disconnecting.' },
    { id: 'tk-4', title: 'Broken Window Latch', room: '301', priority: 'Low', status: 'Resolved', reportedBy: 'Ankit Chauhan', date: 'May 20, 2026', description: 'Window latch in room 301 is broken, window cannot be closed properly.' },
  ]);

  getBedDotClass(status: BedStatus): string {
    const map: Record<string, string> = {
      [BedStatus.Occupied]: 'bg-emerald-500 shadow-sm shadow-emerald-500/40',
      [BedStatus.Vacant]: 'bg-blue-400 shadow-sm shadow-blue-400/40',
      [BedStatus.Reserved]: 'bg-amber-400 shadow-sm shadow-amber-400/40',
      [BedStatus.Maintenance]: 'bg-slate-400 shadow-sm shadow-slate-400/40',
      [BedStatus.Blocked]: 'bg-red-500 shadow-sm shadow-red-500/40',
    };
    return map[status] || 'bg-slate-300';
  }

  getBedCardClass(status: BedStatus): string {
    const map: Record<string, string> = {
      [BedStatus.Occupied]: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-900/10',
      [BedStatus.Vacant]: 'border-blue-200 bg-blue-50/50 dark:border-blue-800/30 dark:bg-blue-900/10',
      [BedStatus.Reserved]: 'border-amber-200 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-900/10',
      [BedStatus.Maintenance]: 'border-slate-200 bg-slate-50/50 dark:border-slate-700/30 dark:bg-slate-800/20',
      [BedStatus.Blocked]: 'border-red-200 bg-red-50/50 dark:border-red-800/30 dark:bg-red-900/10',
    };
    return map[status] || 'border-slate-200 bg-slate-50/50';
  }

  getRoomOccupied(room: RoomDetail): number {
    return room.beds.filter(b => b.status === BedStatus.Occupied).length;
  }

  formatRevenue(amount: number): string {
    if (amount >= 100000) return (amount / 100000).toFixed(2) + 'L';
    if (amount >= 1000) return (amount / 1000).toFixed(1) + 'K';
    return amount.toString();
  }

  goBack() {
    this.router.navigate(['/owner/properties']);
  }

  navigateToTenant(id: string) {
    this.router.navigate(['/owner/tenants', id]);
  }
}
