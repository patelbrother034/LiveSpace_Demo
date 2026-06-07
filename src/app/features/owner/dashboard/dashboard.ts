import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';

interface PropertyOccupancy {
  id: string;
  name: string;
  location: string;
  totalBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  roomsCount: number;
  colorClass: string;
}

interface DashboardTransaction {
  id: string;
  tenantName: string;
  property: string;
  amount: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

interface MaintenanceTask {
  id: string;
  title: string;
  property: string;
  room: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Resolved' | 'Closed';
  date: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  colorClass: string;
  bgClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeader, StatCard, StatusBadge, Avatar, ButtonModule, RouterLink],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Owner Dashboard" subtitle="Welcome back! Here is what's happening across your properties today.">
        <button pButton label="Add PG" icon="pi pi-plus"
          routerLink="/owner/properties/add"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90">
        </button>
        <button pButton label="Collect Rent" icon="pi pi-indian-rupee"
          routerLink="/owner/payments/rent-collection"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <!-- Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card
          label="Total Properties"
          value="4 PGs"
          icon="pi-building"
          color="primary"
          [trend]="12"
          trendLabel="vs last quarter"
        />
        <app-stat-card
          label="Total Occupancy"
          value="86% (148/172)"
          icon="pi-users"
          color="success"
          [trend]="4"
          trendLabel="since last month"
        />
        <app-stat-card
          label="Monthly Revenue"
          value="₹4.85L"
          icon="pi-indian-rupee"
          color="info"
          [trend]="8"
          trendLabel="vs target"
        />
        <app-stat-card
          label="Unresolved Tickets"
          value="5 Active"
          icon="pi-ticket"
          color="warning"
          [trend]="-15"
          trendLabel="resolved faster"
        />
      </div>

      <!-- Quick Actions Row -->
      <div>
        <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          @for (action of quickActions(); track action.label) {
            <a [routerLink]="action.route"
               class="quick-action-card glass-card p-5 flex flex-col items-center gap-3 cursor-pointer hover:scale-[1.03] hover:shadow-lg transition-all duration-200 text-center group rounded-2xl">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110"
                   [class]="action.bgClass">
                <i [class]="'pi ' + action.icon + ' ' + action.colorClass"></i>
              </div>
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ action.label }}</span>
            </a>
          }
        </div>
      </div>

      <!-- Main Layout Panels -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left: Properties Occupancy Breakdown -->
        <div class="lg:col-span-1 glass-card p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white">Occupancy Breakdown</h3>
              <i class="pi pi-ellipsis-h text-slate-400 cursor-pointer"></i>
            </div>
            <div class="space-y-6">
              @for (prop of properties(); track prop.name) {
                <div class="space-y-2 cursor-pointer group" (click)="router.navigate(['/owner/properties', prop.id])">
                  <div class="flex items-center justify-between text-sm">
                    <div>
                      <p class="font-semibold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ prop.name }}</p>
                      <p class="text-xs text-slate-400 dark:text-slate-500">{{ prop.location }}</p>
                    </div>
                    <span class="font-bold text-slate-700 dark:text-slate-300">
                      {{ prop.occupiedBeds }}/{{ prop.totalBeds }} Beds
                    </span>
                  </div>
                  <!-- Progress Bar -->
                  <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      [class]="prop.colorClass"
                      [style.width.%]="prop.occupancyRate"
                    ></div>
                  </div>
                  <div class="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>{{ prop.roomsCount }} Rooms</span>
                    <span>{{ prop.occupancyRate }}% Occupied</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <button pButton label="Manage Properties" variant="text" size="small"
            routerLink="/owner/properties"
            class="w-full text-indigo-500 dark:text-indigo-400 mt-6 font-semibold">
          </button>
        </div>

        <!-- Center/Right: Transactions & Maintenance -->
        <div class="lg:col-span-2 space-y-8">

          <!-- Recent Transactions -->
          <div class="glass-card p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
              <button pButton label="View All" variant="text" size="small"
                routerLink="/owner/finance/transactions"
                class="text-indigo-500 dark:text-indigo-400 font-semibold">
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                    <th class="py-3 px-2">Tenant</th>
                    <th class="py-3 px-2">Property</th>
                    <th class="py-3 px-2">Amount</th>
                    <th class="py-3 px-2">Date</th>
                    <th class="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  @for (tx of transactions(); track tx.id) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                        (click)="router.navigate(['/owner/finance/transactions'])">
                      <td class="py-3.5 px-2 font-medium text-slate-800 dark:text-white">
                        <div class="flex items-center gap-2.5">
                          <app-avatar [name]="tx.tenantName" size="sm" />
                          <span>{{ tx.tenantName }}</span>
                        </div>
                      </td>
                      <td class="py-3.5 px-2 text-slate-500 dark:text-slate-400">{{ tx.property }}</td>
                      <td class="py-3.5 px-2 font-semibold text-slate-800 dark:text-white">{{ tx.amount }}</td>
                      <td class="py-3.5 px-2 text-slate-400 dark:text-slate-500">{{ tx.date }}</td>
                      <td class="py-3.5 px-2">
                        <app-status-badge [status]="tx.status" />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Active Maintenance Tickets -->
          <div class="glass-card p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white">Maintenance Tickets</h3>
              <button pButton label="View Tickets" variant="text" size="small"
                routerLink="/owner/maintenance/dashboard"
                class="text-indigo-500 dark:text-indigo-400 font-semibold">
              </button>
            </div>

            <div class="space-y-4">
              @for (task of tickets(); track task.id) {
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30 hover:border-indigo-500/30 transition-all duration-200 gap-4 cursor-pointer"
                     (click)="router.navigate(['/owner/maintenance/tickets', task.id])">
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                         [class]="task.priority === 'High' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'">
                      <i class="pi pi-wrench"></i>
                    </div>
                    <div>
                      <p class="font-semibold text-slate-800 dark:text-white text-sm">{{ task.title }}</p>
                      <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {{ task.property }} • Room {{ task.room }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span class="text-xs text-slate-400 dark:text-slate-500">{{ task.date }}</span>
                    <app-status-badge [status]="task.status" />
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                      [class]="task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
                    >
                      {{ task.priority }} Priority
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
      </div>
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
export class Dashboard {
  router = inject(Router);

  quickActions = signal<QuickAction[]>([
    { label: 'Check-In Tenant', icon: 'pi-user-plus', route: '/owner/tenants/check-in', colorClass: 'text-indigo-600 dark:text-indigo-400', bgClass: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Create Ticket', icon: 'pi-wrench', route: '/owner/maintenance/create', colorClass: 'text-rose-600 dark:text-rose-400', bgClass: 'bg-rose-50 dark:bg-rose-950/30' },
    { label: 'Record Expense', icon: 'pi-wallet', route: '/owner/payments/expenses', colorClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Announcement', icon: 'pi-megaphone', route: '/owner/communication/announcements', colorClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-950/30' },
  ]);

  properties = signal<PropertyOccupancy[]>([
    { id: 'prop-1', name: 'Royal Heights PG', location: 'Sector 62, Noida', totalBeds: 45, occupiedBeds: 41, occupancyRate: 91, roomsCount: 15, colorClass: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
    { id: 'prop-2', name: 'Apex Elite PG', location: 'HSR Layout, Bangalore', totalBeds: 60, occupiedBeds: 54, occupancyRate: 90, roomsCount: 20, colorClass: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
    { id: 'prop-3', name: 'LiveSpace Elite', location: 'DLF Phase 3, Gurgaon', totalBeds: 35, occupiedBeds: 28, occupancyRate: 80, roomsCount: 12, colorClass: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { id: 'prop-4', name: 'Co-Living Nest', location: 'Katraj, Pune', totalBeds: 32, occupiedBeds: 25, occupancyRate: 78, roomsCount: 11, colorClass: 'bg-gradient-to-r from-teal-500 to-emerald-500' }
  ]);

  transactions = signal<DashboardTransaction[]>([
    { id: '1', tenantName: 'Aditya Patel', property: 'Royal Heights PG', amount: '₹14,500', date: 'May 25, 2026', status: 'Paid' },
    { id: '2', tenantName: 'Nikunj Bavishiya', property: 'Royal Heights PG', amount: '₹12,500', date: 'May 24, 2026', status: 'Paid' },
    { id: '3', tenantName: 'Rohan Sharma', property: 'Apex Elite PG', amount: '₹15,000', date: 'May 22, 2026', status: 'Pending' },
    { id: '4', tenantName: 'Priya Nair', property: 'LiveSpace Elite', amount: '₹18,000', date: 'May 20, 2026', status: 'Overdue' }
  ]);

  tickets = signal<MaintenanceTask[]>([
    { id: '1', title: 'Air Conditioner Water Leakage', property: 'Royal Heights PG', room: '204B', priority: 'High', status: 'Open', date: 'May 25, 2026' },
    { id: '2', title: 'Geyser Heating Issue', property: 'Apex Elite PG', room: '102A', priority: 'High', status: 'Open', date: 'May 24, 2026' },
    { id: '3', title: 'WiFi Connectivity Outage', property: 'LiveSpace Elite', room: 'Floor 2 Lobby', priority: 'Medium', status: 'Open', date: 'May 24, 2026' }
  ]);
}
