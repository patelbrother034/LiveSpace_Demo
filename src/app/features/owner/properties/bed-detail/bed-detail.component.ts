import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-bed-detail',
  standalone: true,
  imports: [PageHeader, StatusBadge, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header [title]="'Bed ' + bed().label" [subtitle]="'Room ' + bed().roomNumber + ' · ' + bed().floorName + ' · ' + bed().buildingName">
        <div class="flex gap-2">
          @if (bed().status === 'Vacant') {
            <button pButton label="Assign Tenant" icon="pi pi-user-plus" class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white" (click)="assignTenant()"></button>
          }
          <button pButton label="Change Status" icon="pi pi-refresh" class="p-button-sm p-button-outlined rounded-xl border-indigo-300 text-indigo-600"></button>
        </div>
      </app-page-header>

      <!-- Bed Status Card -->
      <div class="glass-card overflow-hidden">
        <div class="h-32 relative" [class]="bed().status === 'Occupied' ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600' : bed().status === 'Vacant' ? 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-600' : bed().status === 'Reserved' ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600' : 'bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700'">
          <div class="absolute inset-0 bg-black/10"></div>
          <div class="absolute bottom-5 left-6">
            <h2 class="text-2xl font-bold text-white drop-shadow-md">Bed {{ bed().label }}</h2>
            <p class="text-sm text-white/80 mt-1">Monthly Rent: ₹{{ bed().monthlyRent.toLocaleString() }}</p>
          </div>
          <div class="absolute top-4 right-4"><app-status-badge [status]="bed().status" /></div>
        </div>
        <div class="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Room</p><p class="text-lg font-bold text-slate-800 dark:text-white mt-1">{{ bed().roomNumber }}</p></div>
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Floor</p><p class="text-lg font-bold text-slate-800 dark:text-white mt-1">{{ bed().floorName }}</p></div>
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Building</p><p class="text-lg font-bold text-slate-800 dark:text-white mt-1">{{ bed().buildingName }}</p></div>
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Room Type</p><p class="text-lg font-bold text-indigo-600 mt-1">{{ bed().roomType }}</p></div>
        </div>
      </div>

      <!-- Tenant Info (if occupied) -->
      @if (bed().tenant) {
        <div class="glass-card p-6 space-y-4">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-user text-indigo-500 mr-2"></i>Current Tenant</h3>
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {{ bed().tenant!.name.charAt(0) }}
            </div>
            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div><p class="text-xs text-slate-400">Full Name</p><p class="font-semibold text-slate-800 dark:text-white">{{ bed().tenant!.name }}</p></div>
              <div><p class="text-xs text-slate-400">Phone</p><p class="font-semibold text-slate-800 dark:text-white">{{ bed().tenant!.phone }}</p></div>
              <div><p class="text-xs text-slate-400">Email</p><p class="font-semibold text-slate-800 dark:text-white">{{ bed().tenant!.email }}</p></div>
              <div><p class="text-xs text-slate-400">Check-in Date</p><p class="font-semibold text-slate-800 dark:text-white">{{ bed().tenant!.checkInDate }}</p></div>
              <div><p class="text-xs text-slate-400">Lease End</p><p class="font-semibold text-slate-800 dark:text-white">{{ bed().tenant!.leaseEnd }}</p></div>
              <div><p class="text-xs text-slate-400">Rent Status</p>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold" [class]="bed().tenant!.rentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">{{ bed().tenant!.rentStatus }}</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Bed History -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-history text-indigo-500 mr-2"></i>Bed History</h3>
        <div class="space-y-3">
          @for (event of history(); track $index) {
            <div class="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                [class]="event.type === 'checkin' ? 'bg-emerald-100 text-emerald-600' : event.type === 'checkout' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'">
                <i [class]="event.type === 'checkin' ? 'pi pi-sign-in text-xs' : event.type === 'checkout' ? 'pi pi-sign-out text-xs' : 'pi pi-wrench text-xs'"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ event.title }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ event.description }}</p>
              </div>
              <span class="text-xs text-slate-400 shrink-0">{{ event.date }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class BedDetailComponent {
  private router = inject(Router);

  bed = signal<{
    id: string; label: string; roomNumber: string; floorName: string; buildingName: string; roomType: string;
    status: string; monthlyRent: number; tenant?: { name: string; phone: string; email: string; checkInDate: string; leaseEnd: string; rentStatus: string };
  }>({
    id: 'bed-001', label: 'G01-A', roomNumber: 'G01', floorName: 'Ground Floor', buildingName: 'Building A', roomType: 'Triple Sharing',
    status: 'Occupied', monthlyRent: 8000,
    tenant: { name: 'Rahul Sharma', phone: '+91 9876543210', email: 'rahul@email.com', checkInDate: 'Jan 15, 2026', leaseEnd: 'Jan 14, 2027', rentStatus: 'Paid' }
  });

  history = signal([
    { type: 'checkin', title: 'Rahul Sharma checked in', description: 'Assigned to Bed G01-A with 12-month lease', date: 'Jan 15, 2026' },
    { type: 'checkout', title: 'Previous tenant checked out', description: 'Deepak Verma completed stay, deposit refunded', date: 'Jan 10, 2026' },
    { type: 'maintenance', title: 'Bed maintenance completed', description: 'Mattress replaced, deep cleaning done', date: 'Jan 12, 2026' },
    { type: 'checkin', title: 'Deepak Verma checked in', description: 'Assigned to Bed G01-A with 6-month lease', date: 'Jul 05, 2025' },
  ]);

  assignTenant() { this.router.navigate(['/owner/tenants/check-in']); }
}
