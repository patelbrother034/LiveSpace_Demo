import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-tenant-profile',
  standalone: true,
  imports: [CommonModule, PageHeader, Avatar, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="My Profile" subtitle="View and manage your personal information">
        <button pButton label="Edit Profile" icon="pi pi-pencil" (click)="editProfile()"
          class="p-button-sm p-button-outlined rounded-xl"></button>
      </app-page-header>

      <!-- Profile Hero -->
      <div class="glass-card p-8">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <app-avatar [name]="tenantName()" size="xl" />
          <div class="text-center sm:text-left flex-1">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">{{ tenantName() }}</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Tenant since {{ checkInDate() }}</p>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                 [class]="kycStatus() === 'Verified' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'">
              <i [class]="kycStatus() === 'Verified' ? 'pi pi-verified text-emerald-500' : 'pi pi-clock text-amber-500'"></i>
              KYC: {{ kycStatus() }}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Info -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <i class="pi pi-user text-indigo-500"></i> Personal Information
          </h3>
          <div class="space-y-4">
            @for (field of personalFields(); track field.label) {
              <div class="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ field.label }}</span>
                <span class="text-sm font-semibold text-slate-800 dark:text-white">{{ field.value }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Current Accommodation -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <i class="pi pi-home text-emerald-500"></i> Current Accommodation
          </h3>
          <div class="space-y-4">
            @for (field of accommodationFields(); track field.label) {
              <div class="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ field.label }}</span>
                <span class="text-sm font-semibold text-slate-800 dark:text-white">{{ field.value }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <i class="pi pi-phone text-rose-500"></i> Emergency Contact
          </h3>
          <div class="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <i class="pi pi-shield text-xl text-rose-500"></i>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-white">PG Manager</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">+91 98765 43210</p>
              </div>
            </div>
          </div>
          <p class="text-xs text-slate-400 mt-3">Available 24/7 for emergencies</p>
        </div>

        <!-- Quick Actions -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <i class="pi pi-bolt text-amber-500"></i> Account Actions
          </h3>
          <div class="space-y-3">
            <button pButton label="Edit Profile" icon="pi pi-pencil" (click)="editProfile()"
              class="p-button-outlined w-full rounded-xl justify-start"></button>
            <button pButton label="Change Password" icon="pi pi-lock" (click)="alert('Password change coming soon!')"
              class="p-button-outlined w-full rounded-xl justify-start"></button>
            <button pButton label="Download KYC Documents" icon="pi pi-download" (click)="alert('Download coming soon!')"
              class="p-button-outlined w-full rounded-xl justify-start"></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class ProfileComponent implements OnInit {
  private crudService = inject(CrudService);

  tenantName = signal('Tenant');
  checkInDate = signal('—');
  kycStatus = signal('Verified');
  personalFields = signal<{ label: string; value: string }[]>([]);
  accommodationFields = signal<{ label: string; value: string }[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const me = tenants.find((t: any) => t.status === 'Active') || tenants[0];
    if (!me) return;

    const name = me.fullName || `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'Tenant';
    this.tenantName.set(name);
    this.checkInDate.set(me.checkInDate || '—');
    this.kycStatus.set(me.kycStatus || 'Verified');

    this.personalFields.set([
      { label: 'Full Name', value: name },
      { label: 'Phone', value: me.phone || me.mobile || '+91 XXXXX XXXXX' },
      { label: 'Email', value: me.email || 'tenant@example.com' },
      { label: 'Gender', value: me.gender || 'Not specified' },
    ]);

    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    const property = properties.find((p: any) => p.id === me.propertyId);
    const room = rooms.find((r: any) => r.id === me.roomId);
    const bed = beds.find((b: any) => b.id === me.bedId);

    this.accommodationFields.set([
      { label: 'Property', value: property?.name || property?.propertyName || '—' },
      { label: 'Room Number', value: room?.roomNumber || room?.number || '—' },
      { label: 'Bed Number', value: bed?.bedNumber || bed?.number || '—' },
      { label: 'Check-in Date', value: me.checkInDate || '—' },
      { label: 'Monthly Rent', value: me.monthlyRent ? `₹${Number(me.monthlyRent).toLocaleString()}` : '—' },
    ]);
  }

  editProfile() {
    alert('Profile editing coming soon!');
  }

  alert(msg: string) {
    alert(msg);
  }
}
