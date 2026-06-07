import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface PGProperty {
  id: string;
  name: string;
  type: string;
  address: { street: string; city: string };
  totalBeds: number;
  occupiedBeds: number;
}

interface Room {
  id: string;
  roomNumber: string;
  sharingType?: string;
  type: string;
  monthlyRent: number;
  status: string;
  propertyId: string;
}

interface RoomAudit {
  id: string;
  roomId: string;
  caretakerName: string;
  locksWorking: boolean;
  electricityWorking: boolean;
  plumbingWorking: boolean;
  cleanlinessOk: boolean;
  notes: string;
  timestamp: string;
}

@Component({
  selector: 'app-caretaker-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, DialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Property Operations" subtitle="Manage rooms, audit systems, and monitor building status" />

      <!-- Property Info Banner -->
      <div class="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        @if (selectedProperty()) {
          <div class="space-y-1">
            <p class="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Active Hub</p>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{ selectedProperty()!.name }}</h3>
            <p class="text-xs text-slate-500">{{ selectedProperty()!.address.street }}, {{ selectedProperty()!.address.city }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Occupancy Rate</p>
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">
              {{ selectedProperty()!.occupiedBeds }} / {{ selectedProperty()!.totalBeds }} Beds
            </h3>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-500 h-full" [style.width.%]="(selectedProperty()!.occupiedBeds / selectedProperty()!.totalBeds) * 100"></div>
            </div>
          </div>
          <div class="flex md:justify-end">
            <button pButton label="Add Room" icon="pi pi-plus" (click)="alertMock()"
              class="p-button-sm rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 shadow-md">
            </button>
          </div>
        }
      </div>

      <!-- Room Lists and Floors Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Room Directory -->
        <div class="xl:col-span-2 space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Room Directory</h4>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500">Floor:</span>
              <select [(ngModel)]="activeFloor"
                class="p-1 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
                <option value="1">1st Floor</option>
                <option value="2">2nd Floor</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (r of filteredRooms(); track r.id) {
              <div class="glass-card p-5 space-y-4 hover:border-indigo-500/20 transition-all">
                <div class="flex justify-between items-start">
                  <div>
                    <h5 class="text-base font-bold text-slate-800 dark:text-white">Room {{ r.roomNumber }}</h5>
                    <p class="text-xs text-slate-500">{{ r.sharingType || r.type }} sharing</p>
                  </div>
                  <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide"
                    [class]="r.status === 'Clean' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 
                             r.status === 'Dirty' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 
                             'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'">
                    {{ r.status }}
                  </span>
                </div>

                <div class="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span>Base rent:</span>
                  <span class="font-bold text-slate-800 dark:text-white">₹{{ r.monthlyRent | number:'1.0-0' }} / mo</span>
                </div>

                <div class="flex gap-2 pt-1">
                  <button pButton label="Audit System" icon="pi pi-cog" (click)="openAudit(r)"
                    class="w-full p-button-xs p-button-outlined rounded-lg text-xs py-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  </button>
                  <button pButton label="Cleaned" icon="pi pi-check" (click)="markRoomClean(r.id)"
                    [disabled]="r.status === 'Clean'"
                    class="w-full p-button-xs rounded-lg text-xs py-1.5 bg-emerald-500 border-none text-white hover:bg-emerald-600">
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Audit History Log -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Audit Operations Trail</h4>
          
          <div class="glass-card p-5 space-y-4 max-h-[460px] overflow-y-auto">
            @for (audit of auditLogs(); track audit.id) {
              <div class="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-2 text-xs">
                <div class="flex justify-between items-center">
                  <span class="font-extrabold text-indigo-500">Room {{ getRoomNumber(audit.roomId) }}</span>
                  <span class="text-[9px] text-slate-400">{{ audit.timestamp | date:'shortTime' }}</span>
                </div>
                <p class="text-slate-600 dark:text-slate-400 line-clamp-2">"{{ audit.notes || 'No issues found during audit.' }}"</p>
                <div class="flex flex-wrap gap-1.5 pt-1 text-[9px] font-bold">
                  <span class="px-1.5 py-0.5 rounded" [class]="audit.locksWorking ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">Locks</span>
                  <span class="px-1.5 py-0.5 rounded" [class]="audit.electricityWorking ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">Power</span>
                  <span class="px-1.5 py-0.5 rounded" [class]="audit.plumbingWorking ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">Water</span>
                </div>
              </div>
            } @empty {
              <p class="text-xs text-slate-400 italic text-center py-6">No systems audit logged today.</p>
            }
          </div>
        </div>

      </div>

      <!-- Audit Dialog Modal -->
      <p-dialog [(visible)]="auditDialog" [header]="'Audit Report: Room ' + (selectedAuditRoom()?.roomNumber || '')"
        [modal]="true" [style]="{width: '420px'}" styleClass="rounded-2xl dark:bg-slate-900">
        <div class="space-y-4 p-2 text-xs">
          
          <div class="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span class="font-bold text-slate-700 dark:text-slate-300">Smart Lock functioning properly?</span>
            <input type="checkbox" [(ngModel)]="auditLocks" class="h-4 w-4 rounded text-indigo-600">
          </div>

          <div class="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span class="font-bold text-slate-700 dark:text-slate-300">Electrical & Switchboard OK?</span>
            <input type="checkbox" [(ngModel)]="auditElectricity" class="h-4 w-4 rounded text-indigo-600">
          </div>

          <div class="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span class="font-bold text-slate-700 dark:text-slate-300">Water & Taps leakage clear?</span>
            <input type="checkbox" [(ngModel)]="auditPlumbing" class="h-4 w-4 rounded text-indigo-600">
          </div>

          <div class="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <span class="font-bold text-slate-700 dark:text-slate-300">Room cleanliness matches standards?</span>
            <input type="checkbox" [(ngModel)]="auditCleanliness" class="h-4 w-4 rounded text-indigo-600">
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700 dark:text-slate-300">Audit Remarks / Issues logged</label>
            <textarea [(ngModel)]="auditNotes" placeholder="Describe any issues..." rows="3"
              class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500"></textarea>
          </div>

          <div class="flex gap-3 justify-end pt-3">
            <button pButton label="Cancel" class="p-button-text p-button-sm text-slate-500" (click)="auditDialog = false"></button>
            <button pButton label="Save Audit" class="p-button-sm rounded-xl bg-indigo-500 border-none text-white" (click)="saveAudit()"></button>
          </div>

        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class CaretakerProperties implements OnInit {
  private crudService = inject(CrudService);

  selectedProperty = signal<PGProperty | null>(null);
  rooms = signal<Room[]>([]);
  auditLogs = signal<RoomAudit[]>([]);

  activeFloor = '1';
  
  // Dialog Variables
  auditDialog = false;
  selectedAuditRoom = signal<Room | null>(null);
  auditLocks = true;
  auditElectricity = true;
  auditPlumbing = true;
  auditCleanliness = true;
  auditNotes = '';

  filteredRooms = computed(() => {
    return this.rooms().filter(r => r.id.includes(`floor-${this.activeFloor}`));
  });

  ngOnInit() {
    this.loadPropertyData();
  }

  loadPropertyData() {
    const props = this.crudService.getAll<PGProperty>(StorageKeys.PROPERTIES);
    const mainProp = props.find(p => p.id === 'prop-001') || props[0];
    if (mainProp) {
      this.selectedProperty.set(mainProp);
    }

    const listRooms = this.crudService.getAll<Room>(StorageKeys.ROOMS);
    this.rooms.set(listRooms.filter(r => r.propertyId === 'prop-001'));

    // Load audit logs
    const audits = localStorage.getItem('lsp_room_audits');
    this.auditLogs.set(audits ? JSON.parse(audits) : []);
  }

  markRoomClean(roomId: string) {
    const list = this.crudService.getAll<Room>(StorageKeys.ROOMS);
    const idx = list.findIndex(r => r.id === roomId);
    if (idx !== -1) {
      list[idx].status = 'Clean';
      localStorage.setItem(StorageKeys.ROOMS, JSON.stringify(list));
      this.loadPropertyData();
    }
  }

  openAudit(room: Room) {
    this.selectedAuditRoom.set(room);
    this.auditLocks = true;
    this.auditElectricity = true;
    this.auditPlumbing = true;
    this.auditCleanliness = true;
    this.auditNotes = '';
    this.auditDialog = true;
  }

  saveAudit() {
    if (!this.selectedAuditRoom()) return;

    const newAudit: RoomAudit = {
      id: 'aud-' + Math.random().toString(36).substring(7),
      roomId: this.selectedAuditRoom()!.id,
      caretakerName: 'Suresh Kumar',
      locksWorking: this.auditLocks,
      electricityWorking: this.auditElectricity,
      plumbingWorking: this.auditPlumbing,
      cleanlinessOk: this.auditCleanliness,
      notes: this.auditNotes,
      timestamp: new Date().toISOString()
    };

    // If cleanliness check failed, mark room as Dirty
    if (!this.auditCleanliness) {
      const list = this.crudService.getAll<Room>(StorageKeys.ROOMS);
      const idx = list.findIndex(r => r.id === this.selectedAuditRoom()!.id);
      if (idx !== -1) {
        list[idx].status = 'Dirty';
        localStorage.setItem(StorageKeys.ROOMS, JSON.stringify(list));
      }
    }

    const currentAudits = this.auditLogs();
    currentAudits.unshift(newAudit);
    localStorage.setItem('lsp_room_audits', JSON.stringify(currentAudits));
    this.auditLogs.set(currentAudits);

    this.auditDialog = false;
    this.loadPropertyData();
    alert('Systems audit logged successfully!');
  }

  getRoomNumber(roomId: string): string {
    const room = this.rooms().find(r => r.id === roomId);
    return room ? room.roomNumber : roomId.replace('room-', '').toUpperCase();
  }

  alertMock() {
    alert('Franchise limit reached! Please contact the Super Admin or upgrade your subscription plan to add new rooms.');
  }
}
