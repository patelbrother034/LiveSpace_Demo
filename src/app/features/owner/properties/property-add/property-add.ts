import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { PropertyType } from '../../../../core/models/enums/property-type.enum';
import { Gender } from '../../../../core/models/enums/gender.enum';
import { RoomType } from '../../../../core/models/enums/room-type.enum';
import { BedStatus } from '../../../../core/models/enums/bed-status.enum';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-property-add',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-extrabold bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent">
          Add New Property
        </h1>
        <p class="text-slate-500 dark:text-slate-400">Configure your physical living space hierarchy</p>
      </div>

      <!-- Step Progress Header -->
      <div class="glass-card p-4 flex items-center justify-between text-xs overflow-x-auto gap-4">
        @for (stepNum of [1,2,3,4,5,6]; track stepNum) {
          <div class="flex items-center gap-2 shrink-0">
            <span class="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                  [class]="step() === stepNum ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'">
              {{ stepNum }}
            </span>
            <span class="font-semibold text-slate-600 dark:text-slate-300" [class.text-primary-500]="step() === stepNum">
              {{ getStepTitle(stepNum) }}
            </span>
          </div>
          @if (stepNum < 6) {
            <i class="pi pi-chevron-right text-slate-300 dark:text-slate-700 shrink-0"></i>
          }
        }
      </div>

      <!-- Step Content Cards -->
      <div class="glass-card p-8">
        <!-- STEP 1: Basic Info -->
        @if (step() === 1) {
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Basic Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Property Name</label>
                <input type="text" pInputText class="w-full" [(ngModel)]="name" placeholder="e.g. Sunrise Luxury PG" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Property Type</label>
                <select class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm" [(ngModel)]="type">
                  <option [value]="PropertyType.PG">Paying Guest (PG)</option>
                  <option [value]="PropertyType.Hostel">Hostel</option>
                  <option [value]="PropertyType.CoLiving">Co-Living Space</option>
                  <option [value]="PropertyType.StudentHousing">Student Housing</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Allowed Gender</label>
                <select class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm" [(ngModel)]="gender">
                  <option [value]="Gender.Male">Male Only</option>
                  <option [value]="Gender.Female">Female Only</option>
                  <option [value]="Gender.Unisex">Unisex / Co-Ed</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">City</label>
                <input type="text" pInputText class="w-full" [(ngModel)]="city" placeholder="e.g. Noida" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">State</label>
                <input type="text" pInputText class="w-full" [(ngModel)]="state" placeholder="e.g. Uttar Pradesh" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Street Address</label>
                <input type="text" pInputText class="w-full" [(ngModel)]="street" placeholder="e.g. B-42, Sector 62" />
              </div>
            </div>
          </div>
        }

        <!-- STEP 2: Buildings -->
        @if (step() === 2) {
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Building Configuration</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Number of Buildings</label>
                <input type="number" pInputText class="w-full" min="1" max="5" [(ngModel)]="numBuildings" (ngModelChange)="onNumBuildingsChange()" />
              </div>

              <div class="space-y-4 pt-4">
                @for (b of buildingsConfig; track $index) {
                  <div class="p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-1">Building {{ $index + 1 }} Name</label>
                      <input type="text" pInputText class="w-full p-inputtext-sm" [(ngModel)]="b.name" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-1">Floors</label>
                      <input type="number" pInputText class="w-full p-inputtext-sm" min="1" max="10" [(ngModel)]="b.floors" />
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- STEP 3: Floor & Room Setup -->
        @if (step() === 3) {
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Floor & Room Setup</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Average Rooms Per Floor</label>
                <input type="number" pInputText class="w-full" min="1" max="20" [(ngModel)]="roomsPerFloor" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Default Room Sharing Type</label>
                <select class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm" [(ngModel)]="defaultRoomType">
                  <option [value]="RoomType.Single">Single sharing</option>
                  <option [value]="RoomType.Double">Double sharing</option>
                  <option [value]="RoomType.Triple">Triple sharing</option>
                  <option [value]="RoomType.Dormitory">Dormitory</option>
                </select>
              </div>
            </div>
          </div>
        }

        <!-- STEP 4: Bed & Pricing Setup -->
        @if (step() === 4) {
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Pricing & Deposits</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Monthly Rent Per Bed (INR)</label>
                <input type="number" pInputText class="w-full" [(ngModel)]="defaultRent" placeholder="e.g. 10000" />
              </div>

              <div>
                <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Security Deposit (INR)</label>
                <input type="number" pInputText class="w-full" [(ngModel)]="defaultDeposit" placeholder="e.g. 20000" />
              </div>
            </div>
          </div>
        }

        <!-- STEP 5: Amenities & Rules -->
        @if (step() === 5) {
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Amenities & Rules</h3>
            
            <div class="space-y-4">
              <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300">Select Amenities</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                @for (am of amenitiesList; track am) {
                  <label class="flex items-center gap-2 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 text-xs">
                    <input type="checkbox" [value]="am" [checked]="selectedAmenities.has(am)" (change)="toggleAmenity(am)" class="rounded text-indigo-600 focus:ring-indigo-500/20" />
                    {{ am }}
                  </label>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Curfew Hour</label>
                  <input type="text" pInputText class="w-full" [(ngModel)]="curfewTime" placeholder="e.g. 11:00 PM" />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Contact Person Name</label>
                  <input type="text" pInputText class="w-full" [(ngModel)]="contactPerson" placeholder="e.g. Rajesh Kumar" />
                </div>
              </div>
            </div>
          </div>
        }

        <!-- STEP 6: Review & Finalize -->
        @if (step() === 6) {
          <div class="space-y-6">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Review Configuration</h3>
            
            <div class="space-y-4 text-sm divide-y divide-slate-100 dark:divide-slate-850">
              <div class="py-2.5 flex justify-between">
                <span class="text-slate-400">Property Name</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ name }}</span>
              </div>
              <div class="py-2.5 flex justify-between">
                <span class="text-slate-400">Type & Gender</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ type }} • {{ gender }}</span>
              </div>
              <div class="py-2.5 flex justify-between">
                <span class="text-slate-400">Buildings Configured</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ numBuildings }} Buildings</span>
              </div>
              <div class="py-2.5 flex justify-between">
                <span class="text-slate-400">Rent & Security</span>
                <span class="font-bold text-slate-800 dark:text-white">₹{{ defaultRent | number }} / ₹{{ defaultDeposit | number }}</span>
              </div>
              <div class="py-2.5 flex justify-between">
                <span class="text-slate-400">Address</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ street }}, {{ city }}</span>
              </div>
            </div>
          </div>
        }

        <!-- Action Stepper Buttons -->
        <div class="flex items-center gap-4 mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
          @if (step() > 1) {
            <p-button label="Back" severity="secondary" styleClass="w-32" (onClick)="back()"></p-button>
          }
          <div class="flex-1"></div>
          @if (step() < 6) {
            <p-button label="Continue" styleClass="w-32" (onClick)="continue()"></p-button>
          } @else {
            <p-button label="Create Property" [loading]="loading()" styleClass="w-44" (onClick)="createProperty()"></p-button>
          }
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class PropertyAddComponent {
  PropertyType = PropertyType;
  Gender = Gender;
  RoomType = RoomType;

  step = signal(1);
  loading = signal(false);

  // Form State
  name = '';
  type = PropertyType.PG;
  gender = Gender.Male;
  city = '';
  state = '';
  street = '';
  numBuildings = 1;
  buildingsConfig: { name: string; floors: number }[] = [{ name: 'Building A', floors: 3 }];
  roomsPerFloor = 4;
  defaultRoomType = RoomType.Double;
  defaultRent = 10000;
  defaultDeposit = 20000;
  curfewTime = '11:00 PM';
  contactPerson = '';

  amenitiesList = ['WiFi', 'AC', 'Laundry', 'Food', 'CCTV', 'Power Backup', 'Gym', 'Parking', 'RO Water'];
  selectedAmenities = new Set<string>(['WiFi', 'CCTV']);

  private crud = inject(CrudService);
  private toast = inject(ToastService);
  private router = inject(Router);

  getStepTitle(step: number): string {
    const titles = ['Basic Info', 'Buildings', 'Floor & Room', 'Pricing', 'Amenities', 'Review'];
    return titles[step - 1];
  }

  onNumBuildingsChange() {
    const num = Math.min(5, Math.max(1, this.numBuildings));
    this.numBuildings = num;
    
    // adjust array length
    if (this.buildingsConfig.length < num) {
      for (let i = this.buildingsConfig.length; i < num; i++) {
        this.buildingsConfig.push({ name: `Building ${String.fromCharCode(65 + i)}`, floors: 3 });
      }
    } else if (this.buildingsConfig.length > num) {
      this.buildingsConfig = this.buildingsConfig.slice(0, num);
    }
  }

  toggleAmenity(am: string) {
    if (this.selectedAmenities.has(am)) {
      this.selectedAmenities.delete(am);
    } else {
      this.selectedAmenities.add(am);
    }
  }

  continue() {
    if (this.step() === 1 && (!this.name || !this.city || !this.state || !this.street)) {
      this.toast.error('Validation Error', 'Please fill in all basic details.');
      return;
    }
    this.step.update(s => s + 1);
  }

  back() {
    this.step.update(s => s - 1);
  }

  createProperty() {
    this.loading.set(true);
    setTimeout(() => {
      try {
        const propId = `prop-${Date.now().toString(36)}`;
        
        // 1. Create Property
        const newProperty = {
          id: propId,
          orgId: 'org-001',
          name: this.name,
          type: this.type,
          gender: this.gender,
          address: { street: this.street, city: this.city, state: this.state, pin: '123456' },
          contactPerson: this.contactPerson || 'Administrator',
          phone: '+91-9876543210',
          email: `${this.name.toLowerCase().replace(/\s/g, '')}@livespace.com`,
          totalBuildings: this.numBuildings,
          totalFloors: this.buildingsConfig.reduce((sum, b) => sum + b.floors, 0),
          totalRooms: this.buildingsConfig.reduce((sum, b) => sum + (b.floors * this.roomsPerFloor), 0),
          totalBeds: 0, // Calculated dynamically
          occupiedBeds: 0,
          vacantBeds: 0,
          maintenanceBeds: 0,
          noticeBeds: 0,
          amenities: Array.from(this.selectedAmenities),
          curfewTime: this.curfewTime,
          status: 'Active',
          images: [],
          monthlyRevenue: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };

        // Save Property
        this.crud.create<any>(StorageKeys.PROPERTIES, newProperty);

        let totalBedsCount = 0;

        // 2. Generate Buildings, Floors, Rooms, and Beds
        this.buildingsConfig.forEach((bConfig, bIndex) => {
          const buildingId = `bld-${Date.now().toString(36)}-${bIndex}`;
          const newBuilding = {
            id: buildingId,
            orgId: 'org-001',
            propertyId: propId,
            name: bConfig.name,
            totalFloors: bConfig.floors,
            createdAt: new Date().toISOString()
          };
          this.crud.create<any>(StorageKeys.BUILDINGS, newBuilding);

          for (let fNum = 1; fNum <= bConfig.floors; fNum++) {
            const floorId = `flr-${Date.now().toString(36)}-${bIndex}-${fNum}`;
            const newFloor = {
              id: floorId,
              orgId: 'org-001',
              propertyId: propId,
              buildingId: buildingId,
              name: `Floor ${fNum}`,
              floorNumber: fNum,
              createdAt: new Date().toISOString()
            };
            this.crud.create<any>(StorageKeys.FLOORS, newFloor);

            for (let rNum = 1; rNum <= this.roomsPerFloor; rNum++) {
              const roomId = `room-${Date.now().toString(36)}-${bIndex}-${fNum}-${rNum}`;
              const roomNumber = `${fNum}0${rNum}`;
              
              const sharingCount = this.defaultRoomType === RoomType.Single ? 1 : this.defaultRoomType === RoomType.Double ? 2 : this.defaultRoomType === RoomType.Triple ? 3 : 6;
              totalBedsCount += sharingCount;

              const newRoom = {
                id: roomId,
                orgId: 'org-001',
                propertyId: propId,
                buildingId: buildingId,
                floorId: floorId,
                roomNumber,
                sharingType: this.defaultRoomType,
                totalBeds: sharingCount,
                occupiedBeds: 0,
                status: 'Vacant',
                createdAt: new Date().toISOString()
              };
              this.crud.create<any>(StorageKeys.ROOMS, newRoom);

              // Create Beds
              const bedLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
              for (let bNum = 0; bNum < sharingCount; bNum++) {
                const bedId = `bed-${Date.now().toString(36)}-${bIndex}-${fNum}-${rNum}-${bNum}`;
                const newBed = {
                  id: bedId,
                  orgId: 'org-001',
                  propertyId: propId,
                  buildingId: buildingId,
                  floorId: floorId,
                  roomId: roomId,
                  bedNumber: bedLabels[bNum],
                  status: BedStatus.Vacant,
                  monthlyRent: this.defaultRent,
                  securityDeposit: this.defaultDeposit,
                  createdAt: new Date().toISOString()
                };
                this.crud.create<any>(StorageKeys.BEDS, newBed);
              }
            }
          }
        });

        // 3. Update Property capacity stats
        this.crud.update<any>(StorageKeys.PROPERTIES, propId, {
          totalBeds: totalBedsCount,
          vacantBeds: totalBedsCount
        });

        this.toast.success('Property Created', `${this.name} and all inventory structures built successfully!`);
        this.router.navigate(['/owner/properties']);
      } catch (err: any) {
        this.toast.error('Failure', err.message || 'An error occurred.');
      } finally {
        this.loading.set(false);
      }
    }, 1500);
  }
}
