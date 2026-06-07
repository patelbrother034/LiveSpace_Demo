import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface TenantProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  paymentStatus: string;
  occupation: string;
  orgId: string;
  gender: string;
  dob: string;
  aadhaar: string;
  pan: string;
  kycStatus: string;
  permanentAddress: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  propertyName: string;
  roomNumber: string;
  bedNumber: string;
  leaseStart: string;
  leaseEnd: string;
  rent: number;
  deposit: number;
  totalPaid: number;
  pendingDues: number;
}

interface TenantTx {
  id: string;
  type: string;
  amount: number;
  date: string;
  mode: string;
  status: string;
}

interface TenantActivity {
  title: string;
  description: string;
  date: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-tenant-profile',
  standalone: true,
  imports: [CommonModule, PageHeader, StatusBadge, Avatar, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Back Button & Header -->
      <div class="flex items-center gap-3">
        <button pButton icon="pi pi-arrow-left" class="p-button-sm p-button-text p-button-rounded text-slate-500" (click)="goBack()"></button>
        <div class="flex-1">
          <app-page-header [title]="profile().fullName" [subtitle]="'Resident ID: ' + profile().id">
            <button pButton label="Verify KYC" icon="pi pi-verified" 
              *ngIf="profile().kycStatus !== 'Verified'"
              (click)="verifyKyc()"
              class="p-button-sm p-button-success rounded-xl text-white mr-2">
            </button>
            <button pButton label="Put on Notice" icon="pi pi-bell" 
              *ngIf="profile().status === 'Active'"
              (click)="setOnNotice()"
              class="p-button-sm p-button-warning rounded-xl text-white mr-2">
            </button>
            <button pButton label="Initiate Checkout" icon="pi pi-sign-out" 
              *ngIf="profile().status !== 'CheckedOut'"
              (click)="initiateCheckout()"
              class="p-button-sm p-button-danger rounded-xl text-white mr-2">
            </button>
            <button pButton label="Send Message" icon="pi pi-envelope" class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"></button>
          </app-page-header>
        </div>
      </div>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Summary Card -->
        <div class="space-y-6">
          <!-- Quick Profile Card -->
          <div class="glass-card p-6 text-center space-y-4">
            <div class="flex justify-center">
              <app-avatar [name]="profile().fullName" size="xl" />
            </div>
            <div>
              <h2 class="text-xl font-bold text-slate-800 dark:text-white">{{ profile().fullName }}</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ profile().occupation }}</p>
            </div>
            <div class="flex items-center justify-center gap-2">
              <app-status-badge [status]="profile().status" />
              <app-status-badge [status]="profile().paymentStatus" />
            </div>
            <div class="border-t border-slate-100 dark:border-slate-800 pt-4 text-left space-y-2.5 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Phone</span>
                <span class="font-medium text-slate-800 dark:text-white">{{ profile().phone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Email</span>
                <span class="font-medium text-slate-800 dark:text-white text-xs truncate max-w-[180px]" [title]="profile().email">{{ profile().email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Gender</span>
                <span class="font-medium text-slate-800 dark:text-white">{{ profile().gender }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">DOB</span>
                <span class="font-medium text-slate-800 dark:text-white">{{ profile().dob }}</span>
              </div>
            </div>
          </div>

          <!-- Emergency Contact -->
          <div class="glass-card p-6 space-y-4">
            <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="pi pi-phone text-indigo-500"></i> Emergency Contact
            </h3>
            <div class="space-y-2.5 text-sm">
              <div>
                <p class="text-xs text-slate-400">Name</p>
                <p class="font-medium text-slate-800 dark:text-white">{{ profile().emergencyName }} ({{ profile().emergencyRelation }})</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Phone Number</p>
                <p class="font-medium text-slate-800 dark:text-white">{{ profile().emergencyPhone }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Detail Tabs -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Room & Lease Details -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5">Accommodation & Lease</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div>
                  <p class="text-xs text-slate-400 uppercase font-semibold">Assigned Property</p>
                  <p class="text-sm font-medium text-slate-800 dark:text-white mt-1">{{ profile().propertyName }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 uppercase font-semibold">Room & Bed</p>
                  <p class="text-sm font-medium text-slate-800 dark:text-white mt-1">Room {{ profile().roomNumber }} / Bed {{ profile().bedNumber }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 uppercase font-semibold">Monthly Rent</p>
                  <p class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">₹{{ profile().rent | number }}</p>
                </div>
              </div>
              <div class="space-y-4">
                <div>
                  <p class="text-xs text-slate-400 uppercase font-semibold">Lease Term</p>
                  <p class="text-sm font-medium text-slate-800 dark:text-white mt-1">{{ profile().leaseStart }} – {{ profile().leaseEnd }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 uppercase font-semibold">Security Deposit</p>
                  <p class="text-sm font-medium text-slate-800 dark:text-white mt-1">₹{{ profile().deposit | number }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400 uppercase font-semibold">Pending Balance</p>
                  <p class="text-sm font-bold mt-1" [class]="profile().pendingDues > 0 ? 'text-red-500' : 'text-emerald-500'">
                    ₹{{ profile().pendingDues | number }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- KYC Details -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">KYC Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p class="text-xs text-slate-400">Aadhaar Number</p>
                <p class="font-medium text-slate-800 dark:text-white mt-1">
                  {{ profile().aadhaar ? 'XXXX-XXXX-' + profile().aadhaar.slice(-4) : 'Not Provided' }}
                </p>
              </div>
              <div>
                <p class="text-xs text-slate-400">PAN Number</p>
                <p class="font-medium text-slate-800 dark:text-white mt-1">{{ profile().pan || 'Not Provided' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Verification Status</p>
                <span class="inline-flex items-center gap-1.5 font-semibold mt-1"
                  [class]="profile().kycStatus === 'Verified' ? 'text-emerald-600' : 'text-amber-500'">
                  <i class="pi" [class]="profile().kycStatus === 'Verified' ? 'pi-verified' : 'pi-clock'"></i>
                  {{ profile().kycStatus }}
                </span>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
              <p class="text-xs text-slate-400">Permanent Address</p>
              <p class="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{{ profile().permanentAddress }}</p>
            </div>
          </div>

          <!-- Payment History -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Transactions</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                    <th class="py-3 px-2">Type</th>
                    <th class="py-3 px-2 text-right">Amount</th>
                    <th class="py-3 px-2">Date</th>
                    <th class="py-3 px-2">Method</th>
                    <th class="py-3 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                  @for (tx of transactions(); track tx.id) {
                    <tr>
                      <td class="py-3 px-2 font-semibold text-slate-800 dark:text-white">{{ tx.type }}</td>
                      <td class="py-3 px-2 text-right font-medium">₹{{ tx.amount | number }}</td>
                      <td class="py-3 px-2 text-slate-500 dark:text-slate-400">{{ tx.date }}</td>
                      <td class="py-3 px-2 text-xs text-slate-400">{{ tx.mode }}</td>
                      <td class="py-3 px-2 text-center"><app-status-badge [status]="tx.status" /></td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-4 text-center text-slate-400 text-xs">No transactions recorded for this resident.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Activity Timeline</h3>
            <div class="relative pl-6 border-l-2 border-slate-150 dark:border-slate-800 space-y-6">
              @for (act of activities(); track act.title) {
                <div class="relative">
                  <!-- Bullet point -->
                  <span class="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white" [class]="act.colorClass">
                    <i class="pi {{ act.icon }}"></i>
                  </span>
                  <div>
                    <div class="flex items-center justify-between">
                      <h4 class="font-bold text-sm text-slate-800 dark:text-white">{{ act.title }}</h4>
                      <span class="text-[10px] text-slate-400">{{ act.date }}</span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">{{ act.description }}</p>
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
  `]
})
export class TenantProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private crudService = inject(CrudService);

  tenantId = signal<string>('');

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.tenantId.set(id);
      }
    });
  }

  profile = computed<TenantProfileData>(() => {
    const id = this.tenantId();
    const tenant = this.crudService.getById<any>(StorageKeys.TENANTS, id);

    if (!tenant) {
      // Fallback stub if not found
      return {
        id: id || 'N/A', fullName: 'Unknown Tenant', email: '', phone: '',
        status: 'CheckedOut', paymentStatus: 'Paid', occupation: 'Unknown', orgId: '', gender: '',
        dob: '', aadhaar: '', pan: '', kycStatus: 'Pending', permanentAddress: '',
        emergencyName: '', emergencyRelation: '', emergencyPhone: '',
        propertyName: 'N/A', roomNumber: 'N/A', bedNumber: 'N/A', leaseStart: '', leaseEnd: '',
        rent: 0, deposit: 0, totalPaid: 0, pendingDues: 0
      };
    }

    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    const prop = properties.find((p: any) => p.id === tenant.propertyId);
    const room = rooms.find((r: any) => r.id === tenant.roomId);
    const bed = beds.find((b: any) => b.id === tenant.bedId);

    // Format address
    let formattedAddr = '';
    if (tenant.permanentAddress) {
      if (typeof tenant.permanentAddress === 'string') {
        formattedAddr = tenant.permanentAddress;
      } else {
        const addr = tenant.permanentAddress;
        formattedAddr = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} – ${addr.pin || ''}`;
      }
    }

    return {
      id: tenant.id,
      fullName: tenant.fullName || `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim(),
      email: tenant.email || '',
      phone: tenant.phone || '',
      status: tenant.status || 'Active',
      paymentStatus: tenant.paymentStatus || 'Pending',
      occupation: tenant.occupation || 'Professional',
      orgId: tenant.orgId || '',
      gender: tenant.gender || '',
      dob: tenant.dateOfBirth || '',
      aadhaar: tenant.aadhaarNumber || '',
      pan: tenant.panNumber || '',
      kycStatus: tenant.kycStatus || 'Pending',
      permanentAddress: formattedAddr || 'No permanent address logged.',
      emergencyName: tenant.emergencyContact?.name || 'N/A',
      emergencyRelation: tenant.emergencyContact?.relation || 'Guardian',
      emergencyPhone: tenant.emergencyContact?.phone || 'N/A',
      propertyName: prop ? prop.name : 'Unknown Property',
      roomNumber: room ? room.roomNumber : 'N/A',
      bedNumber: bed ? bed.bedNumber.split('-').pop() || bed.bedNumber : 'N/A',
      leaseStart: tenant.leaseStartDate || '',
      leaseEnd: tenant.leaseEndDate || '',
      rent: tenant.monthlyRent || tenant.rent || 0,
      deposit: tenant.securityDeposit || 0,
      totalPaid: tenant.totalPaid || 0,
      pendingDues: tenant.pendingDues || 0
    };
  });

  transactions = computed<TenantTx[]>(() => {
    const id = this.tenantId();
    const rawTxs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);
    const tenantTxs = rawTxs.filter((tx: any) => tx.tenantId === id);

    return tenantTxs.map((tx: any) => ({
      id: tx.id,
      type: tx.type === 'DEPOSIT' ? 'Security Deposit' : tx.type === 'RENT' ? 'Rent' : tx.type,
      amount: tx.amount || 0,
      date: tx.paymentDate || tx.createdAt || '',
      mode: tx.paymentMode || 'UPI',
      status: tx.status || 'Paid'
    }));
  });

  activities = computed<TenantActivity[]>(() => {
    const id = this.tenantId();
    const tenant = this.profile();
    const txs = this.transactions();

    const list: TenantActivity[] = [];

    // Add Check-In event
    if (tenant.leaseStart) {
      list.push({
        title: 'Successfully Checked In',
        description: `Allocated Room ${tenant.roomNumber} / Bed ${tenant.bedNumber}.`,
        date: tenant.leaseStart,
        icon: 'pi-home',
        colorClass: 'bg-emerald-500'
      });
    }

    // Add KYC event
    if (tenant.kycStatus === 'Verified') {
      list.push({
        title: 'Identity Verified',
        description: 'Document verification successful.',
        date: tenant.leaseStart || 'Jan 01, 2026',
        icon: 'pi-verified',
        colorClass: 'bg-blue-500'
      });
    }

    // Add Rent receipts
    txs.forEach(tx => {
      list.push({
        title: `${tx.type} Received`,
        description: `Payment of ₹${tx.amount.toLocaleString()} received via ${tx.mode}.`,
        date: tx.date,
        icon: 'pi-credit-card',
        colorClass: 'bg-indigo-500'
      });
    });

    // Add Notice event
    if (tenant.status === 'Notice') {
      list.push({
        title: 'Checkout Notice Logged',
        description: 'Resident has submitted formal notice for checkout.',
        date: 'Recent',
        icon: 'pi-clock',
        colorClass: 'bg-amber-500'
      });
    }

    return list.sort((a, b) => b.date.localeCompare(a.date));
  });

  verifyKyc() {
    const id = this.tenantId();
    this.crudService.update<any>(StorageKeys.TENANTS, id, { kycStatus: 'Verified' });
    this.tenantId.set(''); // Trigger dynamic re-computation
    this.tenantId.set(id);
  }

  setOnNotice() {
    const id = this.tenantId();
    this.crudService.update<any>(StorageKeys.TENANTS, id, { status: 'Notice' });
    this.tenantId.set(''); // Trigger dynamic re-computation
    this.tenantId.set(id);
  }

  initiateCheckout() {
    this.router.navigate(['/owner/tenants/check-out'], { queryParams: { tenantId: this.tenantId() } });
  }

  goBack() {
    this.router.navigate(['/owner/tenants']);
  }
}
