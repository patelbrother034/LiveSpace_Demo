import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface MaintenanceTicket {
  id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  location: string;
  reportedBy: string;
  reportedByName: string;
  assignedToName?: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-maintenance-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeader, StatCard, StatusBadge, Avatar,
    ButtonModule, InputTextModule, TableModule, TagModule, TooltipModule
  ],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Maintenance Dashboard" subtitle="Manage and assign maintenance issues across all properties">
        <button pButton label="Raise Ticket" icon="pi pi-plus" (click)="navigateToCreate()"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90">
        </button>
        <button pButton label="Assignment Board" icon="pi pi-sliders-h" (click)="navigateToAssignments()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Total Tickets" [value]="tickets().length + ' Tickets'" icon="pi-ticket" color="primary" />
        <app-stat-card label="Open Requests" [value]="openCount() + ' Open'" icon="pi-exclamation-circle" color="danger" />
        <app-stat-card label="In Progress" [value]="inProgressCount() + ' Active'" icon="pi-spin pi-spinner" color="warning" />
        <app-stat-card label="Resolved Tasks" [value]="resolvedCount() + ' Done'" icon="pi-check-circle" color="success" />
      </div>

      <!-- Filters & Search -->
      <div class="glass-card p-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search input -->
          <div class="relative md:col-span-2">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm z-10"></i>
            <input type="text" pInputText
              placeholder="Search by title, location, resident..."
              class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)" />
          </div>

          <!-- Category Filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [ngModel]="selectedCategory()"
              (ngModelChange)="selectedCategory.set($event)">
              <option value="All">All Categories</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Furniture">Furniture</option>
              <option value="Cleaning">Cleaning</option>
              <option value="AC/Heating">AC/Heating</option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [ngModel]="selectedPriority()"
              (ngModelChange)="selectedPriority.set($event)">
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tickets Table List -->
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                <th class="py-4 px-5">Ticket ID</th>
                <th class="py-4 px-4">Issue Details</th>
                <th class="py-4 px-4">Category</th>
                <th class="py-4 px-4">Assigned Staff</th>
                <th class="py-4 px-4 text-center">Priority</th>
                <th class="py-4 px-4 text-center">Status</th>
                <th class="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
              @for (ticket of filteredTickets(); track ticket.id) {
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    (click)="navigateToDetail(ticket.id)">
                  <!-- Ticket ID -->
                  <td class="py-4 px-5 font-bold text-indigo-500 text-sm">
                    #{{ ticket.id.replace('ticket-', '') }}
                  </td>

                  <!-- Details -->
                  <td class="py-4 px-4">
                    <p class="font-semibold text-slate-800 dark:text-white text-sm">{{ ticket.title }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {{ ticket.location }} • Reported by {{ ticket.reportedByName }}
                    </p>
                  </td>

                  <!-- Category -->
                  <td class="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {{ ticket.category }}
                    </span>
                  </td>

                  <!-- Assigned Staff -->
                  <td class="py-4 px-4 text-sm text-slate-600 dark:text-slate-300">
                    @if (ticket.assignedToName) {
                      <div class="flex items-center gap-2">
                        <app-avatar [name]="ticket.assignedToName" size="sm" />
                        <span>{{ ticket.assignedToName }}</span>
                      </div>
                    } @else {
                      <span class="text-slate-400 text-xs italic">Unassigned</span>
                    }
                  </td>

                  <!-- Priority Badge -->
                  <td class="py-4 px-4 text-center">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                      [class]="ticket.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                      {{ ticket.priority }}
                    </span>
                  </td>

                  <!-- Status badge -->
                  <td class="py-4 px-4 text-center">
                    <app-status-badge [status]="ticket.status" />
                  </td>

                  <!-- Actions -->
                  <td class="py-4 px-4 text-center" (click)="$event.stopPropagation()">
                    <button pButton icon="pi pi-eye" class="p-button-sm p-button-text p-button-rounded text-slate-500"
                      pTooltip="View Timeline" tooltipPosition="top" (click)="navigateToDetail(ticket.id)">
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No tickets found matching the filters.
                  </td>
                </tr>
              }
            </tbody>
          </table>
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
export class MaintenanceDashboard {
  private router = inject(Router);
  private crudService = inject(CrudService);

  searchQuery = signal('');
  selectedCategory = signal('All');
  selectedPriority = signal('All');

  tickets = signal<MaintenanceTicket[]>([]);

  constructor() {
    this.loadTickets();
  }

  loadTickets() {
    const list = this.crudService.getAll<MaintenanceTicket>(StorageKeys.TICKETS);
    if (list.length === 0) {
      const defaultTickets = [
        { id: 'ticket-101', category: 'Plumbing', priority: 'High', title: 'Bathroom Tap Leakage in Room A-102', description: 'The bathroom tap is leaking continuously.', location: 'Royal Heights PG • Room 102', reportedBy: 'tenant-002', reportedByName: 'Rohan Sharma', assignedToName: 'Suresh Caretaker', status: 'InProgress', createdAt: '2026-05-24' },
        { id: 'ticket-102', category: 'Electrical', priority: 'Medium', title: 'Study Lamp Switch Broken', description: 'The switch for the study lamp is broken.', location: 'Royal Heights PG • Room 102', reportedBy: 'tenant-003', reportedByName: 'Vikram Mehta', status: 'Open', createdAt: '2026-05-25' },
        { id: 'ticket-103', category: 'AC/Heating', priority: 'High', title: 'AC Not Cooling', description: 'AC unit displays error code E4.', location: 'Royal Heights PG • Room 101', reportedBy: 'tenant-001', reportedByName: 'Aditya Patel', status: 'Open', createdAt: '2026-05-26' },
        { id: 'ticket-104', category: 'Furniture', priority: 'Low', title: 'Wardrobe Door Lock Loose', description: 'Lock on wardrobe door is loose.', location: 'Royal Heights PG • Room 104', reportedBy: 'tenant-006', reportedByName: 'Suresh Nair', assignedToName: 'Suresh Caretaker', status: 'Resolved', createdAt: '2026-05-20' },
        { id: 'ticket-105', category: 'Plumbing', priority: 'Medium', title: 'Drain Blockage in Bathroom', description: 'Water drain is clogged.', location: 'Apex Elite PG • Room W1-102', reportedBy: 'tenant-012', reportedByName: 'Pooja Hegde', status: 'Open', createdAt: '2026-05-27' }
      ];
      localStorage.setItem(StorageKeys.TICKETS, JSON.stringify(defaultTickets));
      this.tickets.set(defaultTickets);
    } else {
      this.tickets.set(list);
    }
  }

  openCount = computed(() => this.tickets().filter(t => t.status === 'Open').length);
  inProgressCount = computed(() => this.tickets().filter(t => t.status === 'InProgress').length);
  resolvedCount = computed(() => this.tickets().filter(t => t.status === 'Resolved' || t.status === 'Closed').length);

  filteredTickets = computed(() => {
    let list = this.tickets();
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const prio = this.selectedPriority();

    if (query) {
      list = list.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.location.toLowerCase().includes(query) ||
        t.reportedByName.toLowerCase().includes(query)
      );
    }

    if (cat !== 'All') {
      list = list.filter(t => t.category === cat);
    }

    if (prio !== 'All') {
      list = list.filter(t => t.priority === prio);
    }

    return list;
  });

  navigateToCreate() {
    this.router.navigate(['/owner/maintenance/create']);
  }

  navigateToAssignments() {
    this.router.navigate(['/owner/maintenance/assignments']);
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/owner/maintenance/tickets', id]);
  }
}
