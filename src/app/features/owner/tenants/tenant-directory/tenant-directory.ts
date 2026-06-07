import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DecimalPipe } from '@angular/common';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface MappedTenant {
  id: string;
  fullName: string;
  property: string;
  propertyName: string;
  roomNumber: string;
  bedNumber: string;
  rent: number;
  paymentStatus: string;
  status: string;
  phone: string;
  email: string;
  avatar: string | null;
}

import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-tenant-directory',
  standalone: true,
  imports: [
    FormsModule, PageHeader, StatusBadge, Avatar, ButtonModule,
    InputTextModule, TableModule, TagModule, TooltipModule, DecimalPipe,
    SkeletonLoader, EmptyState
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Tenant Directory" subtitle="Manage and search your resident registry">
        <button pButton label="Check-In New Tenant" icon="pi pi-user-plus" (click)="navigateToCheckIn()"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- Filters & Search Toolbar -->
      <div class="glass-card p-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search input -->
          <div class="relative md:col-span-2">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="text" pInputText
              placeholder="Search by name, email or phone..."
              class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)" />
          </div>

          <!-- Property Filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [ngModel]="selectedProperty()"
              (ngModelChange)="selectedProperty.set($event)">
              <option value="All">All Properties</option>
              @for (pName of propertyNames(); track pName) {
                <option [value]="pName">{{ pName }}</option>
              }
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [ngModel]="selectedStatus()"
              (ngModelChange)="selectedStatus.set($event)">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Notice">Notice</option>
              <option value="CheckedOut">CheckedOut</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tenants Table / Content Area -->
      @if (isLoading()) {
        <div class="glass-card p-4 space-y-4">
          <app-skeleton-loader variant="table-row" [count]="5" />
        </div>
      } @else if (filteredTenants().length === 0) {
        <app-empty-state
          icon="pi-users"
          title="No residents found"
          message="We couldn't find any residents matching your filters or search terms. Try modifying your search."
          actionLabel="Clear Filters"
          (actionClick)="searchQuery.set(''); selectedProperty.set('All'); selectedStatus.set('All');">
        </app-empty-state>
      } @else {
        <div class="glass-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                  <th class="py-4 px-5">Resident</th>
                  <th class="py-4 px-4">Property</th>
                  <th class="py-4 px-4">Room/Bed</th>
                  <th class="py-4 px-4 text-right">Monthly Rent</th>
                  <th class="py-4 px-4 text-center">Payment Status</th>
                  <th class="py-4 px-4 text-center">Lease Status</th>
                  <th class="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                @for (tenant of filteredTenants(); track tenant.id) {
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      (click)="navigateToProfile(tenant.id)">
                    <!-- Resident Info -->
                    <td class="py-4 px-5">
                      <div class="flex items-center gap-3">
                        <app-avatar [name]="tenant.fullName" size="sm" />
                        <div>
                          <p class="font-semibold text-slate-800 dark:text-white text-sm">{{ tenant.fullName }}</p>
                          <p class="text-xs text-slate-400 dark:text-slate-500">{{ tenant.email }} • {{ tenant.phone }}</p>
                        </div>
                      </div>
                    </td>
                    
                    <!-- Property -->
                    <td class="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                      {{ tenant.propertyName }}
                    </td>

                    <!-- Room/Bed -->
                    <td class="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                      Room {{ tenant.roomNumber }} / Bed {{ tenant.bedNumber }}
                    </td>

                    <!-- Rent -->
                    <td class="py-4 px-4 text-right font-semibold text-slate-800 dark:text-white">
                      ₹{{ tenant.rent | number }}
                    </td>

                    <!-- Payment Status -->
                    <td class="py-4 px-4 text-center">
                      <app-status-badge [status]="tenant.paymentStatus" />
                    </td>

                    <!-- Tenant Status -->
                    <td class="py-4 px-4 text-center">
                      <app-status-badge [status]="tenant.status" />
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-4 text-center" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-center gap-1">
                        <button pButton icon="pi pi-eye" class="p-button-sm p-button-text p-button-rounded text-slate-500" pTooltip="View Profile" tooltipPosition="top" (click)="navigateToProfile(tenant.id)"></button>
                        <button pButton icon="pi pi-envelope" class="p-button-sm p-button-text p-button-rounded text-slate-500" pTooltip="Email" tooltipPosition="top"></button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
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
export class TenantDirectory implements OnInit {
  private router = inject(Router);
  private crudService = inject(CrudService);

  searchQuery = signal('');
  selectedProperty = signal('All');
  selectedStatus = signal('All');
  isLoading = signal(true);

  tenants = signal<MappedTenant[]>([]);
  propertyNames = signal<string[]>([]);

  constructor() {
    this.loadData();
  }

  ngOnInit() {
    setTimeout(() => {
      this.isLoading.set(false);
    }, 650);
  }

  loadData() {
    const rawTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    // Extract unique active property names for filters
    const pNames = properties.map((p: any) => p.name);
    this.propertyNames.set(Array.from(new Set(pNames)));

    const mapped = rawTenants.map((t: any) => {
      const prop = properties.find((p: any) => p.id === t.propertyId);
      const room = rooms.find((r: any) => r.id === t.roomId);
      const bed = beds.find((b: any) => b.id === t.bedId);

      return {
        id: t.id,
        fullName: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        property: t.propertyId || '',
        propertyName: prop ? prop.name : 'Unknown Property',
        roomNumber: room ? room.roomNumber : (t.roomNumber || 'N/A'),
        bedNumber: bed ? bed.bedNumber.split('-').pop() || bed.bedNumber : (t.bedNumber || 'N/A'),
        rent: t.monthlyRent || t.rent || 0,
        paymentStatus: t.paymentStatus || 'Pending',
        status: t.status || 'Active',
        phone: t.phone || '',
        email: t.email || '',
        avatar: t.photo || null
      };
    });

    this.tenants.set(mapped);
  }

  filteredTenants = computed(() => {
    let list = this.tenants();
    const query = this.searchQuery().toLowerCase().trim();
    const prop = this.selectedProperty();
    const stat = this.selectedStatus();

    if (query) {
      list = list.filter(t =>
        t.fullName.toLowerCase().includes(query) ||
        t.email.toLowerCase().includes(query) ||
        t.phone.includes(query)
      );
    }

    if (prop !== 'All') {
      list = list.filter(t => t.propertyName === prop);
    }

    if (stat !== 'All') {
      list = list.filter(t => t.status === stat);
    }

    return list;
  });

  navigateToProfile(id: string) {
    this.router.navigate(['/owner/tenants', id]);
  }

  navigateToCheckIn() {
    this.router.navigate(['/owner/tenants/check-in']);
  }
}
