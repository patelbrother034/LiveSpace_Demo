import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-check-in-wizard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, PageHeader,
    ButtonModule, InputTextModule, CheckboxModule, TooltipModule, DatePicker
  ],
  template: `
    <div class="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <!-- Page Header -->
      <app-page-header title="Resident Check-In Wizard" subtitle="Onboard a new tenant in 6 steps"></app-page-header>

      <!-- Stepper Header Indicators -->
      <div class="glass-card p-6">
        <div class="flex items-center justify-between">
          @for (stepIndex of [0,1,2,3,4,5]; track stepIndex) {
            <div class="flex items-center flex-1 last:flex-initial">
              <div class="flex flex-col items-center gap-2">
                <span class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2"
                  [class]="activeStep() === stepIndex ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white shadow-lg' : activeStep() > stepIndex ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400'">
                  @if (activeStep() > stepIndex) { <i class="pi pi-check text-xs"></i> } @else { {{ stepIndex + 1 }} }
                </span>
                <span class="text-[10px] md:text-xs font-semibold"
                  [class]="activeStep() === stepIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'">
                  {{ stepNames[stepIndex] }}
                </span>
              </div>
              @if (stepIndex < 5) {
                <div class="h-[2px] flex-1 mx-4 transition-all duration-300"
                  [class]="activeStep() > stepIndex ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'">
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Main Step Contents -->
      <div class="glass-card p-8">
        <form [formGroup]="wizardForm">
          
          <!-- Step 1: Personal details -->
          @if (activeStep() === 0) {
            <div class="space-y-5">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">1. Personal Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">First Name *</label>
                  <input type="text" pInputText formControlName="firstName" class="w-full" placeholder="e.g. Aditya" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Last Name *</label>
                  <input type="text" pInputText formControlName="lastName" class="w-full" placeholder="e.g. Patel" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Phone Number *</label>
                  <input type="text" pInputText formControlName="phone" class="w-full" placeholder="e.g. 9876543210" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Email Address *</label>
                  <input type="email" pInputText formControlName="email" class="w-full" placeholder="e.g. aditya.patel@gmail.com" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Date of Birth *</label>
                  <p-datepicker formControlName="dateOfBirth" styleClass="w-full" inputStyleClass="w-full" dateFormat="yy-mm-dd"></p-datepicker>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Gender *</label>
                  <select formControlName="gender" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Occupation *</label>
                  <select formControlName="occupation" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30">
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">College / Office Name</label>
                  <input type="text" pInputText formControlName="collegeName" class="w-full" placeholder="e.g. BITS Pilani" />
                </div>
              </div>
            </div>
          }

          <!-- Step 2: KYC compliance -->
          @if (activeStep() === 1) {
            <div class="space-y-5">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">2. Identity Proof & KYC</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Aadhaar Number (12 Digits) *</label>
                  <input type="text" pInputText formControlName="aadhaarNumber" class="w-full" placeholder="e.g. 123456789012" maxlength="12" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">PAN Card Number (10 Alphanumeric) *</label>
                  <input type="text" pInputText formControlName="panNumber" class="w-full" placeholder="e.g. ABCDE1234F" maxlength="10" />
                </div>
                <div class="md:col-span-2 flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Permanent Address *</label>
                  <textarea formControlName="permanentAddress" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30" placeholder="Street, City, State, ZIP"></textarea>
                </div>
                <div class="md:col-span-2 flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Simulated ID Document Upload</label>
                  <div class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center space-y-2">
                    <i class="pi pi-cloud-upload text-3xl text-indigo-500"></i>
                    <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">Drag and drop or click to upload</p>
                    <p class="text-xs text-slate-400">PDF, JPG, or PNG (Simulated check)</p>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Step 3: Bed Assignment -->
          @if (activeStep() === 2) {
            <div class="space-y-5">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">3. Property & Bed Assignment</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Property *</label>
                  <select formControlName="propertyId" (change)="onPropertyChange()" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2">
                    <option value="">Select Property</option>
                    @for (p of properties; track p.id) {
                      <option [value]="p.id">{{ p.name }} ({{ p.gender }})</option>
                    }
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Building *</label>
                  <select formControlName="buildingId" (change)="onBuildingChange()" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2">
                    <option value="">Select Building</option>
                    @for (b of filteredBuildings; track b.id) {
                      <option [value]="b.id">{{ b.name }}</option>
                    }
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Floor *</label>
                  <select formControlName="floorId" (change)="onFloorChange()" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2">
                    <option value="">Select Floor</option>
                    @for (f of filteredFloors; track f.id) {
                      <option [value]="f.id">Floor {{ f.floorNumber }}</option>
                    }
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Room *</label>
                  <select formControlName="roomId" (change)="onRoomChange()" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2">
                    <option value="">Select Room</option>
                    @for (r of filteredRooms; track r.id) {
                      <option [value]="r.id">Room {{ r.roomNumber }} (₹{{ r.monthlyRent }})</option>
                    }
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Bed Assignment *</label>
                  <select formControlName="bedId" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2">
                    <option value="">Select Bed</option>
                    @for (b of filteredBeds; track b.id) {
                      <option [value]="b.id">Bed {{ b.bedNumber.split('-').pop() || b.bedNumber }} ({{ b.status }})</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Mini Room layout visualization -->
              @if (filteredBeds.length > 0) {
                <div class="mt-6 p-5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10">
                  <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Room Bed Layout Map</h4>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    @for (b of filteredBeds; track b.id) {
                      <div class="p-4 rounded-xl border-2 text-center transition-all cursor-pointer"
                        [class]="wizardForm.value.bedId === b.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-slate-100 bg-white text-slate-500'">
                        <i class="pi pi-box text-xl mb-1 block"></i>
                        <p class="text-xs font-bold">Bed {{ b.bedNumber.split('-').pop() || b.bedNumber }}</p>
                        <span class="text-[8px] uppercase px-1.5 py-0.5 rounded font-bold mt-1 inline-block"
                          [class]="b.status === 'Vacant' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                          {{ b.status }}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- Step 4: Rent & deposits -->
          @if (activeStep() === 3) {
            <div class="space-y-5">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">4. Rent, Deposit & Dates</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Monthly Rent (₹) *</label>
                  <input type="number" pInputText formControlName="monthlyRent" class="w-full" placeholder="e.g. 15000" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Security Deposit (₹) *</label>
                  <input type="number" pInputText formControlName="securityDeposit" class="w-full" placeholder="e.g. 30000" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Lease Start Date *</label>
                  <p-datepicker formControlName="leaseStartDate" styleClass="w-full" inputStyleClass="w-full" dateFormat="yy-mm-dd"></p-datepicker>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Lease End Date *</label>
                  <p-datepicker formControlName="leaseEndDate" styleClass="w-full" inputStyleClass="w-full" dateFormat="yy-mm-dd"></p-datepicker>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Rent Due Day of Month *</label>
                  <input type="number" pInputText formControlName="rentDueDate" class="w-full" placeholder="e.g. 5" min="1" max="28" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Advance Paid (₹)</label>
                  <input type="number" pInputText formControlName="advancePaid" class="w-full" placeholder="e.g. 5000" />
                </div>
              </div>
            </div>
          }

          <!-- Step 5: Parent information -->
          @if (activeStep() === 4) {
            <div class="space-y-5">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">5. Parent / Emergency Contact</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Guardian Full Name *</label>
                  <input type="text" pInputText formControlName="guardianName" class="w-full" placeholder="e.g. Rajesh Patel" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Relationship *</label>
                  <input type="text" pInputText formControlName="guardianRelation" class="w-full" placeholder="e.g. Father" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Guardian Phone Number *</label>
                  <input type="text" pInputText formControlName="guardianPhone" class="w-full" placeholder="e.g. 9988776655" />
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-bold text-slate-400 uppercase">Guardian Email Address</label>
                  <input type="email" pInputText formControlName="guardianEmail" class="w-full" placeholder="e.g. rajesh.patel@gmail.com" />
                </div>
                <div class="md:col-span-2 flex items-center gap-3 p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-950/10">
                  <p-checkbox formControlName="parentPortalAccess" [binary]="true" inputId="parentAccess"></p-checkbox>
                  <label for="parentAccess" class="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Provide digital portal access link to parent/guardian via SMS.
                  </label>
                </div>
              </div>
            </div>
          }

          <!-- Step 6: Review agreement -->
          @if (activeStep() === 5) {
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">6. Agreement & Final Review</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-b pb-6">
                <div class="space-y-2">
                  <p><span class="text-slate-400">Resident:</span> <strong>{{ wizardForm.value.firstName }} {{ wizardForm.value.lastName }}</strong></p>
                  <p><span class="text-slate-400">Phone:</span> {{ wizardForm.value.phone }} • {{ wizardForm.value.email }}</p>
                  <p><span class="text-slate-400">Occupation:</span> {{ wizardForm.value.occupation }} ({{ wizardForm.value.collegeName || 'N/A' }})</p>
                  <p><span class="text-slate-400">Aadhaar:</span> {{ wizardForm.value.aadhaarNumber }} • <span class="text-slate-400">PAN:</span> {{ wizardForm.value.panNumber }}</p>
                </div>
                <div class="space-y-2">
                  <p><span class="text-slate-400">Room allocated:</span> <strong>{{ getSelectedRoomCode() }}</strong></p>
                  <p><span class="text-slate-400">Monthly Rent:</span> <strong>₹{{ wizardForm.value.monthlyRent }}</strong> • <span class="text-slate-400">Deposit:</span> <strong>₹{{ wizardForm.value.securityDeposit }}</strong></p>
                  <p><span class="text-slate-400">Lease dates:</span> {{ wizardForm.value.leaseStartDate }} to {{ wizardForm.value.leaseEndDate }}</p>
                  <p><span class="text-slate-400">Guardian:</span> {{ wizardForm.value.guardianName }} ({{ wizardForm.value.guardianRelation }}) • {{ wizardForm.value.guardianPhone }}</p>
                </div>
              </div>

              <!-- Agreement clauses -->
              <div class="p-5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/10 space-y-3">
                <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Lease Terms and Rules</h4>
                <ul class="list-disc pl-5 text-xs text-slate-500 space-y-1.5 leading-relaxed">
                  <li>Rent must be paid on or before the {{ wizardForm.value.rentDueDate || 5 }}th of every calendar month.</li>
                  <li>A minimum notice period of 30 days is mandatory prior to check-out clearance.</li>
                  <li>Deductions will apply on the security deposit for any physical damage to co-living property.</li>
                  <li>Standard gate curfew times must be respected unless prior pass approval is logged.</li>
                </ul>
              </div>

              <div class="flex items-center gap-3">
                <p-checkbox formControlName="agreedToTerms" [binary]="true" inputId="agreeTerms"></p-checkbox>
                <label for="agreeTerms" class="text-xs font-bold text-slate-700 dark:text-slate-300">
                  I hereby confirm that I have reviewed the resident details and agree to all platform terms and lease rules. *
                </label>
              </div>
            </div>
          }

        </form>
      </div>

      <!-- Stepper Actions Navigation -->
      <div class="flex items-center justify-between">
        <button pButton label="Back" icon="pi pi-arrow-left" 
          [disabled]="activeStep() === 0" 
          (click)="prevStep()"
          class="p-button-outlined rounded-xl border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400 px-6 py-2.5">
        </button>

        @if (activeStep() < 5) {
          <button pButton label="Continue" icon="pi pi-arrow-right" iconPos="right"
            (click)="nextStep()"
            class="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white px-8 py-2.5">
          </button>
        } @else {
          <button pButton label="Complete Onboarding Check-In" icon="pi pi-user-plus"
            [disabled]="!wizardForm.value.agreedToTerms"
            (click)="submitWizard()"
            class="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white px-10 py-3 shadow-lg hover:opacity-90 transition-all">
          </button>
        }
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
export class CheckInWizardComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private crudService = inject(CrudService);

  activeStep = signal<number>(0);

  stepNames = [
    'Resident',
    'KYC Compliance',
    'Bed Allocation',
    'Lease terms',
    'Guardian',
    'Agreement'
  ];

  wizardForm!: FormGroup;

  // Inventory lists
  properties: any[] = [];
  buildings: any[] = [];
  floors: any[] = [];
  rooms: any[] = [];
  beds: any[] = [];

  // Filtered dropdown lists
  filteredBuildings: any[] = [];
  filteredFloors: any[] = [];
  filteredRooms: any[] = [];
  filteredBeds: any[] = [];

  ngOnInit() {
    this.initForm();
    this.loadInventory();
  }

  initForm() {
    this.wizardForm = this.fb.group({
      // Step 1: Personal
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      gender: ['Male', Validators.required],
      occupation: ['Student', Validators.required],
      collegeName: [''],

      // Step 2: KYC
      aadhaarNumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      panNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      permanentAddress: ['', Validators.required],

      // Step 3: Bed Assignment
      propertyId: ['', Validators.required],
      buildingId: ['', Validators.required],
      floorId: ['', Validators.required],
      roomId: ['', Validators.required],
      bedId: ['', Validators.required],

      // Step 4: Rent terms
      monthlyRent: [0, [Validators.required, Validators.min(100)]],
      securityDeposit: [0, [Validators.required, Validators.min(0)]],
      leaseStartDate: ['', Validators.required],
      leaseEndDate: ['', Validators.required],
      rentDueDate: [5, [Validators.required, Validators.min(1), Validators.max(28)]],
      advancePaid: [0],

      // Step 5: Parent
      guardianName: ['', Validators.required],
      guardianRelation: ['', Validators.required],
      guardianPhone: ['', Validators.required],
      guardianEmail: [''],
      parentPortalAccess: [true],

      // Step 6: Review terms
      agreedToTerms: [false]
    });
  }

  loadInventory() {
    this.properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    this.buildings = this.crudService.getAll<any>(StorageKeys.BUILDINGS);
    this.floors = this.crudService.getAll<any>(StorageKeys.FLOORS);
    this.rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    this.beds = this.crudService.getAll<any>(StorageKeys.BEDS);
  }

  // Cascading dropdown logic
  onPropertyChange() {
    const propId = this.wizardForm.value.propertyId;
    this.filteredBuildings = this.buildings.filter(b => b.propertyId === propId);
    this.filteredFloors = [];
    this.filteredRooms = [];
    this.filteredBeds = [];
    this.wizardForm.patchValue({ buildingId: '', floorId: '', roomId: '', bedId: '' });
  }

  onBuildingChange() {
    const bldId = this.wizardForm.value.buildingId;
    this.filteredFloors = this.floors.filter(f => f.buildingId === bldId);
    this.filteredRooms = [];
    this.filteredBeds = [];
    this.wizardForm.patchValue({ floorId: '', roomId: '', bedId: '' });
  }

  onFloorChange() {
    const flrId = this.wizardForm.value.floorId;
    this.filteredRooms = this.rooms.filter(r => r.floorId === flrId);
    this.filteredBeds = [];
    this.wizardForm.patchValue({ roomId: '', bedId: '' });
  }

  onRoomChange() {
    const room = this.rooms.find(r => r.id === this.wizardForm.value.roomId);
    if (room) {
      // Auto-set the monthly rent and deposit from the room defaults
      this.wizardForm.patchValue({
        monthlyRent: room.monthlyRent,
        securityDeposit: room.securityDeposit || (room.monthlyRent * 2)
      });
    }

    const roomId = this.wizardForm.value.roomId;
    // Show only vacant beds
    this.filteredBeds = this.beds.filter(b => b.roomId === roomId && b.status === 'Vacant');
    this.wizardForm.patchValue({ bedId: '' });
  }

  getSelectedRoomCode(): string {
    const roomId = this.wizardForm.value.roomId;
    const room = this.rooms.find(r => r.id === roomId);
    const bedId = this.wizardForm.value.bedId;
    const bed = this.beds.find(b => b.id === bedId);

    if (room && bed) {
      const code = bed.bedNumber.split('-').pop() || bed.bedNumber;
      return `Room ${room.roomNumber} (Bed ${code})`;
    }
    return 'N/A';
  }

  nextStep() {
    if (this.activeStep() < 5) {
      this.activeStep.update(n => n + 1);
    }
  }

  prevStep() {
    if (this.activeStep() > 0) {
      this.activeStep.update(n => n - 1);
    }
  }

  submitWizard() {
    if (this.wizardForm.invalid) {
      alert('Please fill out all mandatory fields in the wizard.');
      return;
    }

    const f = this.wizardForm.value;
    const newTenantId = 'tenant-' + Date.now().toString().slice(-4);

    // 1. Create Tenant Record
    const newTenant = {
      id: newTenantId,
      orgId: 'org-001',
      propertyId: f.propertyId,
      buildingId: f.buildingId,
      floorId: f.floorId,
      roomId: f.roomId,
      bedId: f.bedId,
      firstName: f.firstName,
      lastName: f.lastName,
      fullName: `${f.firstName} ${f.lastName}`.trim(),
      gender: f.gender,
      dateOfBirth: f.dateOfBirth,
      phone: '+91-' + f.phone,
      email: f.email,
      occupation: f.occupation,
      collegeName: f.collegeName || '',
      permanentAddress: f.permanentAddress,
      aadhaarNumber: f.aadhaarNumber,
      panNumber: f.panNumber,
      kycStatus: 'Submitted',
      kycDocuments: [{ type: 'Aadhaar', status: 'Submitted', fileUrl: 'kyc/submitted.pdf' }],
      emergencyContact: { name: f.guardianName, relation: f.guardianRelation, phone: '+91-' + f.guardianPhone },
      monthlyRent: f.monthlyRent,
      securityDeposit: f.securityDeposit,
      depositPaid: f.advancePaid >= f.securityDeposit,
      rentDueDate: f.rentDueDate,
      leaseStartDate: f.leaseStartDate,
      leaseEndDate: f.leaseEndDate,
      checkInDate: f.leaseStartDate,
      checkOutDate: null,
      status: 'Active',
      paymentStatus: f.advancePaid >= f.securityDeposit ? 'Paid' : 'Pending',
      totalPaid: f.advancePaid || 0,
      pendingDues: Math.max(0, f.monthlyRent + f.securityDeposit - (f.advancePaid || 0)),
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.crudService.create(StorageKeys.TENANTS, newTenant);

    // 2. Set Bed status to 'Occupied'
    this.crudService.update<any>(StorageKeys.BEDS, f.bedId, { status: 'Occupied', tenantId: newTenantId });

    // 3. Update Room occupancy count
    const room = this.rooms.find(r => r.id === f.roomId);
    if (room) {
      this.crudService.update<any>(StorageKeys.ROOMS, f.roomId, {
        occupiedBeds: (room.occupiedBeds || 0) + 1,
        vacantBeds: Math.max(0, (room.vacantBeds || 1) - 1),
        status: (room.occupiedBeds + 1 >= room.totalBeds) ? 'Occupied' : 'Available'
      });
    }

    // 4. Update Property stats
    const prop = this.properties.find(p => p.id === f.propertyId);
    if (prop) {
      this.crudService.update<any>(StorageKeys.PROPERTIES, f.propertyId, {
        occupiedBeds: (prop.occupiedBeds || 0) + 1,
        vacantBeds: Math.max(0, (prop.vacantBeds || 1) - 1)
      });
    }

    // 5. Create Security Deposit transaction
    const newTx = {
      id: 'tx-' + Date.now().toString().slice(-4),
      orgId: 'org-001',
      propertyId: f.propertyId,
      tenantId: newTenantId,
      type: 'DEPOSIT',
      amount: f.securityDeposit,
      paymentMode: 'UPI',
      paymentDate: f.leaseStartDate,
      description: `Security deposit for Bed allocation ${this.getSelectedRoomCode()}`,
      status: 'Paid',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.crudService.create(StorageKeys.TRANSACTIONS, newTx);

    // 6. Create Parent Record
    const newParent = {
      id: 'parent-' + Date.now().toString().slice(-4),
      orgId: 'org-001',
      fullName: f.guardianName,
      relation: f.guardianRelation,
      phone: '+91-' + f.guardianPhone,
      email: f.guardianEmail || '',
      tenantId: newTenantId,
      portalAccessEnabled: f.parentPortalAccess,
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.crudService.create(StorageKeys.PARENTS, newParent);

    // Redirect to newly onboarded resident profile
    alert(`Successfully checked in ${newTenant.fullName}!`);
    this.router.navigate(['/owner/tenants', newTenantId]);
  }
}
