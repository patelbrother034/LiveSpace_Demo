import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-check-out-wizard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, PageHeader,
    ButtonModule, InputTextModule, CheckboxModule, TooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <!-- Page Header -->
      <app-page-header title="Resident Clearance & Check-Out" subtitle="Process resident check-out in 4 steps"></app-page-header>

      <!-- Stepper Indicator -->
      <div class="glass-card p-6">
        <div class="flex items-center justify-between">
          @for (stepIndex of [0,1,2,3]; track stepIndex) {
            <div class="flex items-center flex-1 last:flex-initial">
              <div class="flex flex-col items-center gap-2">
                <span class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2"
                  [class]="activeStep() === stepIndex ? 'bg-gradient-to-r from-rose-500 to-red-600 border-none text-white shadow-lg' : activeStep() > stepIndex ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-400'">
                  @if (activeStep() > stepIndex) { <i class="pi pi-check text-xs"></i> } @else { {{ stepIndex + 1 }} }
                </span>
                <span class="text-xs font-semibold"
                  [class]="activeStep() === stepIndex ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'">
                  {{ stepNames[stepIndex] }}
                </span>
              </div>
              @if (stepIndex < 3) {
                <div class="h-[2px] flex-1 mx-4 transition-all duration-300"
                  [class]="activeStep() > stepIndex ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'">
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Main Contents -->
      <div class="glass-card p-8">
        <form [formGroup]="clearanceForm">

          <!-- Step 1: Select Resident -->
          @if (activeStep() === 0) {
            <div class="space-y-5">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">1. Select Active Resident</h3>
              <div class="flex flex-col gap-2 max-w-md">
                <label class="text-xs font-bold text-slate-400 uppercase">Resident *</label>
                <select formControlName="tenantId" (change)="onResidentSelect()" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2">
                  <option value="">Choose Resident</option>
                  @for (t of activeTenants; track t.id) {
                    <option [value]="t.id">{{ t.fullName }} (Room {{ t.roomNumber }} - Bed {{ t.bedNumber }})</option>
                  }
                </select>
              </div>

              <!-- Selected Resident Quick Stats -->
              @if (selectedTenant()) {
                <div class="mt-6 p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm animate-fade-in">
                  <div>
                    <h4 class="font-bold text-slate-800 dark:text-white mb-2">Personal Summary</h4>
                    <p><span class="text-slate-400">Phone:</span> {{ selectedTenant().phone }}</p>
                    <p><span class="text-slate-400">Email:</span> {{ selectedTenant().email }}</p>
                    <p><span class="text-slate-400">KYC Status:</span> <span class="text-emerald-600 font-bold"><i class="pi pi-verified"></i> {{ selectedTenant().kycStatus }}</span></p>
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-800 dark:text-white mb-2">Accommodation details</h4>
                    <p><span class="text-slate-400">Allocated bed:</span> {{ selectedTenant().propertyName }} (Room {{ selectedTenant().roomNumber }} / Bed {{ selectedTenant().bedNumber }})</p>
                    <p><span class="text-slate-400">Lease dates:</span> {{ selectedTenant().leaseStartDate }} to {{ selectedTenant().leaseEndDate }}</p>
                    <p><span class="text-slate-400">Rent structure:</span> ₹{{ selectedTenant().monthlyRent }}/mo • ₹{{ selectedTenant().securityDeposit }} deposit</p>
                  </div>
                </div>
              }
            </div>
          }

          <!-- Step 2: Clearance Checklist -->
          @if (activeStep() === 1) {
            <div class="space-y-5">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">2. Clearance Checklist</h3>
              <div class="space-y-4">
                <div class="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50">
                  <p-checkbox formControlName="keysReturned" [binary]="true" inputId="keysChk"></p-checkbox>
                  <div class="flex-1">
                    <label for="keysChk" class="text-sm font-bold text-slate-800 dark:text-white">Room keys & Access tags returned</label>
                    <p class="text-xs text-slate-400">All sets of wardrobe keys, door keys, and RFID tags have been collected.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50">
                  <p-checkbox formControlName="roomInspected" [binary]="true" inputId="roomChk"></p-checkbox>
                  <div class="flex-1">
                    <label for="roomChk" class="text-sm font-bold text-slate-800 dark:text-white">Physical room inspection completed</label>
                    <p class="text-xs text-slate-400">Bed structure, fans, AC unit, and lights checked and verified in working condition.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50">
                  <p-checkbox formControlName="noMaintenance" [binary]="true" inputId="maintChk"></p-checkbox>
                  <div class="flex-1">
                    <label for="maintChk" class="text-sm font-bold text-slate-800 dark:text-white">No pending maintenance complaints</label>
                    <p class="text-xs text-slate-400">All maintenance tickets generated by this tenant are resolved or closed.</p>
                  </div>
                </div>
                <div class="flex items-start gap-3 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50">
                  <p-checkbox formControlName="duesAcknowledged" [binary]="true" inputId="duesChk"></p-checkbox>
                  <div class="flex-1">
                    <label for="duesChk" class="text-sm font-bold text-slate-800 dark:text-white">Dues & settlement review confirmed</label>
                    <p class="text-xs text-slate-400">Resident agrees with physical checklist states and is ready for financial settlement.</p>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Step 3: Financial Settlement -->
          @if (activeStep() === 2) {
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-slate-800 dark:text-white border-b pb-2">3. Financial Settlement</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Inputs for deductions/adjustments -->
                <div class="space-y-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-400 uppercase">Damage Deductions (₹)</label>
                    <input type="number" pInputText formControlName="damageDeductions" (input)="computeSettlement()" class="w-full" placeholder="e.g. 1500 for broken desk" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-400 uppercase">Cleaning Charges (₹)</label>
                    <input type="number" pInputText formControlName="cleaningCharges" (input)="computeSettlement()" class="w-full" placeholder="e.g. 500" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-400 uppercase">Utility Dues (Water/Electricity) (₹)</label>
                    <input type="number" pInputText formControlName="utilityDues" (input)="computeSettlement()" class="w-full" placeholder="e.g. 1000" />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-400 uppercase">Settlement Note / Deduction Reason</label>
                    <input type="text" pInputText formControlName="settlementNote" class="w-full" placeholder="e.g. Deductions for wardrobe key loss and room painting." />
                  </div>
                </div>

                <!-- Settlement Calculations Board -->
                <div class="p-6 rounded-xl border border-slate-100 bg-slate-50/50 space-y-4 text-sm">
                  <h4 class="font-bold text-slate-800 dark:text-white border-b pb-2">Settlement Summary</h4>
                  <div class="flex justify-between">
                    <span class="text-slate-400">Security Deposit Collected</span>
                    <span class="font-bold text-slate-800 dark:text-white">₹{{ clearanceForm.value.securityDeposit }}</span>
                  </div>
                  <div class="flex justify-between text-red-500">
                    <span>Outstanding Rent Dues</span>
                    <span class="font-bold">-₹{{ clearanceForm.value.outstandingRent }}</span>
                  </div>
                  <div class="flex justify-between text-red-500">
                    <span>Damage Deductions</span>
                    <span class="font-bold">-₹{{ clearanceForm.value.damageDeductions }}</span>
                  </div>
                  <div class="flex justify-between text-red-500">
                    <span>Cleaning & Repair Fees</span>
                    <span class="font-bold">-₹{{ clearanceForm.value.cleaningCharges }}</span>
                  </div>
                  <div class="flex justify-between text-red-500">
                    <span>Utility Dues</span>
                    <span class="font-bold">-₹{{ clearanceForm.value.utilityDues }}</span>
                  </div>

                  <div class="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Net Refund Amount</span>
                    <span [class]="netRefund() >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                      ₹{{ netRefund() | number }}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 italic">
                    * If the net amount is positive, a refund will be processed. If negative, the resident is required to pay the balance.
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- Step 4: Final Clearance Confirmation -->
          @if (activeStep() === 3) {
            <div class="space-y-6 animate-fade-in text-center py-6">
              <i class="pi pi-check-circle text-5xl text-emerald-500"></i>
              <div class="space-y-2">
                <h3 class="text-xl font-bold text-slate-800 dark:text-white">Ready for Clearance Settlement</h3>
                <p class="text-sm text-slate-500 max-w-md mx-auto">
                  All clearances checked. Net settlement of <strong>₹{{ netRefund() | number }}</strong> is calculated for <strong>{{ selectedTenant().fullName }}</strong>.
                </p>
              </div>

              <!-- Settlement Slip Preview -->
              <div class="max-w-md mx-auto p-6 border rounded-xl bg-slate-50/50 text-left text-xs space-y-3 shadow-inner">
                <div class="text-center border-b pb-3 space-y-1">
                  <h4 class="font-bold text-sm text-slate-800 dark:text-white uppercase">LiveSpace Pro Clearance Slip</h4>
                  <p class="text-slate-400">Date: {{ currentDate }} • Status: Processing</p>
                </div>
                <div class="space-y-1.5 text-slate-600 dark:text-slate-300">
                  <p><strong>Resident Name:</strong> {{ selectedTenant().fullName }}</p>
                  <p><strong>Property:</strong> {{ selectedTenant().propertyName }} (Room {{ selectedTenant().roomNumber }} / Bed {{ selectedTenant().bedNumber }})</p>
                  <p><strong>Outstanding Rent Dues:</strong> ₹{{ clearanceForm.value.outstandingRent }}</p>
                  <p><strong>Damages & Penalities logged:</strong> ₹{{ clearanceForm.value.damageDeductions + clearanceForm.value.cleaningCharges + clearanceForm.value.utilityDues }}</p>
                  <p class="border-t pt-2 text-sm text-slate-800 dark:text-white"><strong>Net Settlement:</strong> ₹{{ netRefund() }} ({{ netRefund() >= 0 ? 'Refundable' : 'Payable' }})</p>
                </div>
              </div>

              <div class="flex items-center justify-center gap-3">
                <p-checkbox formControlName="finalAcknowledge" [binary]="true" inputId="finalChk"></p-checkbox>
                <label for="finalChk" class="text-xs font-bold text-slate-700 dark:text-slate-300">
                  I approve the calculated settlement and authorize the bed status to be set to VACANT. *
                </label>
              </div>
            </div>
          }

        </form>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between">
        <button pButton label="Back" icon="pi pi-arrow-left" 
          [disabled]="activeStep() === 0" 
          (click)="prevStep()"
          class="p-button-outlined rounded-xl border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400 px-6 py-2.5">
        </button>

        @if (activeStep() < 3) {
          <button pButton label="Continue" icon="pi pi-arrow-right" iconPos="right"
            [disabled]="activeStep() === 0 && !selectedTenant()"
            (click)="nextStep()"
            class="rounded-xl bg-gradient-to-r from-rose-500 to-red-600 border-none text-white px-8 py-2.5">
          </button>
        } @else {
          <button pButton label="Confirm Clearance & Check-Out" icon="pi pi-sign-out"
            [disabled]="!clearanceForm.value.finalAcknowledge"
            (click)="submitClearance()"
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
export class CheckOutWizardComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private crudService = inject(CrudService);

  activeStep = signal<number>(0);

  stepNames = [
    'Resident',
    'Clearance',
    'Financials',
    'Complete'
  ];

  clearanceForm!: FormGroup;
  activeTenants: any[] = [];
  selectedTenant = signal<any>(null);
  netRefund = signal<number>(0);
  currentDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  ngOnInit() {
    this.initForm();
    this.loadActiveResidents();

    // Check if tenantId parameter is present in query parameters (from profile initiate checkout)
    this.route.queryParams.subscribe(params => {
      const paramId = params['tenantId'];
      if (paramId) {
        this.clearanceForm.patchValue({ tenantId: paramId });
        this.onResidentSelect();
      }
    });
  }

  initForm() {
    this.clearanceForm = this.fb.group({
      tenantId: ['', Validators.required],
      
      // Step 2: Clearance checks
      keysReturned: [false, Validators.requiredTrue],
      roomInspected: [false, Validators.requiredTrue],
      noMaintenance: [false, Validators.requiredTrue],
      duesAcknowledged: [false, Validators.requiredTrue],

      // Step 3: Financials details
      securityDeposit: [0],
      outstandingRent: [0],
      damageDeductions: [0, [Validators.min(0)]],
      cleaningCharges: [0, [Validators.min(0)]],
      utilityDues: [0, [Validators.min(0)]],
      settlementNote: [''],

      // Step 4: Final confirmation
      finalAcknowledge: [false, Validators.requiredTrue]
    });
  }

  loadActiveResidents() {
    const rawTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    // Filter active or notice tenants
    const actives = rawTenants.filter((t: any) => t.status === 'Active' || t.status === 'Notice');

    this.activeTenants = actives.map((t: any) => {
      const prop = properties.find((p: any) => p.id === t.propertyId);
      const room = rooms.find((r: any) => r.id === t.roomId);
      const bed = beds.find((b: any) => b.id === t.bedId);

      return {
        id: t.id,
        fullName: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        propertyName: prop ? prop.name : 'Unknown Property',
        roomNumber: room ? room.roomNumber : 'N/A',
        bedNumber: bed ? bed.bedNumber.split('-').pop() || bed.bedNumber : 'N/A',
        phone: t.phone || '',
        email: t.email || '',
        kycStatus: t.kycStatus || 'Pending',
        monthlyRent: t.monthlyRent || t.rent || 0,
        securityDeposit: t.securityDeposit || 0,
        leaseStartDate: t.leaseStartDate || '',
        leaseEndDate: t.leaseEndDate || '',
        pendingDues: t.pendingDues || 0,
        propertyId: t.propertyId,
        roomId: t.roomId,
        bedId: t.bedId
      };
    });
  }

  onResidentSelect() {
    const tId = this.clearanceForm.value.tenantId;
    const resident = this.activeTenants.find(t => t.id === tId);
    
    if (resident) {
      this.selectedTenant.set(resident);
      this.clearanceForm.patchValue({
        securityDeposit: resident.securityDeposit,
        outstandingRent: resident.pendingDues
      });
      this.computeSettlement();
    } else {
      this.selectedTenant.set(null);
    }
  }

  computeSettlement() {
    const f = this.clearanceForm.value;
    const dep = f.securityDeposit || 0;
    const rent = f.outstandingRent || 0;
    const dmg = f.damageDeductions || 0;
    const clean = f.cleaningCharges || 0;
    const util = f.utilityDues || 0;

    const refund = dep - rent - dmg - clean - util;
    this.netRefund.set(refund);
  }

  nextStep() {
    if (this.activeStep() < 3) {
      this.activeStep.update(n => n + 1);
    }
  }

  prevStep() {
    if (this.activeStep() > 0) {
      this.activeStep.update(n => n - 1);
    }
  }

  submitClearance() {
    if (this.clearanceForm.invalid) {
      alert('Please complete all clearances prior to submit.');
      return;
    }

    const t = this.selectedTenant();
    const f = this.clearanceForm.value;

    // 1. Update Tenant status to CheckedOut
    this.crudService.update<any>(StorageKeys.TENANTS, t.id, {
      status: 'CheckedOut',
      pendingDues: this.netRefund() < 0 ? Math.abs(this.netRefund()) : 0,
      checkOutDate: new Date().toISOString().split('T')[0]
    });

    // 2. Set Bed status to Vacant
    this.crudService.update<any>(StorageKeys.BEDS, t.bedId, {
      status: 'Vacant',
      tenantId: null
    });

    // 3. Update Room counts
    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const room = rooms.find((r: any) => r.id === t.roomId);
    if (room) {
      this.crudService.update<any>(StorageKeys.ROOMS, t.roomId, {
        occupiedBeds: Math.max(0, (room.occupiedBeds || 1) - 1),
        vacantBeds: (room.vacantBeds || 0) + 1,
        status: 'Available'
      });
    }

    // 4. Update Property counts
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const prop = properties.find((p: any) => p.id === t.propertyId);
    if (prop) {
      this.crudService.update<any>(StorageKeys.PROPERTIES, t.propertyId, {
        occupiedBeds: Math.max(0, (prop.occupiedBeds || 1) - 1),
        vacantBeds: (prop.vacantBeds || 0) + 1
      });
    }

    // 5. Log settlement transaction
    const newTx = {
      id: 'tx-' + Date.now().toString().slice(-4),
      orgId: 'org-001',
      propertyId: t.propertyId,
      tenantId: t.id,
      type: this.netRefund() >= 0 ? 'REFUND' : 'RENT',
      amount: Math.abs(this.netRefund()),
      paymentMode: 'UPI',
      paymentDate: new Date().toISOString().split('T')[0],
      description: f.settlementNote || `Clearance settlement for checkout.`,
      status: 'Paid',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.crudService.create(StorageKeys.TRANSACTIONS, newTx);

    alert(`Successfully processed checkout clearance for ${t.fullName}!`);
    this.router.navigate(['/owner/tenants']);
  }
}
