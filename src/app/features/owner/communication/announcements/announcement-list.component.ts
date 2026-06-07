import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  targetAudience: string;
  targetIds: string[];
  acknowledgedBy: string[];
  publishedAt: string;
}

interface TenantResident {
  id: string;
  fullName: string;
}

interface PGProperty {
  id: string;
  name: string;
}

@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatCard, Avatar, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Notice & Announcement Manager" subtitle="Broadcast updates, maintenance warnings, policy changes, and schedule alterations directly to active residents and their parents">
        <button pButton label="Create Notice" icon="pi pi-megaphone" (click)="openCreatorModal()"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90 shadow-md shadow-indigo-500/25">
        </button>
      </app-page-header>

      <!-- KPI stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <app-stat-card label="Total BroadCasts" [value]="announcements().length + ' Notices'" icon="pi-megaphone" color="primary" />
        <app-stat-card label="Active Alerts" [value]="activeAlertsCount() + ' High'" icon="pi-exclamation-triangle" color="danger" />
        <app-stat-card label="Acknowledged Rate" [value]="avgAckRate() + '% Avg'" icon="pi-verified" color="success" />
      </div>

      <!-- Announcements list -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- List container -->
        <div class="lg:col-span-2 space-y-6">
          <div class="glass-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Published Announcements & Notices
            </h3>

            <div class="space-y-4">
              @for (ann of announcements(); track ann.id) {
                <div class="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-indigo-500/20 transition-all cursor-pointer flex flex-col justify-between group"
                     (click)="selectAnnouncement(ann)">
                  
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                          {{ ann.type }}
                        </span>
                        <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase"
                          [class]="ann.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                          {{ ann.priority }}
                        </span>
                      </div>
                      <span class="text-[10px] text-slate-400">Published: {{ formatTime(ann.publishedAt) }}</span>
                    </div>

                    <h4 class="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">{{ ann.title }}</h4>
                    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 pr-6">{{ ann.content }}</p>
                  </div>

                  <!-- Ack overview -->
                  <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                    <span class="text-slate-400">Target: <strong class="text-slate-600 dark:text-slate-300 font-semibold">{{ getTargetLabel(ann) }}</strong></span>
                    
                    <span class="text-[11px] text-indigo-500 font-extrabold flex items-center gap-1">
                      <i class="pi pi-users"></i> {{ ann.acknowledgedBy ? ann.acknowledgedBy.length : 0 }} Acknowledged
                    </span>
                  </div>
                </div>
              } @empty {
                <p class="text-xs text-slate-400 italic text-center py-6">No announcements published yet.</p>
              }
            </div>
          </div>
        </div>

        <!-- RIGHT: Acknowledgment details metrics drawer -->
        <div class="lg:col-span-1">
          <div class="glass-card p-6 space-y-5 flex flex-col h-[500px]">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
              Acknowledgment Metrics
            </h3>

            @if (selectedAnn()) {
              <div class="space-y-4 flex-1 flex flex-col justify-between overflow-hidden">
                <div class="space-y-3 shrink-0">
                  <h4 class="text-sm font-bold text-indigo-500 line-clamp-1">{{ selectedAnn()!.title }}</h4>
                  
                  <div class="flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 text-xs text-slate-600 dark:text-slate-400">
                    <span>Acknowledge Count:</span>
                    <strong class="text-slate-800 dark:text-white font-extrabold text-sm">{{ selectedAnn()!.acknowledgedBy ? selectedAnn()!.acknowledgedBy.length : 0 }}</strong>
                  </div>
                </div>

                <!-- List of acknowledged residents -->
                <div class="flex-1 overflow-y-auto space-y-3 py-2 pr-1 custom-scrollbar">
                  <h5 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Residents Acknowledged:</h5>
                  @for (name of acknowledgedNames(); track $index) {
                    <div class="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <app-avatar [name]="name" size="sm" />
                      <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ name }}</span>
                    </div>
                  } @empty {
                    <p class="text-xs text-slate-400 italic py-4 text-center">No residents have acknowledged this warning yet.</p>
                  }
                </div>
              </div>
            } @else {
              <div class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <i class="pi pi-chart-bar text-3xl mb-3 text-slate-300"></i>
                <p class="text-xs italic leading-relaxed">Select a notice card from the left panel to inspect real-time read and acknowledgment metrics.</p>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- CREATE NEW BROADCAST MODAL OVERLAY -->
      @if (showCreator()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="glass-card max-w-xl w-full p-8 relative overflow-hidden">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Create New Broadcast Announcement</h3>
            
            <form (ngSubmit)="submitNotice()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase">Notice Title *</label>
                  <input type="text" pInputText required [(ngModel)]="newNotice.title" name="title" class="w-full text-xs" />
                </div>
                <div class="space-y-1">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase">Category *</label>
                  <select required [(ngModel)]="newNotice.type" name="type" class="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                    <option value="Maintenance">Maintenance Alert</option>
                    <option value="Policy">Policy Update</option>
                    <option value="Food">Mess Schedule</option>
                    <option value="Security">Security Regulation</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase">Priority *</label>
                  <select required [(ngModel)]="newNotice.priority" name="priority" class="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High Alert</option>
                  </select>
                </div>
                <div class="space-y-1">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase">Target Audience *</label>
                  <select required [(ngModel)]="newNotice.targetAudience" name="targetAudience" class="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                    <option value="All">All PG properties</option>
                    @for (p of properties(); track p.id) {
                      <option [value]="p.id">Only {{ p.name }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase">Detailed Content *</label>
                <textarea required rows="4" [(ngModel)]="newNotice.content" name="content"
                  placeholder="Draft notice description..."
                  class="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-300"></textarea>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" pButton label="Cancel" (click)="showCreator.set(false)" class="p-button-text p-button-sm text-slate-500"></button>
                <button type="submit" pButton label="Publish Announcement" class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90"></button>
              </div>
            </form>
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
export class AnnouncementListComponent implements OnInit {
  private crudService = inject(CrudService);

  announcements = signal<Announcement[]>([]);
  tenants = signal<TenantResident[]>([]);
  properties = signal<PGProperty[]>([]);

  selectedAnn = signal<Announcement | null>(null);
  showCreator = signal(false);

  newNotice = {
    title: '',
    type: 'Maintenance',
    priority: 'Medium',
    targetAudience: 'All',
    content: ''
  };

  // computed metrics
  activeAlertsCount = computed(() => this.announcements().filter(a => a.priority === 'High').length);
  avgAckRate = computed(() => {
    if (this.announcements().length === 0 || this.tenants().length === 0) return 0;
    const sumAcks = this.announcements().reduce((sum, a) => sum + (a.acknowledgedBy ? a.acknowledgedBy.length : 0), 0);
    const avg = sumAcks / (this.announcements().length * 15); // scaled average rate
    return Math.min(95, Math.round(avg * 100));
  });

  acknowledgedNames = computed(() => {
    if (!this.selectedAnn() || !this.selectedAnn()!.acknowledgedBy) return [];
    const ids = this.selectedAnn()!.acknowledgedBy;
    return this.tenants().filter(t => ids.includes(t.id)).map(t => t.fullName);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const list = this.crudService.getAll<Announcement>(StorageKeys.ANNOUNCEMENTS);
    this.announcements.set(list);

    const residents = this.crudService.getAll<TenantResident>(StorageKeys.TENANTS);
    this.tenants.set(residents);

    const props = this.crudService.getAll<PGProperty>(StorageKeys.PROPERTIES);
    this.properties.set(props);
  }

  getTargetLabel(ann: Announcement): string {
    if (ann.targetAudience === 'All') return 'All Properties';
    if (ann.targetAudience === 'Property') {
      const found = this.properties().find(p => p.id === ann.targetIds[0]);
      return found ? found.name : 'Target PG';
    }
    return ann.targetAudience;
  }

  selectAnnouncement(ann: Announcement) {
    this.selectedAnn.set(ann);
  }

  openCreatorModal() {
    this.newNotice = {
      title: '',
      type: 'Maintenance',
      priority: 'Medium',
      targetAudience: 'All',
      content: ''
    };
    this.showCreator.set(true);
  }

  submitNotice() {
    if (!this.newNotice.title || !this.newNotice.content) return;

    const fullNotice: Announcement = {
      id: `ann-${Date.now().toString(36)}`,
      title: this.newNotice.title,
      content: this.newNotice.content,
      type: this.newNotice.type,
      priority: this.newNotice.priority,
      targetAudience: this.newNotice.targetAudience === 'All' ? 'All' : 'Property',
      targetIds: this.newNotice.targetAudience === 'All' ? [] : [this.newNotice.targetAudience],
      acknowledgedBy: [],
      publishedAt: new Date().toISOString()
    };

    const all = this.crudService.getAll<Announcement>(StorageKeys.ANNOUNCEMENTS);
    all.unshift(fullNotice);
    localStorage.setItem(StorageKeys.ANNOUNCEMENTS, JSON.stringify(all));

    this.announcements.set(all);
    this.showCreator.set(false);
    alert('Notice broadcasted successfully!');
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}
