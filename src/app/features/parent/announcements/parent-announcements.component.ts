import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface ParentUser {
  id: string;
  tenantId: string;
  fullName: string;
}

interface TenantResident {
  id: string;
  propertyId: string;
  fullName: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  publishedAt: string;
  acknowledgedBy: string[];
  createdBy: string;
}

@Component({
  selector: 'app-parent-announcements',
  standalone: true,
  imports: [CommonModule, PageHeader, StatusBadge, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in" *ngIf="student()">
      <!-- Page Header -->
      <app-page-header title="Announcements & Rules Updates" subtitle="Stay updated with notices, festival schedules, curfew alterations, and maintenance notices issued by the PG administration">
        <button pButton label="Back to Dashboard" icon="pi pi-arrow-left" (click)="navigateBack()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <!-- Active announcements grid list -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (ann of announcements(); track ann.id) {
          <div class="glass-card p-6 flex flex-col justify-between hover:scale-[1.01] hover:shadow-lg transition-all duration-300 relative group"
               [class]="ann.priority === 'High' ? 'border-l-4 border-red-500 bg-gradient-to-r from-red-500/5 to-transparent' : 'border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-500/5 to-transparent'">
            
            <div class="space-y-4">
              <!-- Header tags -->
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {{ ann.type }}
                </span>
                
                <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase"
                  [class]="ann.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                  {{ ann.priority }} Priority
                </span>
              </div>

              <!-- Title Content -->
              <div class="space-y-2">
                <h3 class="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">{{ ann.title }}</h3>
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{{ ann.content }}</p>
              </div>
            </div>

            <!-- Footer acknowledgments -->
            <div class="flex items-center justify-between pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/60">
              <span class="text-[10px] text-slate-400">Issued {{ formatTime(ann.publishedAt) }}</span>
              
              <div class="shrink-0">
                @if (isAcknowledged(ann)) {
                  <span class="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                    <i class="pi pi-check-circle"></i> Acknowledged
                  </span>
                } @else {
                  <button pButton label="Mark Acknowledged" icon="pi pi-check-square" (click)="acknowledgeAnn(ann.id)"
                    class="p-button-sm rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 px-4 py-1.5 text-xs font-bold shadow-md shadow-indigo-500/20">
                  </button>
                }
              </div>
            </div>

          </div>
        } @empty {
          <div class="col-span-full py-12 text-center text-slate-400 italic">
            No active notices or announcements issued for your property.
          </div>
        }
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
export class ParentAnnouncements implements OnInit {
  private authService = inject(AuthService);
  private crudService = inject(CrudService);
  private router = inject(Router);

  parentUser = signal<ParentUser | null>(null);
  student = signal<TenantResident | null>(null);
  announcements = signal<Announcement[]>([]);

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

      const tenants = this.crudService.getAll<TenantResident>(StorageKeys.TENANTS);
      const child = tenants.find(t => t.id === parentRecord.tenantId);

      if (child) {
        this.student.set(child);

        // Fetch announcements matching child PG property or targeted to all
        const all = this.crudService.getAll<Announcement>(StorageKeys.ANNOUNCEMENTS);
        const filtered = all.filter((a: any) => 
          a.targetAudience === 'All' || 
          (a.targetAudience === 'Property' && a.targetIds.includes(child.propertyId))
        );
        this.announcements.set(filtered);
      }
    }
  }

  isAcknowledged(ann: Announcement): boolean {
    if (!this.student()) return false;
    return ann.acknowledgedBy && ann.acknowledgedBy.includes(this.student()!.id);
  }

  acknowledgeAnn(annId: string) {
    if (!this.student()) return;

    const all = this.crudService.getAll<Announcement>(StorageKeys.ANNOUNCEMENTS);
    const idx = all.findIndex(a => a.id === annId);

    if (idx !== -1) {
      if (!all[idx].acknowledgedBy) {
        all[idx].acknowledgedBy = [];
      }
      if (!all[idx].acknowledgedBy.includes(this.student()!.id)) {
        all[idx].acknowledgedBy.push(this.student()!.id);
      }
      localStorage.setItem(StorageKeys.ANNOUNCEMENTS, JSON.stringify(all));
      
      // Reload lists
      this.loadData();
      alert('Notice acknowledged successfully!');
    }
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
