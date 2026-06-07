import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface KanbanTicket {
  id: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  location: string;
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  status: string;
  createdAt: string;
  timeline?: any[];
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-assignment-board',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, Avatar, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Technician Assignment Board" subtitle="Drag and drop maintenance tickets to delegate tasks and track progress">
        <button pButton label="Back to List View" icon="pi pi-list" (click)="navigateToDashboard()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <!-- Kanban Columns Container -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start h-[calc(100vh-220px)] min-h-[500px]">
        
        <!-- COLUMN: NEW / OPEN -->
        <div class="glass-card flex flex-col max-h-full h-full p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl"
             (dragover)="allowDrop($event)" (drop)="onDrop($event, 'Open')">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">New Requests</h3>
            </div>
            <span class="px-2 py-0.5 text-xs font-bold rounded-lg bg-indigo-500/10 text-indigo-500">{{ openTickets().length }}</span>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            @for (ticket of openTickets(); track ticket.id) {
              <div class="kanban-card border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4 rounded-xl shadow-sm cursor-grab hover:scale-[1.01] hover:shadow-md hover:border-indigo-500/20 active:cursor-grabbing transition-all"
                   draggable="true" (dragstart)="onDragStart($event, ticket.id)" (click)="navigateToDetail(ticket.id)">
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {{ ticket.category }}
                  </span>
                  <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase"
                    [class]="ticket.priority === 'High' || ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                    {{ ticket.priority }}
                  </span>
                </div>
                
                <h4 class="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug">{{ ticket.title }}</h4>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <i class="pi pi-map-marker text-[9px]"></i> {{ ticket.location }}
                </p>

                <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <span class="text-[10px] text-slate-400">Reported {{ getRelativeTime(ticket.createdAt) }}</span>
                  <span class="text-[10px] font-bold text-indigo-500">#{{ ticket.id.replace('ticket-', '') }}</span>
                </div>
              </div>
            } @empty {
              <div class="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
                No new requests
              </div>
            }
          </div>
        </div>

        <!-- COLUMN: ASSIGNED -->
        <div class="glass-card flex flex-col max-h-full h-full p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl"
             (dragover)="allowDrop($event)" (drop)="onDrop($event, 'Assigned')">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Assigned</h3>
            </div>
            <span class="px-2 py-0.5 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-500">{{ assignedTickets().length }}</span>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            @for (ticket of assignedTickets(); track ticket.id) {
              <div class="kanban-card border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4 rounded-xl shadow-sm cursor-grab hover:scale-[1.01] hover:shadow-md hover:border-blue-500/20 active:cursor-grabbing transition-all"
                   draggable="true" (dragstart)="onDragStart($event, ticket.id)" (click)="navigateToDetail(ticket.id)">
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {{ ticket.category }}
                  </span>
                  <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase"
                    [class]="ticket.priority === 'High' || ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                    {{ ticket.priority }}
                  </span>
                </div>
                
                <h4 class="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug">{{ ticket.title }}</h4>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <i class="pi pi-map-marker text-[9px]"></i> {{ ticket.location }}
                </p>

                <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <div class="flex items-center gap-1.5">
                    <app-avatar [name]="ticket.assignedToName || 'Technician'" size="sm" />
                    <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400">{{ ticket.assignedToName }}</span>
                  </div>
                  <span class="text-[10px] font-bold text-blue-500">#{{ ticket.id.replace('ticket-', '') }}</span>
                </div>
              </div>
            } @empty {
              <div class="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
                Drag ticket here to assign
              </div>
            }
          </div>
        </div>

        <!-- COLUMN: IN PROGRESS -->
        <div class="glass-card flex flex-col max-h-full h-full p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl"
             (dragover)="allowDrop($event)" (drop)="onDrop($event, 'InProgress')">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-spin"></span>
              <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">In Progress</h3>
            </div>
            <span class="px-2 py-0.5 text-xs font-bold rounded-lg bg-amber-500/10 text-amber-500">{{ inProgressTickets().length }}</span>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            @for (ticket of inProgressTickets(); track ticket.id) {
              <div class="kanban-card border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4 rounded-xl shadow-sm cursor-grab hover:scale-[1.01] hover:shadow-md hover:border-amber-500/20 active:cursor-grabbing transition-all"
                   draggable="true" (dragstart)="onDragStart($event, ticket.id)" (click)="navigateToDetail(ticket.id)">
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {{ ticket.category }}
                  </span>
                  <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase"
                    [class]="ticket.priority === 'High' || ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                    {{ ticket.priority }}
                  </span>
                </div>
                
                <h4 class="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug">{{ ticket.title }}</h4>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <i class="pi pi-map-marker text-[9px]"></i> {{ ticket.location }}
                </p>

                <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <div class="flex items-center gap-1.5">
                    <app-avatar [name]="ticket.assignedToName || 'Technician'" size="sm" />
                    <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400">{{ ticket.assignedToName }}</span>
                  </div>
                  <span class="text-[10px] font-bold text-amber-500">#{{ ticket.id.replace('ticket-', '') }}</span>
                </div>
              </div>
            } @empty {
              <div class="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
                Drag ticket here to activate work
              </div>
            }
          </div>
        </div>

        <!-- COLUMN: RESOLVED -->
        <div class="glass-card flex flex-col max-h-full h-full p-4 bg-slate-50/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl"
             (dragover)="allowDrop($event)" (drop)="onDrop($event, 'Resolved')">
          <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Resolved</h3>
            </div>
            <span class="px-2 py-0.5 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-500">{{ resolvedTickets().length }}</span>
          </div>

          <div class="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            @for (ticket of resolvedTickets(); track ticket.id) {
              <div class="kanban-card border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 p-4 rounded-xl shadow-sm hover:scale-[1.01] hover:shadow-md hover:border-emerald-500/20 active:cursor-grabbing transition-all cursor-pointer"
                   (click)="navigateToDetail(ticket.id)">
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {{ ticket.category }}
                  </span>
                  <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase"
                    [class]="ticket.priority === 'High' || ticket.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : ticket.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                    {{ ticket.priority }}
                  </span>
                </div>
                
                <h4 class="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug">{{ ticket.title }}</h4>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <i class="pi pi-map-marker text-[9px]"></i> {{ ticket.location }}
                </p>

                <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <div class="flex items-center gap-1.5">
                    <app-avatar [name]="ticket.assignedToName || 'Technician'" size="sm" />
                    <span class="text-[10px] font-medium text-slate-500 dark:text-slate-400">{{ ticket.assignedToName }}</span>
                  </div>
                  <span class="text-[10px] font-bold text-emerald-500">#{{ ticket.id.replace('ticket-', '') }}</span>
                </div>
              </div>
            } @empty {
              <div class="h-32 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
                Drag ticket here to resolve
              </div>
            }
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
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 99px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #334155;
    }
  `]
})
export class AssignmentBoard implements OnInit {
  private router = inject(Router);
  private crudService = inject(CrudService);

  tickets = signal<KanbanTicket[]>([]);
  staff = signal<Staff[]>([]);

  // computed lists
  openTickets = computed(() => this.tickets().filter(t => t.status === 'Open'));
  assignedTickets = computed(() => this.tickets().filter(t => t.status === 'Assigned'));
  inProgressTickets = computed(() => this.tickets().filter(t => t.status === 'InProgress'));
  resolvedTickets = computed(() => this.tickets().filter(t => t.status === 'Resolved' || t.status === 'Closed'));

  ngOnInit() {
    this.loadTickets();
    const staffMembers = this.crudService.getAll<Staff>(StorageKeys.STAFF);
    this.staff.set(staffMembers);
  }

  loadTickets() {
    const list = this.crudService.getAll<KanbanTicket>(StorageKeys.TICKETS);
    this.tickets.set(list);
  }

  navigateToDashboard() {
    this.router.navigate(['/owner/maintenance/dashboard']);
  }

  navigateToDetail(id: string) {
    this.router.navigate(['/owner/maintenance/tickets', id]);
  }

  getRelativeTime(dateStr: string): string {
    if (!dateStr) return 'just now';
    const parsed = new Date(dateStr);
    const diffMs = new Date().getTime() - parsed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours <= 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'just now' : `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    }
    return diffDays === 1 ? 'yesterday' : `${diffDays}d ago`;
  }

  // HTML5 Drag and Drop events
  onDragStart(event: DragEvent, id: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, targetStatus: string) {
    event.preventDefault();
    if (!event.dataTransfer) return;
    
    const id = event.dataTransfer.getData('text/plain');
    if (!id) return;

    const all = this.crudService.getAll<KanbanTicket>(StorageKeys.TICKETS);
    const idx = all.findIndex(t => t.id === id);

    if (idx !== -1) {
      const ticket = { ...all[idx] };
      const previousStatus = ticket.status;

      if (previousStatus === targetStatus) return;

      // Transition logical effects
      ticket.status = targetStatus;
      
      const timelineEvent = {
        status: targetStatus,
        notes: `Ticket dragged to ${targetStatus} lane`,
        timestamp: new Date().toISOString()
      };

      if (targetStatus === 'Assigned' && !ticket.assignedTo) {
        // Automatically assign default Caretaker if none assigned
        const defaultStaff = this.staff().find(s => s.role === 'Caretaker') || this.staff()[0];
        if (defaultStaff) {
          ticket.assignedTo = defaultStaff.id;
          ticket.assignedToName = defaultStaff.name;
          timelineEvent.notes = `Assigned automatically to caretaker ${defaultStaff.name}`;
        }
      }

      // Initialize timeline if not present
      if (!ticket.timeline) {
        ticket.timeline = [];
      }
      (ticket as any).timeline.push(timelineEvent);

      // Save and update signal
      all[idx] = ticket;
      localStorage.setItem(StorageKeys.TICKETS, JSON.stringify(all));
      this.tickets.set(all);
    }
  }
}
