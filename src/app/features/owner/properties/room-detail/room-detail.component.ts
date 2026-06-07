import { Component, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

interface BedInRoom { id: string; label: string; status: string; tenantName?: string; tenantPhone?: string; checkInDate?: string; rentStatus?: string; monthlyRent: number; }

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [PageHeader, StatusBadge, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header [title]="'Room ' + room().roomNumber" [subtitle]="room().floorName + ' · ' + room().buildingName">
        <button pButton label="Edit Room" icon="pi pi-pencil" class="p-button-sm p-button-outlined rounded-xl border-indigo-300 text-indigo-600"></button>
      </app-page-header>

      <!-- Room Info Card -->
      <div class="glass-card p-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Room No</p><p class="text-xl font-bold text-slate-800 dark:text-white mt-1">{{ room().roomNumber }}</p></div>
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Type</p><p class="text-xl font-bold text-indigo-600 mt-1">{{ room().type }}</p></div>
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Floor</p><p class="text-xl font-bold text-slate-800 dark:text-white mt-1">{{ room().floorName }}</p></div>
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Total Beds</p><p class="text-xl font-bold text-slate-800 dark:text-white mt-1">{{ room().totalBeds }}</p></div>
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Rent/Bed</p><p class="text-xl font-bold text-emerald-600 mt-1">₹{{ room().monthlyRent.toLocaleString() }}</p></div>
          <div><p class="text-xs text-slate-400 uppercase font-semibold">Status</p><div class="mt-1"><app-status-badge [status]="room().status" /></div></div>
        </div>
      </div>

      <!-- Amenities -->
      <div class="glass-card p-6">
        <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-3"><i class="pi pi-star text-amber-500 mr-2"></i>Amenities</h3>
        <div class="flex flex-wrap gap-2">
          @for (a of room().amenities; track a) {
            <span class="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">{{ a }}</span>
          }
        </div>
      </div>

      <!-- Bed Layout -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-th-large text-indigo-500 mr-2"></i>Bed Layout</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (bed of beds(); track bed.id) {
            <div class="p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md"
              [class]="bed.status === 'Occupied' ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/10' : bed.status === 'Vacant' ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10' : 'border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/30'"
              (click)="navigateToBed(bed.id)">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
                    [class]="bed.status === 'Occupied' ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200' : bed.status === 'Vacant' ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">
                    <i [class]="bed.status === 'Occupied' ? 'pi pi-user' : bed.status === 'Vacant' ? 'pi pi-minus' : 'pi pi-wrench'"></i>
                  </div>
                  <span class="font-bold text-sm text-slate-800 dark:text-white">{{ bed.label }}</span>
                </div>
                <app-status-badge [status]="bed.status" />
              </div>
              @if (bed.tenantName) {
                <div class="space-y-1 text-xs">
                  <p class="font-semibold text-slate-700 dark:text-slate-300"><i class="pi pi-user mr-1 text-[10px]"></i>{{ bed.tenantName }}</p>
                  <p class="text-slate-400"><i class="pi pi-phone mr-1 text-[10px]"></i>{{ bed.tenantPhone }}</p>
                  <p class="text-slate-400"><i class="pi pi-calendar mr-1 text-[10px]"></i>Since {{ bed.checkInDate }}</p>
                  <div class="mt-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold"
                      [class]="bed.rentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                      Rent: {{ bed.rentStatus }}
                    </span>
                  </div>
                </div>
              } @else {
                <p class="text-xs text-slate-400 italic">No tenant assigned</p>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class RoomDetailComponent {
  private router = inject(Router);

  room = signal({ roomNumber: 'G01', type: 'Triple', floorName: 'Ground Floor', buildingName: 'Building A', totalBeds: 3, monthlyRent: 8000, status: 'Active', amenities: ['AC', 'WiFi', 'Attached Bathroom', 'Cupboard', 'Study Table'] });

  beds = signal<BedInRoom[]>([
    { id: 'bed-001', label: 'G01-A', status: 'Occupied', tenantName: 'Rahul Sharma', tenantPhone: '9876543210', checkInDate: 'Jan 15, 2026', rentStatus: 'Paid', monthlyRent: 8000 },
    { id: 'bed-002', label: 'G01-B', status: 'Occupied', tenantName: 'Amit Kumar', tenantPhone: '9876543211', checkInDate: 'Feb 01, 2026', rentStatus: 'Pending', monthlyRent: 8000 },
    { id: 'bed-003', label: 'G01-C', status: 'Vacant', monthlyRent: 8000 },
  ]);

  navigateToBed(id: string) { this.router.navigate(['/owner/properties/prop-001/beds', id]); }
}
