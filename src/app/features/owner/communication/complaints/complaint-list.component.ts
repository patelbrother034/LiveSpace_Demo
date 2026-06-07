import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface ComplaintComment {
  senderRole: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface ParentComplaint {
  id: string;
  parentId: string;
  parentName: string;
  category: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  comments: ComplaintComment[];
  assignedTo?: string;
  assignedToName?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

interface TenantResident {
  id: string;
  fullName: string;
  roomId: string;
}

@Component({
  selector: 'app-complaint-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatCard, StatusBadge, Avatar, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Safety & Complaints Desk" subtitle="Monitor and respond directly to concerns filed by parents and residents regarding security, hygiene, and food quality">
      </app-page-header>

      <!-- KPI stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <app-stat-card label="Total Concerns" [value]="complaints().length + ' Filed'" icon="pi-inbox" color="primary" />
        <app-stat-card label="Active Concerns" [value]="activeCount() + ' Open'" icon="pi-exclamation-circle" color="danger" />
        <app-stat-card label="Fulfillment Rate" [value]="fulfillmentRate() + '%'" icon="pi-check-circle" color="success" />
      </div>

      <!-- Complaints desk list -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Table Listing -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card p-6 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Filed Concerns Log</h3>
              
              <!-- Filter status -->
              <select [(ngModel)]="statusFilter" class="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 cursor-pointer">
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <!-- Grid table list -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th class="py-3 px-4">Concern</th>
                    <th class="py-3 px-4">Category</th>
                    <th class="py-3 px-4">Reported By</th>
                    <th class="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  @for (c of filteredComplaints(); track c.id) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                        [class.bg-indigo-500/5]="selectedComplaint()?.id === c.id"
                        (click)="selectComplaint(c)">
                      <td class="py-3.5 px-4">
                        <p class="font-bold text-slate-800 dark:text-white max-w-[200px] truncate">{{ c.title }}</p>
                        <p class="text-[10px] text-slate-400 mt-0.5 font-mono">ID: #{{ c.id.replace('comp-', '') }} • {{ formatDate(c.createdAt) }}</p>
                      </td>
                      <td class="py-3.5 px-4">
                        <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {{ c.category }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {{ c.parentName }} (Parent)
                      </td>
                      <td class="py-3.5 px-4 text-center">
                        <app-status-badge [status]="c.status" />
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="py-8 text-center text-slate-400 italic">No safety concerns logged.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- RIGHT: Interactive Response Thread & Assignment drawer -->
        <div class="lg:col-span-1">
          <div class="glass-card p-6 flex flex-col h-[550px]">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Landlord Desk Actions
            </h3>

            @if (selectedComplaint()) {
              <div class="flex-1 flex flex-col justify-between overflow-hidden space-y-4">
                
                <!-- Submitter details & status controls -->
                <div class="space-y-3 shrink-0 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-red-500">Concern #{{ selectedComplaint()!.id.replace('comp-', '') }}</span>
                    
                    <!-- Direct status toggle selector -->
                    <select [ngModel]="selectedComplaint()!.status" 
                            (ngModelChange)="updateStatus($event)"
                            class="text-[10px] font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-2.5 py-0.5 cursor-pointer">
                      <option value="Open">Open</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <!-- Caretaker assignment -->
                  <div class="flex items-center justify-between gap-4 text-xs">
                    <span class="text-slate-400">Assign Staff:</span>
                    <select [ngModel]="selectedComplaint()!.assignedTo || ''" 
                            (ngModelChange)="assignStaff($event)"
                            class="text-[10px] font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-2 py-0.5 cursor-pointer">
                      <option value="">Leave Unassigned</option>
                      @for (s of staff(); track s.id) {
                        <option [value]="s.id">{{ s.name }} ({{ s.role }})</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- Chat history bubbles -->
                <div class="flex-1 overflow-y-auto space-y-3 pr-1 py-1 custom-scrollbar">
                  <!-- Original comment bubble -->
                  <div class="flex items-start gap-2 max-w-[85%]">
                    <app-avatar [name]="selectedComplaint()!.parentName" size="sm" />
                    <div class="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl rounded-tl-none p-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <p class="font-bold text-[9px] text-slate-400">Original Parent Complaint Description</p>
                      <p class="mt-0.5">{{ selectedComplaint()!.description }}</p>
                    </div>
                  </div>

                  @for (c of selectedComplaint()!.comments; track $index) {
                    <div class="flex items-start gap-2 max-w-[85%]" [class.ml-auto]="c.senderRole === 'Owner'" [class.flex-row-reverse]="c.senderRole === 'Owner'">
                      <app-avatar [name]="c.senderName" size="sm" />
                      <div class="p-3 rounded-2xl text-xs leading-relaxed"
                           [class]="c.senderRole === 'Owner' ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'">
                        <p class="text-[9px] font-bold" [class]="c.senderRole === 'Owner' ? 'text-indigo-200' : 'text-slate-400'">{{ c.senderName }} ({{ c.senderRole }})</p>
                        <p class="mt-0.5">{{ c.text }}</p>
                      </div>
                    </div>
                  }
                </div>

                <!-- Chat input -->
                <div class="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <input type="text" pInputText placeholder="Reply to parent..."
                    class="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60"
                    [(ngModel)]="landlordReply" (keyup.enter)="sendLandlordReply()" />
                  <button pButton label="Reply" icon="pi pi-send" (click)="sendLandlordReply()"
                    class="p-button-sm rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 px-3 py-2 font-bold shadow-md shadow-indigo-500/20"></button>
                </div>
              </div>
            } @else {
              <div class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <i class="pi pi-comments text-3xl mb-3 text-slate-300"></i>
                <p class="text-xs italic leading-relaxed">Select a concern notice from the left desk to review details, assign emergency caretakers, and reply directly to parents.</p>
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
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 99px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #334155;
    }
  `]
})
export class ComplaintListComponent implements OnInit {
  private crudService = inject(CrudService);

  complaints = signal<ParentComplaint[]>([]);
  staff = signal<StaffMember[]>([]);

  selectedComplaint = signal<ParentComplaint | null>(null);
  statusFilter = signal('All');
  landlordReply = '';

  // computed KPIs
  activeCount = computed(() => this.complaints().filter(c => c.status === 'Open' || c.status === 'InProgress').length);
  fulfillmentRate = computed(() => {
    if (this.complaints().length === 0) return 100;
    const resolved = this.complaints().filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    return Math.round((resolved / this.complaints().length) * 100);
  });

  filteredComplaints = computed(() => {
    let list = this.complaints();
    const filter = this.statusFilter();
    if (filter !== 'All') {
      list = list.filter(c => c.status === filter);
    }
    return list;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const list = this.crudService.getAll<ParentComplaint>('lsp_complaints');
    this.complaints.set(list);

    const staffMembers = this.crudService.getAll<StaffMember>(StorageKeys.STAFF);
    this.staff.set(staffMembers);
  }

  selectComplaint(comp: ParentComplaint) {
    this.selectedComplaint.set(comp);
  }

  updateStatus(newStatus: string) {
    if (!this.selectedComplaint()) return;
    const target = { ...this.selectedComplaint()! };
    target.status = newStatus;

    if (!target.comments) {
      target.comments = [];
    }
    target.comments.push({
      senderRole: 'Owner',
      senderName: 'Nikunj Owner',
      text: `Administrative action: Concern status marked as ${newStatus}`,
      timestamp: new Date().toISOString()
    });

    const all = this.crudService.getAll<ParentComplaint>('lsp_complaints');
    const idx = all.findIndex(c => c.id === target.id);
    if (idx !== -1) {
      all[idx] = target;
      localStorage.setItem('lsp_complaints', JSON.stringify(all));
      this.selectedComplaint.set(target);
      this.loadData();
    }
  }

  assignStaff(staffId: string) {
    if (!this.selectedComplaint()) return;
    const target = { ...this.selectedComplaint()! };
    const member = this.staff().find(s => s.id === staffId);

    target.assignedTo = staffId;
    target.assignedToName = member ? member.name : '';

    if (!target.comments) {
      target.comments = [];
    }
    target.comments.push({
      senderRole: 'Owner',
      senderName: 'Nikunj Owner',
      text: member ? `Administrative action: Assigned concern resolution to Caretaker ${member.name}` : `Administrative action: Removed caretaker allocation`,
      timestamp: new Date().toISOString()
    });

    const all = this.crudService.getAll<ParentComplaint>('lsp_complaints');
    const idx = all.findIndex(c => c.id === target.id);
    if (idx !== -1) {
      all[idx] = target;
      localStorage.setItem('lsp_complaints', JSON.stringify(all));
      this.selectedComplaint.set(target);
      this.loadData();
    }
  }

  sendLandlordReply() {
    if (!this.landlordReply.trim() || !this.selectedComplaint()) return;

    const target = { ...this.selectedComplaint()! };
    if (!target.comments) {
      target.comments = [];
    }
    target.comments.push({
      senderRole: 'Owner',
      senderName: 'Nikunj Owner',
      text: this.landlordReply.trim(),
      timestamp: new Date().toISOString()
    });

    const all = this.crudService.getAll<ParentComplaint>('lsp_complaints');
    const idx = all.findIndex(c => c.id === target.id);
    if (idx !== -1) {
      all[idx] = target;
      localStorage.setItem('lsp_complaints', JSON.stringify(all));
      this.selectedComplaint.set(target);
      this.loadData();
      this.landlordReply = '';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}
