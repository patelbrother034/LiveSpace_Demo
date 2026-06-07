import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface ParentUser {
  id: string;
  fullName: string;
}

interface ComplaintComment {
  senderRole: string;
  senderName: string;
  text: string;
  timestamp: string;
}

interface IParentComplaint {
  id: string;
  parentId: string;
  parentName: string;
  category: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  comments: ComplaintComment[];
}

@Component({
  selector: 'app-parent-complaint',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatusBadge, Avatar, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in" *ngIf="parentUser()">
      <!-- Page Header -->
      <app-page-header title="Safety & Complaints Center" subtitle="File new issues or chat directly with the Warden and Landlord regarding safety, food, or hygiene concerns">
        <button pButton label="Back to Dashboard" icon="pi pi-arrow-left" (click)="navigateBack()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- LEFT: File New Complaint Form -->
        <div class="lg:col-span-1">
          <div class="glass-card p-6 space-y-6 relative overflow-hidden">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3">
              File New Complaint
            </h3>

            <form (ngSubmit)="submitComplaint()" class="space-y-4">
              <!-- Category dropdown -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concern Category *</label>
                <select required [(ngModel)]="newForm.category" name="category" class="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                  <option value="Food">Food / Mess Quality</option>
                  <option value="Hygiene">Hygiene & Cleanliness</option>
                  <option value="Security">Security & Safety</option>
                  <option value="Roommates">Roommate Concerns</option>
                  <option value="Staff">Staff Behavior</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <!-- Title -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brief Title *</label>
                <input type="text" pInputText required [(ngModel)]="newForm.title" name="title"
                  placeholder="e.g. WiFi connection down on 2nd Floor" class="w-full text-xs" />
              </div>

              <!-- Description -->
              <div class="space-y-1.5">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description *</label>
                <textarea required rows="4" [(ngModel)]="newForm.description" name="description"
                  placeholder="Explain your concern with dates, symptoms, roommates context..."
                  class="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"></textarea>
              </div>

              <button type="submit" pButton label="File Complaint" icon="pi pi-send"
                class="w-full p-button-sm rounded-xl bg-gradient-to-r from-red-500 to-rose-600 border-none text-white hover:opacity-90 py-2.5 font-bold shadow-md shadow-red-500/20">
              </button>
            </form>
          </div>
        </div>

        <!-- RIGHT: Tracking list & chat thread -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Filed Safety Concerns & Complaints
            </h3>

            <!-- Complaints Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th class="py-3 px-4">Concern ID</th>
                    <th class="py-3 px-4">Details</th>
                    <th class="py-3 px-4 text-center">Status</th>
                    <th class="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  @for (comp of complaints(); track comp.id) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                        (click)="selectComplaint(comp)">
                      <td class="py-3 px-4 font-bold text-red-500 text-xs">#{{ comp.id.replace('comp-', '') }}</td>
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-2">
                          <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {{ comp.category }}
                          </span>
                          <span class="font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{{ comp.title }}</span>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-0.5">Filed: {{ formatDate(comp.createdAt) }}</p>
                      </td>
                      <td class="py-3 px-4 text-center">
                        <app-status-badge [status]="comp.status" />
                      </td>
                      <td class="py-3 px-4 text-center">
                        <button pButton label="Chat" icon="pi pi-comments" class="p-button-sm p-button-text p-button-rounded text-indigo-500 p-1"></button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="py-8 text-center text-slate-400 italic">No concerns filed. Your child's stay is fully safe!</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- DIRECT INTERACTIVE CHAT PANEL (displays if a complaint is selected) -->
          @if (selectedComplaint()) {
            <div class="glass-card p-6 space-y-4 animate-slide-down flex flex-col h-[400px]">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 shrink-0">
                <div class="space-y-0.5">
                  <span class="text-[10px] font-bold text-indigo-500">Complaint #{{ selectedComplaint()!.id.replace('comp-', '') }}</span>
                  <h4 class="text-sm font-bold text-slate-800 dark:text-white">Chat thread: {{ selectedComplaint()!.title }}</h4>
                </div>
                <button pButton icon="pi pi-times" (click)="selectedComplaint.set(null)"
                  class="p-button-sm p-button-text p-button-rounded text-slate-400 p-1"></button>
              </div>

              <!-- Message bubbles area -->
              <div class="flex-1 overflow-y-auto space-y-4 pr-1 py-2 custom-scrollbar">
                <!-- Original description as first message bubble -->
                <div class="flex items-start gap-2 max-w-[80%]">
                  <app-avatar [name]="selectedComplaint()!.parentName" size="sm" />
                  <div class="bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 rounded-2xl rounded-tl-none p-3.5 space-y-1">
                    <p class="text-xs font-bold text-slate-600 dark:text-slate-300">Submitter Complaint Description</p>
                    <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{{ selectedComplaint()!.description }}</p>
                    <span class="text-[9px] text-slate-400 block pt-1 text-right">{{ formatDateShort(selectedComplaint()!.createdAt) }}</span>
                  </div>
                </div>

                @for (c of selectedComplaint()!.comments; track $index) {
                  <div class="flex items-start gap-2 max-w-[80%]" [class.ml-auto]="c.senderRole === 'Parent'" [class.flex-row-reverse]="c.senderRole === 'Parent'">
                    <app-avatar [name]="c.senderName" size="sm" />
                    <div class="p-3.5 rounded-2xl space-y-0.5" 
                      [class]="c.senderRole === 'Parent' ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'">
                      <p class="text-[9px] font-bold" [class]="c.senderRole === 'Parent' ? 'text-indigo-200' : 'text-slate-400'">{{ c.senderName }} ({{ c.senderRole }})</p>
                      <p class="text-xs leading-relaxed">{{ c.text }}</p>
                      <span class="text-[9px] block pt-1 text-right" [class]="c.senderRole === 'Parent' ? 'text-indigo-200/80' : 'text-slate-400'">{{ formatDateShort(c.timestamp) }}</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Input bar -->
              <div class="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <input type="text" pInputText placeholder="Reply to the warden or landlord..."
                  class="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 focus:ring-2 focus:ring-indigo-500/20"
                  [(ngModel)]="chatReply" (keyup.enter)="sendChatReply()" />
                <button pButton label="Send" icon="pi pi-send" (click)="sendChatReply()"
                  class="p-button-sm rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 px-4 py-2 font-bold shadow-md shadow-indigo-500/20"></button>
              </div>
            </div>
          }
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
export class ParentComplaint implements OnInit {
  private authService = inject(AuthService);
  private crudService = inject(CrudService);
  private router = inject(Router);

  parentUser = signal<ParentUser | null>(null);
  complaints = signal<IParentComplaint[]>([]);
  selectedComplaint = signal<IParentComplaint | null>(null);

  newForm = {
    category: 'Food',
    title: '',
    description: ''
  };

  chatReply = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const parents = this.crudService.getAll<ParentUser>(StorageKeys.PARENTS);
    const parentId = (user as any).linkedParentId || 'parent-001';
    const parentRecord = parents.find(p => p.id === parentId);

    if (parentRecord) {
      this.parentUser.set(parentRecord);
      this.loadComplaints(parentRecord.id);
    }
  }

  loadComplaints(parentId: string) {
    const list = this.crudService.getAll<IParentComplaint>('lsp_complaints');
    const filtered = list.filter(c => c.parentId === parentId);
    
    // Seed standard parent complaints if empty
    if (list.length === 0) {
      const standard: IParentComplaint[] = [
        { 
          id: 'comp-101', 
          parentId: parentId, 
          parentName: this.parentUser()!.fullName,
          category: 'Food', 
          title: 'Quality of dinner is poor', 
          description: 'Rahul reported that dinner is cold and lacks variety.', 
          status: 'InProgress', 
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          comments: [
            { senderRole: 'Owner', senderName: 'Nikunj Owner', text: 'Thank you Rajesh. I have spoken with the chef to ensure hot meals are served tonight.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        },
        { 
          id: 'comp-102', 
          parentId: parentId, 
          parentName: this.parentUser()!.fullName,
          category: 'Security', 
          title: 'WiFi router down on 2nd Floor', 
          description: 'Internet connection down since yesterday, impeding study logs.', 
          status: 'Resolved', 
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          comments: [
            { senderRole: 'Warden', senderName: 'Deepak Warden', text: 'Router replaced. Please confirm if Rahul can connect now.', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
            { senderRole: 'Parent', senderName: this.parentUser()!.fullName, text: 'Yes, it works now. Thanks.', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        }
      ];
      localStorage.setItem('lsp_complaints', JSON.stringify(standard));
      this.complaints.set(standard);
    } else {
      this.complaints.set(filtered);
    }
  }

  selectComplaint(comp: IParentComplaint) {
    this.selectedComplaint.set(comp);
  }

  submitComplaint() {
    if (!this.newForm.title || !this.newForm.description || !this.parentUser()) return;

    const newComp: IParentComplaint = {
      id: `comp-${Math.floor(100 + Math.random() * 900)}`,
      parentId: this.parentUser()!.id,
      parentName: this.parentUser()!.fullName,
      category: this.newForm.category,
      title: this.newForm.title,
      description: this.newForm.description,
      status: 'Open',
      createdAt: new Date().toISOString(),
      comments: []
    };

    const all = this.crudService.getAll<IParentComplaint>('lsp_complaints');
    all.unshift(newComp);
    localStorage.setItem('lsp_complaints', JSON.stringify(all));

    // Reload
    this.loadComplaints(this.parentUser()!.id);
    
    // Clear form
    this.newForm = { category: 'Food', title: '', description: '' };
    alert('Safety concern filed successfully. Management team has been notified.');
  }

  sendChatReply() {
    if (!this.chatReply.trim() || !this.selectedComplaint() || !this.parentUser()) return;

    const targetComplaint = { ...this.selectedComplaint()! };
    if (!targetComplaint.comments) {
      targetComplaint.comments = [];
    }

    const newComment: ComplaintComment = {
      senderRole: 'Parent',
      senderName: this.parentUser()!.fullName,
      text: this.chatReply.trim(),
      timestamp: new Date().toISOString()
    };

    targetComplaint.comments.push(newComment);

    // Save
    const all = this.crudService.getAll<IParentComplaint>('lsp_complaints');
    const idx = all.findIndex(c => c.id === targetComplaint.id);
    if (idx !== -1) {
      all[idx] = targetComplaint;
      localStorage.setItem('lsp_complaints', JSON.stringify(all));
      this.selectedComplaint.set(targetComplaint);
      this.loadComplaints(this.parentUser()!.id);
      this.chatReply = '';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDateShort(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  navigateBack() {
    this.router.navigate(['/parent/dashboard']);
  }
}
