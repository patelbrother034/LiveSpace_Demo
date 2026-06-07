import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

interface Room {
  id: string;
  roomNumber: string;
  propertyId: string;
}

interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: string;
}

interface Tenant {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  propertyId: string;
  roomId: string;
  bedId: string;
  monthlyRent: number;
  securityDeposit: number;
  pendingDues: number;
  paymentStatus: string;
  status: string;
}

@Component({
  selector: 'app-caretaker-check-in-out',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, SelectModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Check-In & Check-Out" subtitle="Manage seamless student admissions and check-outs" />

      <!-- Mode Selector Tabs -->
      <div class="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-0.5">
        <button (click)="mode.set('checkin')"
          class="pb-3 text-sm font-bold border-b-2 bg-transparent border-none cursor-pointer transition-all px-4"
          [class]="mode() === 'checkin' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'">
          Check-In Tenant
        </button>
        <button (click)="mode.set('checkout')"
          class="pb-3 text-sm font-bold border-b-2 bg-transparent border-none cursor-pointer transition-all px-4"
          [class]="mode() === 'checkout' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'">
          Check-Out Tenant
        </button>
      </div>

      <!-- CHECK-IN SECTION -->
      @if (mode() === 'checkin') {
        <div class="grid grid-cols-1 xl:grid-cols-5 gap-8 animate-fade-in">
          
          <!-- Check-in Form -->
          <div class="xl:col-span-3 glass-card p-6 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Resident Details</h4>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">First Name</label>
                <input type="text" [(ngModel)]="inFirstName" placeholder="Enter first name"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Last Name</label>
                <input type="text" [(ngModel)]="inLastName" placeholder="Enter last name"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Phone Number</label>
                <input type="text" [(ngModel)]="inPhone" placeholder="10-digit contact number"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
                <input type="email" [(ngModel)]="inEmail" placeholder="Enter email"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Monthly Rent (₹)</label>
                <input type="number" [(ngModel)]="inRent"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Security Deposit (₹)</label>
                <input type="number" [(ngModel)]="inDeposit"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button pButton label="Complete Admission Check-In" icon="pi pi-check" (click)="saveCheckIn()"
                [disabled]="!isCheckInValid()"
                class="rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 border-none text-white hover:opacity-90 shadow-md">
              </button>
            </div>
          </div>

          <!-- Bed Allocation Grid -->
          <div class="xl:col-span-2 glass-card p-6 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Visual Bed Selector</h4>
            
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Select Room</label>
              <select [(ngModel)]="selectedRoomId" (change)="onRoomSelected()"
                class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
                <option value="">-- Select Room --</option>
                @for (rm of rooms(); track rm.id) {
                  <option [value]="rm.id">Room {{ rm.roomNumber }}</option>
                }
              </select>
            </div>

            @if (selectedRoomId) {
              <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-400">Click a vacant green bed to select:</p>
                
                <div class="grid grid-cols-2 gap-4">
                  @for (bd of roomBeds(); track bd.id) {
                    <div (click)="selectBed(bd)"
                      class="p-4 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                      [class]="bd.status === 'Occupied' ? 'bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400 cursor-not-allowed' : 
                               selectedBedId() === bd.id ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 
                               'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-600 hover:scale-[1.02]'">
                      <i class="pi pi-box text-xl" [class]="bd.status === 'Occupied' ? 'text-slate-400' : selectedBedId() === bd.id ? 'text-white' : 'text-emerald-500'"></i>
                      <div>
                        <h5 class="text-xs font-bold">{{ bd.bedNumber.toUpperCase() }}</h5>
                        <p class="text-[9px] font-semibold mt-0.5">{{ bd.status }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="h-48 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 italic">
                Choose a room first to see available beds.
              </div>
            }
          </div>

        </div>
      }

      <!-- CHECK-OUT SECTION -->
      @if (mode() === 'checkout') {
        <div class="max-w-2xl mx-auto glass-card p-6 space-y-5 animate-fade-in">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Tenant Check-Out Checklists</h4>

          <div class="space-y-1">
            <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Select Resident</label>
            <select [(ngModel)]="outTenantId" (change)="onOutTenantSelected()"
              class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
              <option value="">-- Select Resident --</option>
              @for (t of activeTenants(); track t.id) {
                <option [value]="t.id">{{ t.fullName }} (Room {{ getRoomNumber(t.roomId) }} · Bed {{ getBedNumber(t.bedId) }})</option>
              }
            </select>
          </div>

          @if (outTenantId) {
            <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fade-in text-xs">
              
              <!-- Check Dues -->
              <div class="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <h5 class="font-bold text-slate-700 dark:text-slate-300">Financial outstanding clearance</h5>
                  <p class="text-[10px] text-slate-500">Must have zero outstanding dues before check-out.</p>
                </div>
                <span class="font-bold text-sm" [class]="outDues() > 0 ? 'text-red-500' : 'text-emerald-500'">
                  {{ outDues() > 0 ? '₹' + outDues() + ' Pending' : 'Clear (₹0)' }}
                </span>
              </div>

              <!-- Checklists -->
              <div class="space-y-3">
                <h5 class="font-bold text-slate-800 dark:text-white">Verification Checklist:</h5>
                
                <div class="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-slate-600 dark:text-slate-400">Door keys, drawer keys, and wardrobe locks returned?</span>
                  <input type="checkbox" [(ngModel)]="outKeys" class="h-4 w-4 rounded text-indigo-600">
                </div>

                <div class="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-slate-600 dark:text-slate-400">Bed, mattress, and study table damage inspection complete?</span>
                  <input type="checkbox" [(ngModel)]="outDamage" class="h-4 w-4 rounded text-indigo-600">
                </div>

                <div class="flex justify-between items-center p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-slate-600 dark:text-slate-400">Personal belongings cleared and trash disposed?</span>
                  <input type="checkbox" [(ngModel)]="outClean" class="h-4 w-4 rounded text-indigo-600">
                </div>
              </div>

              <div class="flex gap-3 justify-end pt-3">
                <button pButton label="Cancel" class="p-button-text p-button-sm text-slate-500" (click)="resetCheckout()"></button>
                <button pButton label="Complete Checkout & Refund Deposit" 
                  [disabled]="!isCheckoutValid()" (click)="saveCheckOut()"
                  class="rounded-xl bg-red-500 border-none text-white hover:bg-red-600 shadow-md">
                </button>
              </div>

            </div>
          }
        </div>
      }

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
export class CaretakerCheckInOut implements OnInit {
  private crudService = inject(CrudService);

  mode = signal<'checkin' | 'checkout'>('checkin');

  rooms = signal<Room[]>([]);
  allBeds = signal<Bed[]>([]);
  activeTenants = signal<Tenant[]>([]);

  // Check-In Form signal/model
  inFirstName = '';
  inLastName = '';
  inPhone = '';
  inEmail = '';
  inRent = 8500;
  inDeposit = 15000;
  selectedRoomId = '';
  selectedBedId = signal('');
  roomBeds = signal<Bed[]>([]);

  // Check-Out Model
  outTenantId = '';
  outDues = signal(0);
  outKeys = false;
  outDamage = false;
  outClean = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const listRooms = this.crudService.getAll<Room>(StorageKeys.ROOMS);
    this.rooms.set(listRooms.filter(r => r.propertyId === 'prop-001'));

    const listBeds = this.crudService.getAll<Bed>(StorageKeys.BEDS);
    this.allBeds.set(listBeds.filter(b => b.id.includes('prop-001') || b.id.startsWith('bed-')));

    const listTenants = this.crudService.getAll<Tenant>(StorageKeys.TENANTS);
    this.activeTenants.set(listTenants.filter(t => t.propertyId === 'prop-001' && t.status === 'Active'));
  }

  onRoomSelected() {
    if (!this.selectedRoomId) {
      this.roomBeds.set([]);
      this.selectedBedId.set('');
      return;
    }
    const filtered = this.allBeds().filter(b => b.roomId === this.selectedRoomId);
    this.roomBeds.set(filtered);
    this.selectedBedId.set('');
  }

  selectBed(bed: Bed) {
    if (bed.status === 'Occupied') return;
    this.selectedBedId.set(bed.id);
  }

  isCheckInValid(): boolean {
    return (
      !!this.inFirstName.trim() &&
      !!this.inLastName.trim() &&
      !!this.inPhone.trim() &&
      !!this.inEmail.trim() &&
      this.inRent > 0 &&
      !!this.selectedRoomId &&
      !!this.selectedBedId()
    );
  }

  saveCheckIn() {
    if (!this.isCheckInValid()) return;

    // 1. Create Tenant
    const newTenant: Omit<Tenant, 'id'> = {
      fullName: `${this.inFirstName} ${this.inLastName}`,
      firstName: this.inFirstName,
      lastName: this.inLastName,
      phone: this.inPhone,
      email: this.inEmail,
      propertyId: 'prop-001',
      roomId: this.selectedRoomId,
      bedId: this.selectedBedId(),
      monthlyRent: this.inRent,
      securityDeposit: this.inDeposit,
      pendingDues: 0,
      paymentStatus: 'Paid',
      status: 'Active'
    };

    const createdTenant = this.crudService.create<Tenant>(StorageKeys.TENANTS, newTenant);

    // 2. Set Bed Occupancy in lsp_beds
    const listBeds = this.crudService.getAll<any>(StorageKeys.BEDS);
    const idx = listBeds.findIndex((b: any) => b.id === this.selectedBedId());
    if (idx !== -1) {
      listBeds[idx].status = 'Occupied';
      listBeds[idx].tenantId = createdTenant.id;
      localStorage.setItem(StorageKeys.BEDS, JSON.stringify(listBeds));
    }

    // Reset fields
    this.inFirstName = '';
    this.inLastName = '';
    this.inPhone = '';
    this.inEmail = '';
    this.selectedRoomId = '';
    this.selectedBedId.set('');
    
    this.loadData();
    alert('Tenant checked in successfully! Bed allocation complete.');
  }

  onOutTenantSelected() {
    const selected = this.activeTenants().find(t => t.id === this.outTenantId);
    if (selected) {
      this.outDues.set(selected.pendingDues);
    } else {
      this.outDues.set(0);
    }
    this.outKeys = false;
    this.outDamage = false;
    this.outClean = false;
  }

  isCheckoutValid(): boolean {
    return (
      !!this.outTenantId &&
      this.outDues() === 0 &&
      this.outKeys &&
      this.outDamage &&
      this.outClean
    );
  }

  saveCheckOut() {
    if (!this.isCheckoutValid()) return;

    const listTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const tenantIdx = listTenants.findIndex((t: any) => t.id === this.outTenantId);
    
    if (tenantIdx !== -1) {
      const tenant = listTenants[tenantIdx];
      tenant.status = 'CheckedOut';
      tenant.checkOutDate = new Date().toISOString().split('T')[0];
      
      // Free up bed
      const listBeds = this.crudService.getAll<any>(StorageKeys.BEDS);
      const bedIdx = listBeds.findIndex((b: any) => b.id === tenant.bedId);
      if (bedIdx !== -1) {
        listBeds[bedIdx].status = 'Vacant';
        listBeds[bedIdx].tenantId = null;
        localStorage.setItem(StorageKeys.BEDS, JSON.stringify(listBeds));
      }

      localStorage.setItem(StorageKeys.TENANTS, JSON.stringify(listTenants));
    }

    this.resetCheckout();
    this.loadData();
    alert('Tenant checked out successfully! Bed freed up.');
  }

  resetCheckout() {
    this.outTenantId = '';
    this.outDues.set(0);
    this.outKeys = false;
    this.outDamage = false;
    this.outClean = false;
  }

  getRoomNumber(roomId: string): string {
    const room = this.rooms().find(r => r.id === roomId);
    return room ? room.roomNumber : roomId.replace('room-', '').toUpperCase();
  }

  getBedNumber(bedId: string): string {
    const bed = this.allBeds().find(b => b.id === bedId);
    return bed ? bed.bedNumber.toUpperCase() : bedId.replace('bed-', '').toUpperCase();
  }
}
