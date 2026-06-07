import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-tenant-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatusBadge, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="My Tickets" subtitle="Raise and track maintenance requests">
        <button pButton label="Raise Ticket" icon="pi pi-plus" (click)="showModal.set(true)"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90"></button>
      </app-page-header>

      <!-- Filter -->
      <div class="flex items-center gap-3 flex-wrap">
        @for (status of filterOptions; track status) {
          <button (click)="activeFilter.set(status)"
            class="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border"
            [class]="activeFilter() === status
              ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
              : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'">
            {{ status }}
          </button>
        }
      </div>

      <!-- Tickets List -->
      @if (filteredTickets().length === 0) {
        <div class="glass-card p-12 text-center">
          <i class="pi pi-ticket text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
          <p class="text-sm text-slate-400">No tickets found</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (ticket of filteredTickets(); track ticket.id) {
            <div class="glass-card p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-200">
              <div class="flex items-start justify-between gap-3 mb-3">
                <h4 class="text-sm font-bold text-slate-800 dark:text-white flex-1">{{ ticket.title }}</h4>
                <app-status-badge [status]="ticket.status" />
              </div>
              @if (ticket.description) {
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{{ ticket.description }}</p>
              }
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    [class]="getCategoryClass(ticket.category)">{{ ticket.category }}</span>
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    [class]="getPriorityClass(ticket.priority)">{{ ticket.priority }}</span>
                </div>
                <span class="text-[11px] text-slate-400">{{ ticket.createdAt }}</span>
              </div>
            </div>
          }
        </div>
      }

      <!-- Raise Ticket Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end animate-fade-in" (click)="showModal.set(false)">
          <div class="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-y-auto slide-in-right" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-slate-800 dark:text-white">Raise a Ticket</h3>
              <button pButton icon="pi pi-times" (click)="showModal.set(false)"
                class="p-button-text p-button-rounded p-button-secondary"></button>
            </div>

            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                <input type="text" [(ngModel)]="newTicket.title" placeholder="Brief description of the issue"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                <textarea [(ngModel)]="newTicket.description" rows="4" placeholder="Detailed description..."
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
                <select [(ngModel)]="newTicket.priority"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                <select [(ngModel)]="newTicket.category"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Furniture">Furniture</option>
                  <option value="WiFi">WiFi</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button pButton label="Submit Ticket" icon="pi pi-check" (click)="submitTicket()"
                class="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90 mt-4"></button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    .slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class TenantTicketsComponent implements OnInit {
  private crudService = inject(CrudService);

  allTickets = signal<any[]>([]);
  showModal = signal(false);
  activeFilter = signal('All');
  filterOptions = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  tenantId = '';
  propertyId = '';

  newTicket = { title: '', description: '', priority: 'Medium', category: 'Plumbing' };

  filteredTickets = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'All') return this.allTickets();
    return this.allTickets().filter(t => t.status === filter);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const me = tenants.find((t: any) => t.status === 'Active') || tenants[0];
    if (!me) return;

    this.tenantId = me.id;
    this.propertyId = me.propertyId;

    const tickets = this.crudService.getAll<any>(StorageKeys.TICKETS)
      .filter((t: any) => t.tenantId === me.id)
      .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    this.allTickets.set(tickets);
  }

  submitTicket() {
    if (!this.newTicket.title.trim()) {
      alert('Please enter a title');
      return;
    }

    const ticket = {
      id: 'tkt-' + Date.now(),
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      title: this.newTicket.title,
      description: this.newTicket.description,
      priority: this.newTicket.priority,
      category: this.newTicket.category,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.crudService.create(StorageKeys.TICKETS, ticket as any);
    this.newTicket = { title: '', description: '', priority: 'Medium', category: 'Plumbing' };
    this.showModal.set(false);
    this.loadData();
  }

  getPriorityClass(priority: string): string {
    const map: Record<string, string> = {
      'High': 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
      'Medium': 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
      'Low': 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
    };
    return map[priority] || map['Low'];
  }

  getCategoryClass(category: string): string {
    return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400';
  }
}
