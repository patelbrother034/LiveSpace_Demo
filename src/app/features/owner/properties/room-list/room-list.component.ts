import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

interface Room { id: string; roomNumber: string; floorName: string; buildingName: string; type: string; totalBeds: number; occupiedBeds: number; vacantBeds: number; monthlyRent: number; amenities: string[]; status: string; }

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [FormsModule, PageHeader, StatusBadge, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Rooms" subtitle="Room inventory with bed status colors">
        <button pButton label="Add Room" icon="pi pi-plus" class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white"></button>
      </app-page-header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <div class="glass-card p-5"><p class="text-xs font-semibold text-slate-400 uppercase">Total Rooms</p><p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ rooms().length }}</p></div>
        <div class="glass-card p-5"><p class="text-xs font-semibold text-slate-400 uppercase">Single</p><p class="text-2xl font-extrabold text-blue-600 mt-1">{{ roomsByType('Single') }}</p></div>
        <div class="glass-card p-5"><p class="text-xs font-semibold text-slate-400 uppercase">Double</p><p class="text-2xl font-extrabold text-purple-600 mt-1">{{ roomsByType('Double') }}</p></div>
        <div class="glass-card p-5"><p class="text-xs font-semibold text-slate-400 uppercase">Triple</p><p class="text-2xl font-extrabold text-orange-600 mt-1">{{ roomsByType('Triple') }}</p></div>
      </div>

      <div class="glass-card p-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="relative w-full sm:w-80">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="text" pInputText placeholder="Search rooms..." class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 text-xs text-slate-500"><span class="w-3 h-3 rounded-full bg-emerald-500"></span>Occupied</div>
            <div class="flex items-center gap-1.5 text-xs text-slate-500"><span class="w-3 h-3 rounded-full bg-red-500"></span>Vacant</div>
            <div class="flex items-center gap-1.5 text-xs text-slate-500"><span class="w-3 h-3 rounded-full bg-amber-500"></span>Notice</div>
            <div class="flex items-center gap-1.5 text-xs text-slate-500"><span class="w-3 h-3 rounded-full bg-slate-400"></span>Maintenance</div>
          </div>
        </div>
      </div>

      <!-- Room Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
        @for (room of filteredRooms(); track room.id) {
          <div class="glass-card overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer" (click)="navigateToDetail(room.id)">
            <div class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{{ room.roomNumber }}</div>
                  <div>
                    <p class="font-bold text-slate-800 dark:text-white text-sm">Room {{ room.roomNumber }}</p>
                    <p class="text-[10px] text-slate-400">{{ room.floorName }} · {{ room.buildingName }}</p>
                  </div>
                </div>
                <app-status-badge [status]="room.status" />
              </div>

              <!-- Bed Status Visualization -->
              <div class="flex flex-wrap gap-2">
                @for (i of getBedArray(room); track $index) {
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all"
                    [class]="i === 'occupied' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : i === 'vacant' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'"
                    [pTooltip]="i === 'occupied' ? 'Occupied' : i === 'vacant' ? 'Vacant' : 'Maintenance'" tooltipPosition="top">
                    <i [class]="i === 'occupied' ? 'pi pi-user text-xs' : i === 'vacant' ? 'pi pi-minus text-xs' : 'pi pi-wrench text-xs'"></i>
                  </div>
                }
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">{{ room.type }}</span>
                <span class="font-semibold text-sm text-slate-800 dark:text-white">₹{{ room.monthlyRent.toLocaleString() }}/bed</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class RoomListComponent {
  private router = inject(Router);
  searchQuery = signal('');

  rooms = signal<Room[]>([
    { id: 'rm-001', roomNumber: 'G01', floorName: 'Ground Floor', buildingName: 'Building A', type: 'Triple', totalBeds: 3, occupiedBeds: 3, vacantBeds: 0, monthlyRent: 8000, amenities: ['AC', 'WiFi', 'Attached Bath'], status: 'Active' },
    { id: 'rm-002', roomNumber: 'G02', floorName: 'Ground Floor', buildingName: 'Building A', type: 'Double', totalBeds: 2, occupiedBeds: 1, vacantBeds: 1, monthlyRent: 10000, amenities: ['AC', 'WiFi', 'Attached Bath'], status: 'Active' },
    { id: 'rm-003', roomNumber: 'G03', floorName: 'Ground Floor', buildingName: 'Building A', type: 'Triple', totalBeds: 3, occupiedBeds: 3, vacantBeds: 0, monthlyRent: 7500, amenities: ['WiFi', 'Common Bath'], status: 'Active' },
    { id: 'rm-004', roomNumber: '101', floorName: 'First Floor', buildingName: 'Building A', type: 'Single', totalBeds: 1, occupiedBeds: 1, vacantBeds: 0, monthlyRent: 15000, amenities: ['AC', 'WiFi', 'Attached Bath', 'Balcony'], status: 'Active' },
    { id: 'rm-005', roomNumber: '102', floorName: 'First Floor', buildingName: 'Building A', type: 'Double', totalBeds: 2, occupiedBeds: 2, vacantBeds: 0, monthlyRent: 9500, amenities: ['AC', 'WiFi', 'Attached Bath'], status: 'Active' },
    { id: 'rm-006', roomNumber: '103', floorName: 'First Floor', buildingName: 'Building A', type: 'Triple', totalBeds: 3, occupiedBeds: 2, vacantBeds: 1, monthlyRent: 7500, amenities: ['WiFi'], status: 'Active' },
    { id: 'rm-007', roomNumber: '201', floorName: 'Second Floor', buildingName: 'Building A', type: 'Double', totalBeds: 2, occupiedBeds: 2, vacantBeds: 0, monthlyRent: 9000, amenities: ['AC', 'WiFi'], status: 'Active' },
    { id: 'rm-008', roomNumber: '202', floorName: 'Second Floor', buildingName: 'Building A', type: 'Triple', totalBeds: 3, occupiedBeds: 2, vacantBeds: 0, monthlyRent: 7000, amenities: ['WiFi'], status: 'Maintenance' },
  ]);

  filteredRooms = computed(() => { const q = this.searchQuery().toLowerCase(); if (!q) return this.rooms(); return this.rooms().filter(r => r.roomNumber.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.floorName.toLowerCase().includes(q)); });
  roomsByType(type: string): number { return this.rooms().filter(r => r.type === type).length; }

  getBedArray(room: Room): string[] {
    const arr: string[] = [];
    for (let i = 0; i < room.occupiedBeds; i++) arr.push('occupied');
    for (let i = 0; i < room.vacantBeds; i++) arr.push('vacant');
    const maint = room.totalBeds - room.occupiedBeds - room.vacantBeds;
    for (let i = 0; i < maint; i++) arr.push('maintenance');
    return arr;
  }

  navigateToDetail(id: string) { this.router.navigate(['/owner/properties/prop-001/rooms', id]); }
}
