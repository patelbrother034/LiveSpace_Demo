import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface ParentRecord {
  id: string;
  tenantId: string;
  fullName: string;
  relation: string;
}

interface TenantResident {
  id: string;
  propertyId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  fullName: string;
  gender: string;
  phone: string;
  email: string;
  occupation: string;
  leaseStartDate: string;
  leaseEndDate: string;
  checkInDate: string;
  status: string;
}

interface PGProperty {
  id: string;
  name: string;
  type: string;
  gender: string;
  address: { street: string; city: string; state: string; pin: string };
  email: string;
  phone: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  designation: string;
}

@Component({
  selector: 'app-student-overview',
  standalone: true,
  imports: [CommonModule, PageHeader, Avatar, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in" *ngIf="student()">
      <!-- Page Header -->
      <app-page-header title="Student Accommodation Profile" subtitle="Detailed oversight of your child's living conditions, roommates, and caretakers">
        <button pButton label="Back to Dashboard" icon="pi pi-arrow-left" (click)="navigateBack()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- LEFT: Primary details & contacts -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Student Summary -->
          <div class="glass-card p-6 space-y-4 text-center relative overflow-hidden">
            <div class="absolute -top-12 -left-12 w-24 h-24 rounded-full blur-xl bg-indigo-500/10"></div>
            <div class="flex flex-col items-center">
              <app-avatar [name]="student()!.fullName" size="xl" />
              <h3 class="text-lg font-bold text-slate-800 dark:text-white mt-3">{{ student()!.fullName }}</h3>
              <span class="px-2.5 py-0.5 mt-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                Active Resident
              </span>
            </div>
            
            <div class="border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs space-y-3.5 text-left text-slate-600 dark:text-slate-400">
              <div class="flex justify-between">
                <span>Check-in Date:</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ student()!.checkInDate }}</span>
              </div>
              <div class="flex justify-between">
                <span>Lease Period:</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{ student()!.leaseStartDate }} to {{ student()!.leaseEndDate }}</span>
              </div>
              <div class="flex justify-between">
                <span>Occupation:</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{ student()!.occupation }}</span>
              </div>
            </div>
          </div>

          <!-- Warden Emergency Contacts -->
          <div class="glass-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Warden & Caretakers
            </h3>
            
            <div class="space-y-4">
              @for (member of caretakers(); track member.id) {
                <div class="flex items-start gap-3">
                  <app-avatar [name]="member.name" size="sm" />
                  <div class="flex-1 space-y-1">
                    <p class="text-sm font-bold text-slate-800 dark:text-white">{{ member.name }}</p>
                    <p class="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">{{ member.designation }}</p>
                    
                    <div class="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <a [href]="'tel:' + member.phone" class="hover:text-indigo-500 flex items-center gap-1">
                        <i class="pi pi-phone text-[10px]"></i> Call
                      </a>
                      <a [href]="'mailto:' + member.email" class="hover:text-indigo-500 flex items-center gap-1">
                        <i class="pi pi-envelope text-[10px]"></i> Email
                      </a>
                    </div>
                  </div>
                </div>
              } @empty {
                <p class="text-xs text-slate-400 italic">No warden emergency contact registered.</p>
              }
            </div>
          </div>
        </div>

        <!-- RIGHT: Roommates & Property Details -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Property details -->
          <div class="glass-card p-6 space-y-5">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3">
              PG Location & Amenities
            </h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" *ngIf="property()">
              <div class="space-y-3">
                <div>
                  <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PG Property</h4>
                  <p class="text-base font-extrabold text-indigo-500 mt-1">{{ property()!.name }}</p>
                </div>
                <div>
                  <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address Location</h4>
                  <p class="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {{ property()!.address.street }}<br>
                    {{ property()!.address.city }}, {{ property()!.address.state }} - {{ property()!.address.pin }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office Contacts</h4>
                  <p class="text-xs text-slate-700 dark:text-slate-300 mt-1.5 flex items-center gap-1.5">
                    <i class="pi pi-phone text-[10px]"></i> {{ property()!.phone }}
                  </p>
                  <p class="text-xs text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                    <i class="pi pi-envelope text-[10px]"></i> {{ property()!.email }}
                  </p>
                </div>
                <div>
                  <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property Rules</h4>
                  <p class="text-xs text-slate-400 mt-1 italic">Curfew is 10:30 PM. Visitors allowed in lounge only.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Roommates sharing -->
          <div class="glass-card p-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Roommates (Room {{ student()!.roomId.replace('room-', '').toUpperCase() }})
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (mate of roommates(); track mate.id) {
                <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 flex items-center gap-3">
                  <app-avatar [name]="mate.fullName" size="sm" />
                  <div>
                    <p class="text-sm font-bold text-slate-800 dark:text-white">{{ mate.fullName }}</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">Resident since {{ mate.checkInDate }}</p>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-4 text-center text-slate-400 text-xs italic">
                  Living in a single room arrangement or no roommates registered.
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
export class StudentOverview implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private crudService = inject(CrudService);

  student = signal<TenantResident | null>(null);
  property = signal<PGProperty | null>(null);
  roommates = signal<TenantResident[]>([]);
  caretakers = signal<StaffMember[]>([]);

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
      const tenants = this.crudService.getAll<TenantResident>(StorageKeys.TENANTS);
      const child = tenants.find(t => t.id === parentRecord.tenantId);

      if (child) {
        this.student.set(child);

        // Fetch roommates
        const mates = tenants.filter(t => 
          t.propertyId === child.propertyId && 
          t.roomId === child.roomId && 
          t.id !== child.id && 
          t.status === 'Active'
        );
        this.roommates.set(mates);

        // Fetch property
        const props = this.crudService.getAll<PGProperty>(StorageKeys.PROPERTIES);
        const prop = props.find(p => p.id === child.propertyId);
        if (prop) {
          this.property.set(prop);
        }

        // Fetch staff contacts
        const staff = this.crudService.getAll<StaffMember>(StorageKeys.STAFF);
        const caretakersMembers = staff.filter(s => s.role === 'Caretaker' || s.role === 'Warden');
        this.caretakers.set(caretakersMembers);
      }
    }
  }

  navigateBack() {
    this.router.navigate(['/parent/dashboard']);
  }
}
