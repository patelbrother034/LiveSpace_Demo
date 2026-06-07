import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface ParentRecord {
  id: string;
  fullName: string;
}

interface ChatMessage {
  id: string;
  parentId: string;
  senderRole: 'Parent' | 'Owner' | 'Warden';
  senderName: string;
  text: string;
  timestamp: string;
}

@Component({
  selector: 'app-parent-communication',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, Avatar, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in" *ngIf="parentUser()">
      <!-- Page Header -->
      <app-page-header title="Communication Center" subtitle="Direct secure messaging portal with the PG management team and warden">
        <button pButton label="Back to Dashboard" icon="pi pi-arrow-left" (click)="navigateBack()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <div class="glass-card max-w-4xl mx-auto flex flex-col h-[550px] relative overflow-hidden">
        <!-- Visual Accent Glow -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Chat Header -->
        <div class="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 relative z-10 bg-white/40 dark:bg-slate-900/40">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <i class="pi pi-comments text-base"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-white">Management Helpdesk</h3>
              <span class="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active Connection
              </span>
            </div>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/20 dark:bg-slate-950/10">
          @for (msg of messages(); track msg.id) {
            <div class="flex items-start gap-2.5 max-w-[80%]" 
                 [class.ml-auto]="msg.senderRole === 'Parent'" 
                 [class.flex-row-reverse]="msg.senderRole === 'Parent'">
              <app-avatar [name]="msg.senderName" size="sm" />
              
              <div class="p-3.5 rounded-2xl space-y-1 relative"
                   [class]="msg.senderRole === 'Parent' ? 'bg-indigo-500 text-white rounded-tr-none shadow-md shadow-indigo-500/10' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-800/80 shadow-sm'">
                
                <p class="text-[9px] font-bold" [class]="msg.senderRole === 'Parent' ? 'text-indigo-200' : 'text-slate-400'">
                  {{ msg.senderName }} ({{ msg.senderRole }})
                </p>
                <p class="text-xs leading-relaxed">{{ msg.text }}</p>
                <span class="text-[9px] block pt-1 text-right" [class]="msg.senderRole === 'Parent' ? 'text-indigo-200/80' : 'text-slate-400'">
                  {{ formatTime(msg.timestamp) }}
                </span>
              </div>
            </div>
          } @empty {
            <div class="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic">
              No chat history. Start the conversation with the PG managers!
            </div>
          }
        </div>

        <!-- Chat Input Bar -->
        <div class="p-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0 bg-white/40 dark:bg-slate-900/40 relative z-10 flex items-center gap-3">
          <input type="text" pInputText placeholder="Type your message here..."
            class="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20"
            [(ngModel)]="chatText" (keyup.enter)="sendMessage()" />
          <button pButton label="Send Message" icon="pi pi-send" (click)="sendMessage()"
            class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90 px-6 py-2.5 font-bold shadow-md shadow-indigo-500/25"></button>
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
export class ParentCommunication implements OnInit {
  private authService = inject(AuthService);
  private crudService = inject(CrudService);
  private router = inject(Router);

  parentUser = signal<ParentRecord | null>(null);
  messages = signal<ChatMessage[]>([]);
  chatText = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const parents = this.crudService.getAll<ParentRecord>(StorageKeys.PARENTS);
    const parentId = (user as any).linkedParentId || 'parent-001';
    const parentRecord = parents.find(p => p.id === parentId);

    if (parentRecord) {
      this.parentUser.set(parentRecord);
      this.loadMessages(parentRecord.id);
    }
  }

  loadMessages(parentId: string) {
    const all = this.crudService.getAll<ChatMessage>('lsp_parent_chats');
    const filtered = all.filter(c => c.parentId === parentId);

    if (all.length === 0) {
      // Seed standard general inquiry messages
      const standard: ChatMessage[] = [
        { id: 'msg-001', parentId: parentId, senderRole: 'Parent', senderName: this.parentUser()!.fullName, text: 'Hello warden, I wanted to confirm if the water supply issue in Royal Heights is resolved?', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'msg-002', parentId: parentId, senderRole: 'Warden', senderName: 'Deepak Warden', text: 'Yes Rajesh, the pipeline repair is fully completed and hot water supply is fully active.', timestamp: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'msg-003', parentId: parentId, senderRole: 'Parent', senderName: this.parentUser()!.fullName, text: 'Excellent, thank you for the prompt update.', timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() }
      ];
      localStorage.setItem('lsp_parent_chats', JSON.stringify(standard));
      this.messages.set(standard);
    } else {
      this.messages.set(filtered);
    }
  }

  sendMessage() {
    if (!this.chatText.trim() || !this.parentUser()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now().toString(36)}`,
      parentId: this.parentUser()!.id,
      senderRole: 'Parent',
      senderName: this.parentUser()!.fullName,
      text: this.chatText.trim(),
      timestamp: new Date().toISOString()
    };

    const all = this.crudService.getAll<ChatMessage>('lsp_parent_chats');
    all.push(newMsg);
    localStorage.setItem('lsp_parent_chats', JSON.stringify(all));

    this.messages.set([...this.messages(), newMsg]);
    this.chatText = '';
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  navigateBack() {
    this.router.navigate(['/parent/dashboard']);
  }
}
