import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface ParentUser {
  id: string;
  tenantId: string;
  fullName: string;
  relation: string;
}

interface TenantResident {
  id: string;
  propertyId: string;
  roomId: string;
  bedId: string;
  fullName: string;
  gender: string;
  phone: string;
  email: string;
  monthlyRent: number;
  securityDeposit: number;
  pendingDues: number;
  paymentStatus: string;
  status: string;
}

interface PGProperty {
  id: string;
  name: string;
  address: { street: string; city: string };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  publishedAt: string;
  acknowledgedBy: string[];
}

interface ParentComplaint {
  id: string;
  parentId: string;
  category: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeader, StatCard, StatusBadge, Avatar, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in" *ngIf="parentRecord()">
      <!-- Page Header -->
      <app-page-header 
        [title]="'Welcome, Mr/Ms ' + parentRecord()!.fullName" 
        [subtitle]="'Parent of ' + student()!.fullName + ' · ' + propertyName() + ', Room ' + student()!.roomId.replace('room-', '')">
        <button pButton label="Pay On Behalf" icon="pi pi-indian-rupee" (click)="navigateToPayments()"
          class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white hover:opacity-90 shadow-md shadow-emerald-500/20">
        </button>
      </app-page-header>

      <!-- Student Status + Quick Dues Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Student Status" [value]="student()!.status === 'Active' ? 'Active Resident' : student()!.status" icon="pi-user" color="primary" />
        <app-stat-card label="Outstanding Dues" [value]="'₹' + student()!.pendingDues.toLocaleString('en-IN')" icon="pi-indian-rupee" [color]="student()!.pendingDues > 0 ? 'danger' : 'success'" />
        <app-stat-card label="Monthly Rent" [value]="'₹' + student()!.monthlyRent.toLocaleString('en-IN')" icon="pi-calendar" color="warning" />
        <app-stat-card label="Gate Attendance" value="28 / 31 Present" icon="pi-check-circle" color="success" />
      </div>

      <!-- Main Overview Cards Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- LEFT PANEL: Student arrangement overview -->
        <div class="xl:col-span-1 space-y-6">
          <div class="glass-card p-6 space-y-5 relative overflow-hidden">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Student Accommodation
            </h3>
            
            <div class="flex items-center gap-4">
              <app-avatar [name]="student()!.fullName" size="lg" />
              <div>
                <p class="font-bold text-slate-800 dark:text-white text-base">{{ student()!.fullName }}</p>
                <p class="text-xs text-indigo-500 font-semibold">{{ parentRecord()!.relation }} of submitter</p>
              </div>
            </div>

            <div class="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
              <div class="flex justify-between">
                <span>Property Name:</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ propertyName() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Room Number:</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ student()!.roomId.replace('room-', '').toUpperCase() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Bed Number:</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ student()!.bedId.replace('bed-', '').toUpperCase() }}</span>
              </div>
              <div class="flex justify-between">
                <span>Phone Contact:</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{ student()!.phone }}</span>
              </div>
              <div class="flex justify-between">
                <span>Email Address:</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{ student()!.email }}</span>
              </div>
            </div>

            <button pButton label="View Full Overview" icon="pi pi-search" (click)="navigateToOverview()"
              class="w-full p-button-sm p-button-outlined rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 mt-2">
            </button>
          </div>
        </div>

        <!-- RIGHT PANEL: Recent Targeted Announcements & Complaints -->
        <div class="xl:col-span-2 space-y-8">
          <!-- Announcements section -->
          <div class="glass-card p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Recent Announcements
              </h3>
              <button pButton label="View All" class="p-button-text p-button-sm text-indigo-500" (click)="navigateToAnnouncements()"></button>
            </div>

            <div class="space-y-4">
              @for (ann of announcements(); track ann.id) {
                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide"
                        [class]="ann.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'">
                        {{ ann.type }}
                      </span>
                      <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ ann.title }}</h4>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 pr-4">{{ ann.content }}</p>
                  </div>
                  
                  <div class="shrink-0 flex items-center gap-2">
                    @if (isAcknowledged(ann)) {
                      <span class="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                        <i class="pi pi-check-circle"></i> Acknowledged
                      </span>
                    } @else {
                      <button pButton label="Acknowledge" icon="pi pi-check" (click)="acknowledgeAnn(ann.id)"
                        class="p-button-xs rounded-lg bg-indigo-500 text-white border-none hover:bg-indigo-600 px-3 py-1 text-[11px]">
                      </button>
                    }
                  </div>
                </div>
              } @empty {
                <p class="text-xs text-slate-400 dark:text-slate-500 italic py-2">No active announcements raised for your property.</p>
              }
            </div>
          </div>

          <!-- Complaints section -->
          <div class="glass-card p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                My Filed Complaints
              </h3>
              <button pButton label="File New Complaint" icon="pi pi-plus" (click)="navigateToComplaints()"
                class="p-button-sm p-button-text text-indigo-500 p-0 hover:bg-transparent">
              </button>
            </div>

            <div class="space-y-4">
              @for (comp of complaints(); track comp.id) {
                <div class="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 cursor-pointer hover:border-indigo-500/20 transition-all"
                     (click)="navigateToComplaints()">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {{ comp.category }}
                      </span>
                      <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ comp.title }}</h4>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">Reported {{ formatTime(comp.createdAt) }}</p>
                  </div>
                  <app-status-badge [status]="comp.status" />
                </div>
              } @empty {
                <div class="h-24 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
                  No complaints filed yet. Click 'File New Complaint' if you have any issues.
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
export class ParentDashboard implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private crudService = inject(CrudService);

  parentRecord = signal<ParentUser | null>(null);
  student = signal<TenantResident | null>(null);
  propertyName = signal('Sunrise PG');
  
  announcements = signal<Announcement[]>([]);
  complaints = signal<ParentComplaint[]>([]);

  ngOnInit() {
    this.loadParentSession();
  }

  loadParentSession() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Find parent record linked to user
    const parents = this.crudService.getAll<ParentUser>(StorageKeys.PARENTS);
    const parentId = (user as any).linkedParentId || 'parent-001';
    const record = parents.find(p => p.id === parentId);

    if (record) {
      this.parentRecord.set(record);
      
      // Find dynamic resident child
      const tenants = this.crudService.getAll<TenantResident>(StorageKeys.TENANTS);
      const child = tenants.find(t => t.id === record.tenantId);
      
      if (child) {
        this.student.set(child);

        // Find child property
        const props = this.crudService.getAll<PGProperty>(StorageKeys.PROPERTIES);
        const prop = props.find(p => p.id === child.propertyId);
        if (prop) {
          this.propertyName.set(prop.name);
        }

        this.loadAnnouncements(child.propertyId, child.id);
        this.loadComplaints(record.id);
      }
    } else {
      // Direct back mock fallback
      alert('Parent records not seeded correctly. Please seed first.');
    }
  }

  loadAnnouncements(propertyId: string, tenantId: string) {
    const all = this.crudService.getAll<Announcement>(StorageKeys.ANNOUNCEMENTS);
    // filter targeting parent child PG or targeting All
    const filtered = all.filter((a: any) => 
      a.targetAudience === 'All' || 
      (a.targetAudience === 'Property' && a.targetIds.includes(propertyId))
    );
    this.announcements.set(filtered.slice(0, 3));
  }

  loadComplaints(parentId: string) {
    // Load parent complaints from custom collection
    const list = this.crudService.getAll<ParentComplaint>('lsp_complaints');
    const filtered = list.filter(c => c.parentId === parentId);
    
    // Seed standard parent complaints if empty
    if (list.length === 0) {
      const standard: ParentComplaint[] = [
        { id: 'comp-101', parentId: parentId, category: 'Food', title: 'Quality of dinner is poor', description: 'Rahul reported that dinner is cold and lacks variety.', status: 'InProgress', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'comp-102', parentId: parentId, category: 'Security', title: 'WiFi router down on 2nd Floor', description: 'Internet connection down since yesterday, impeding study logs.', status: 'Resolved', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
      ];
      localStorage.setItem('lsp_complaints', JSON.stringify(standard));
      this.complaints.set(standard);
    } else {
      this.complaints.set(filtered);
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
      
      // Reload
      this.loadAnnouncements(this.student()!.propertyId, this.student()!.id);
      alert('Announcement acknowledged successfully!');
    }
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  navigateToOverview() {
    this.router.navigate(['/parent/student-overview']);
  }

  navigateToPayments() {
    this.router.navigate(['/parent/payments']);
  }

  navigateToComplaints() {
    this.router.navigate(['/parent/complaints']);
  }

  navigateToAnnouncements() {
    this.router.navigate(['/parent/announcements']);
  }
}
