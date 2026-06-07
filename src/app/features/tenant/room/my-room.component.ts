import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-my-room',
  standalone: true,
  imports: [CommonModule, PageHeader, Avatar, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="My Room" subtitle="Your accommodation details and room information" />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Room Info -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <i class="pi pi-home text-indigo-500"></i> Room Information
          </h3>
          <div class="space-y-4">
            @for (field of roomFields(); track field.label) {
              <div class="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ field.label }}</span>
                <span class="text-sm font-semibold text-slate-800 dark:text-white">{{ field.value }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Bed Assignment -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <i class="pi pi-th-large text-emerald-500"></i> Bed Assignment
          </h3>
          <div class="space-y-4">
            @for (field of bedFields(); track field.label) {
              <div class="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ field.label }}</span>
                <span class="text-sm font-semibold text-slate-800 dark:text-white">{{ field.value }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Roommates -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <i class="pi pi-users text-violet-500"></i> Roommates
          </h3>
          @if (roommates().length === 0) {
            <div class="flex flex-col items-center py-6 text-center">
              <i class="pi pi-user text-3xl text-slate-300 dark:text-slate-600 mb-2"></i>
              <p class="text-sm text-slate-400">No roommates assigned</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (mate of roommates(); track mate.id) {
                <div class="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                  <app-avatar [name]="mate.name" size="sm" />
                  <div>
                    <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ mate.name }}</p>
                    <p class="text-[11px] text-slate-400">{{ mate.phone }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Property Info -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
            <i class="pi pi-building text-teal-500"></i> Property Info
          </h3>
          <div class="space-y-4">
            @for (field of propertyFields(); track field.label) {
              <div class="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ field.label }}</span>
                <span class="text-sm font-semibold text-slate-800 dark:text-white">{{ field.value }}</span>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Amenities Grid -->
      <div class="glass-card p-6">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <i class="pi pi-star text-amber-500"></i> Amenities
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          @for (amenity of amenities; track amenity.name) {
            <div class="flex items-center gap-3 p-4 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30">
                <i [class]="'pi ' + amenity.icon + ' text-emerald-500'"></i>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ amenity.name }}</p>
                <p class="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <i class="pi pi-check"></i> Available
                </p>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Room Rules -->
      <div class="glass-card p-6">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
          <i class="pi pi-info-circle text-rose-500"></i> Room Rules
        </h3>
        <div class="space-y-3">
          @for (rule of roomRules; track rule; let i = $index) {
            <div class="flex items-start gap-3 p-3 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
              <span class="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{{ i + 1 }}</span>
              <p class="text-sm text-slate-700 dark:text-slate-300">{{ rule }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class MyRoomComponent implements OnInit {
  private crudService = inject(CrudService);

  roomFields = signal<{ label: string; value: string }[]>([]);
  bedFields = signal<{ label: string; value: string }[]>([]);
  roommates = signal<{ id: string; name: string; phone: string }[]>([]);
  propertyFields = signal<{ label: string; value: string }[]>([]);

  amenities = [
    { name: 'WiFi', icon: 'pi-wifi' },
    { name: 'AC', icon: 'pi-sun' },
    { name: 'Hot Water', icon: 'pi-bolt' },
    { name: 'Laundry', icon: 'pi-inbox' },
    { name: 'Meals', icon: 'pi-shopping-bag' },
    { name: 'CCTV', icon: 'pi-video' },
    { name: 'Parking', icon: 'pi-car' },
    { name: 'Gym', icon: 'pi-heart' },
  ];

  roomRules = [
    'No smoking inside the premises',
    'No loud music after 10 PM',
    'Visitors allowed till 8 PM only',
    'Keep your room clean and tidy',
    'Report any damages immediately to the manager',
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const me = tenants.find((t: any) => t.status === 'Active') || tenants[0];
    if (!me) return;

    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);

    const room = rooms.find((r: any) => r.id === me.roomId);
    const bed = beds.find((b: any) => b.id === me.bedId);
    const property = properties.find((p: any) => p.id === me.propertyId);

    this.roomFields.set([
      { label: 'Room Number', value: room?.roomNumber || room?.number || '—' },
      { label: 'Floor', value: room?.floor || room?.floorNumber || '—' },
      { label: 'Type', value: room?.type || 'Double Sharing' },
    ]);

    this.bedFields.set([
      { label: 'Bed Number', value: bed?.bedNumber || bed?.number || '—' },
      { label: 'Sharing Type', value: room?.type || room?.sharingType || 'Double Sharing' },
    ]);

    // Find roommates (other tenants with same roomId)
    const mates = tenants
      .filter((t: any) => t.roomId === me.roomId && t.id !== me.id)
      .map((t: any) => ({
        id: t.id,
        name: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Roommate',
        phone: t.phone || t.mobile || '—',
      }));
    this.roommates.set(mates);

    this.propertyFields.set([
      { label: 'Property Name', value: property?.name || property?.propertyName || '—' },
      { label: 'Location', value: property?.location || property?.address || '—' },
    ]);
  }
}
