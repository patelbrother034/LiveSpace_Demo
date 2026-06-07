import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface TicketTimelineEvent {
  status: string;
  notes: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  propertyId: string;
  category: string;
  priority: string;
  title: string;
  description: string;
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  status: string;
  timeline: TicketTimelineEvent[];
  createdAt: string;
  estimatedCost?: number;
  actualCost?: number;
  resolution?: string;
  satisfactionRating?: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatusBadge, Avatar, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-8 animate-fade-in" *ngIf="ticket()">
      <!-- Page Header -->
      <app-page-header [title]="'Ticket #' + ticket()!.id.replace('ticket-', '')" [subtitle]="ticket()!.title">
        <button pButton label="Back to Dashboard" icon="pi pi-arrow-left" (click)="navigateBack()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Details Card -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card p-6 space-y-6">
            <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  {{ ticket()!.category }}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  [class]="ticket()!.priority === 'High' || ticket()!.priority === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : ticket()!.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                  {{ ticket()!.priority }}
                </span>
              </div>
              <app-status-badge [status]="ticket()!.status" />
            </div>

            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p class="text-slate-700 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {{ ticket()!.description }}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reported By</h4>
                <div class="flex items-center gap-2">
                  <app-avatar [name]="ticket()!.reportedByName" size="md" />
                  <div>
                    <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ ticket()!.reportedByName }}</p>
                    <p class="text-xs text-slate-400">Resident / Submitter</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Staff</h4>
                @if (ticket()!.assignedToName) {
                  <div class="flex items-center gap-2">
                    <app-avatar [name]="ticket()!.assignedToName!" size="md" />
                    <div>
                      <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ ticket()!.assignedToName }}</p>
                      <p class="text-xs text-slate-400">Technician</p>
                    </div>
                  </div>
                } @else {
                  <span class="text-slate-400 text-xs italic">Unassigned</span>
                }
              </div>
            </div>

            <!-- Resolution / Feedback Rating Card (if resolved/closed) -->
            @if (ticket()!.status === 'Resolved' || ticket()!.status === 'Closed') {
              <div class="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6 space-y-4">
                <h4 class="text-xs font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
                  <i class="pi pi-verified"></i> Resolution Summary
                </h4>
                @if (ticket()!.resolution) {
                  <p class="text-slate-700 dark:text-slate-300 text-sm">
                    {{ ticket()!.resolution }}
                  </p>
                } @else {
                  <p class="text-slate-400 dark:text-slate-500 text-sm italic">No resolution notes available.</p>
                }
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p class="text-xs text-slate-400 uppercase">Actual Cost</p>
                    <p class="text-sm font-bold text-slate-800 dark:text-white">
                      ₹{{ ticket()!.actualCost ? ticket()!.actualCost : '0' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 uppercase">Satisfaction Rating</p>
                    <div class="flex items-center gap-1 mt-1 text-amber-500">
                      @if (ticket()!.satisfactionRating) {
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <i class="pi" [class]="star <= ticket()!.satisfactionRating! ? 'pi-star-fill' : 'pi-star'"></i>
                        }
                      } @else {
                        <span class="text-xs text-slate-400 italic">No feedback submitted</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Comment Timeline Logger -->
          <div class="glass-card p-6 space-y-4">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Log Update or Add Note</h4>
            <div class="flex flex-col sm:flex-row gap-3">
              <input type="text" pInputText
                placeholder="Type a comment or status update note..."
                class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                [(ngModel)]="newComment" (keyup.enter)="addNoteComment()" />
              <button pButton label="Add Comment" icon="pi pi-send" (click)="addNoteComment()"
                class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90 px-5">
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Timeline & Status Controls -->
        <div class="space-y-6">
          <!-- Quick Status Actions -->
          <div class="glass-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Admin Controls</h3>
            
            <div class="space-y-3">
              <label class="block text-xs font-semibold text-slate-400">Change Status</label>
              <select
                class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                [(ngModel)]="nextStatus" (change)="onStatusSelect()">
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <!-- Staff Assignment (only if Assigned is selected) -->
            @if (nextStatus === 'Assigned') {
              <div class="space-y-3 animate-slide-down">
                <label class="block text-xs font-semibold text-slate-400">Select Caretaker / Tech *</label>
                <select
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                  [(ngModel)]="assignedStaffId">
                  <option value="" disabled>Choose Staff</option>
                  @for (s of staff(); track s.id) {
                    <option [value]="s.id">{{ s.name }} ({{ s.role }})</option>
                  }
                </select>
              </div>
            }

            <!-- Completion Inputs (only if Resolved/Closed is selected) -->
            @if (nextStatus === 'Resolved' || nextStatus === 'Closed') {
              <div class="space-y-3 animate-slide-down">
                <label class="block text-xs font-semibold text-slate-400">Resolution Description *</label>
                <textarea rows="3"
                  placeholder="e.g. Replaced faulty heater coil"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  [(ngModel)]="resolutionNotes"></textarea>

                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-[10px] font-semibold text-slate-400">Actual Cost (₹)</label>
                    <input type="number"
                      placeholder="e.g. 500"
                      class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                      [(ngModel)]="actualCost" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-semibold text-slate-400">Rating (1-5)</label>
                    <select
                      class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer"
                      [(ngModel)]="satisfactionRating">
                      <option value="5">⭐⭐⭐⭐⭐</option>
                      <option value="4">⭐⭐⭐⭐</option>
                      <option value="3">⭐⭐⭐</option>
                      <option value="2">⭐⭐</option>
                      <option value="1">⭐</option>
                    </select>
                  </div>
                </div>
              </div>
            }

            <button pButton label="Save Changes" icon="pi pi-save" (click)="saveStatusChanges()"
              class="w-full p-button-sm rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 mt-2">
            </button>
          </div>

          <!-- Visual Progress Timeline -->
          <div class="glass-card p-6 space-y-6">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white">Activity Log</h3>
            
            <div class="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-6">
              @for (event of ticket()!.timeline; track $index) {
                <div class="relative">
                  <!-- Bullet circle -->
                  <div class="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center"
                    [class]="event.status === 'Resolved' || event.status === 'Closed' ? 'bg-emerald-500' : event.status === 'InProgress' ? 'bg-amber-500' : event.status === 'Assigned' ? 'bg-blue-500' : 'bg-indigo-500'">
                  </div>

                  <!-- Details -->
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {{ event.status }}
                      </span>
                      <span class="text-[10px] text-slate-400">
                        {{ formatTime(event.timestamp) }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{{ event.notes }}</p>
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
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-down {
      animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class TicketDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private crudService = inject(CrudService);

  ticketId = '';
  ticket = signal<Ticket | null>(null);
  staff = signal<Staff[]>([]);

  // Controls
  nextStatus = 'Open';
  assignedStaffId = '';
  resolutionNotes = '';
  actualCost: number | null = null;
  satisfactionRating = 5;
  newComment = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.ticketId = id;
        this.loadTicket();
      }
    });

    const staffMembers = this.crudService.getAll<Staff>(StorageKeys.STAFF);
    this.staff.set(staffMembers);
  }

  loadTicket() {
    const list = this.crudService.getAll<Ticket>(StorageKeys.TICKETS);
    const found = list.find(t => t.id === this.ticketId);
    
    if (found) {
      this.ticket.set(found);
      this.nextStatus = found.status;
      this.assignedStaffId = found.assignedTo || '';
      this.resolutionNotes = found.resolution || '';
      this.actualCost = found.actualCost !== undefined ? found.actualCost : null;
      this.satisfactionRating = found.satisfactionRating || 5;
    } else {
      // Fallback fallback mock if not found
      this.router.navigate(['/owner/maintenance/dashboard']);
    }
  }

  onStatusSelect() {
    // Proactively reset assignee or ratings if switching to statuses that don't need them
  }

  saveStatusChanges() {
    if (!this.ticket()) return;

    const currentTicket = { ...this.ticket()! };
    let statusNotes = `Status updated to ${this.nextStatus}`;

    // Specific logic per status
    if (this.nextStatus === 'Assigned') {
      if (!this.assignedStaffId) {
        alert('Please select a technician/caretaker for assignment');
        return;
      }
      const staffMember = this.staff().find(s => s.id === this.assignedStaffId);
      currentTicket.assignedTo = this.assignedStaffId;
      currentTicket.assignedToName = staffMember ? staffMember.name : 'Caretaker';
      statusNotes = `Assigned to ${currentTicket.assignedToName}`;
    }

    if (this.nextStatus === 'Resolved' || this.nextStatus === 'Closed') {
      currentTicket.resolution = this.resolutionNotes;
      if (this.actualCost !== null) {
        currentTicket.actualCost = this.actualCost;
      }
      currentTicket.satisfactionRating = Number(this.satisfactionRating);
      statusNotes = `${this.nextStatus}: ${this.resolutionNotes || 'Problem fully fixed by technician'}`;
    }

    currentTicket.status = this.nextStatus;
    currentTicket.timeline.push({
      status: this.nextStatus,
      notes: statusNotes,
      timestamp: new Date().toISOString()
    });

    // Update LocalStorage
    const all = this.crudService.getAll<Ticket>(StorageKeys.TICKETS);
    const idx = all.findIndex(t => t.id === this.ticketId);
    if (idx !== -1) {
      all[idx] = currentTicket;
      localStorage.setItem(StorageKeys.TICKETS, JSON.stringify(all));
      this.ticket.set(currentTicket);
      alert('Ticket updated successfully!');
    }
  }

  addNoteComment() {
    if (!this.newComment.trim() || !this.ticket()) return;

    const currentTicket = { ...this.ticket()! };
    currentTicket.timeline.push({
      status: currentTicket.status,
      notes: this.newComment.trim(),
      timestamp: new Date().toISOString()
    });

    // Update Storage
    const all = this.crudService.getAll<Ticket>(StorageKeys.TICKETS);
    const idx = all.findIndex(t => t.id === this.ticketId);
    if (idx !== -1) {
      all[idx] = currentTicket;
      localStorage.setItem(StorageKeys.TICKETS, JSON.stringify(all));
      this.ticket.set(currentTicket);
      this.newComment = '';
    }
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  navigateBack() {
    this.router.navigate(['/owner/maintenance/dashboard']);
  }
}
