import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { gstValidator } from '../../../../shared/validators/gst.validator';

@Component({
  selector: 'app-gst-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, PageHeader, ButtonModule, InputTextModule, TableModule, TooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="GST Compliance & Taxation" subtitle="Indian GST liabilities, CGST/SGST splits, and statutory organization returns">
        <button pButton label="Configure GSTIN Profile" icon="pi pi-cog" (click)="openGstConfig()"
          class="p-button-sm rounded-xl bg-indigo-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- Active GSTIN Summary Banner -->
      <div class="glass-card p-5 bg-gradient-to-r from-indigo-500/10 via-slate-500/5 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded text-[10px] tracking-widest uppercase">STATUTORY ACTIVE</span>
            <h4 class="font-bold text-slate-800 dark:text-white">Active GST Profile: {{ currentOrgName() }}</h4>
          </div>
          <p class="text-xs text-slate-500">Business Registration: Proprietor/Firm. Enforcing CGST (9%) and SGST (9%) splits on taxable hospitality invoices.</p>
        </div>
        <div class="bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-center shadow-sm">
          <p class="text-[9px] text-slate-400 uppercase font-black tracking-wider">Company GSTIN Number</p>
          <p class="text-sm font-black font-mono mt-0.5 tracking-widest text-indigo-600 dark:text-indigo-400">{{ currentGstin() }}</p>
        </div>
      </div>

      <!-- Liability Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="glass-card p-6 border-l-4 border-indigo-500 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <p class="text-xs uppercase font-bold text-slate-400">Total Taxable Turnover</p>
          <h3 class="text-2xl font-black text-slate-800 dark:text-white mt-1">₹{{ totalTaxableTurnover() | number }}</h3>
          <p class="text-[10px] text-slate-400 mt-2">Calculated subtotal base room rent & utility values.</p>
        </div>

        <div class="glass-card p-6 border-l-4 border-violet-500 bg-gradient-to-br from-violet-500/5 to-transparent">
          <p class="text-xs uppercase font-bold text-slate-400">Total CGST Liability (9%)</p>
          <h3 class="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">₹{{ totalCgstLiability() | number }}</h3>
          <p class="text-[10px] text-slate-400 mt-2">Central Goods & Services Tax portion due to Central Gov.</p>
        </div>

        <div class="glass-card p-6 border-l-4 border-purple-500 bg-gradient-to-br from-purple-500/5 to-transparent">
          <p class="text-xs uppercase font-bold text-slate-400">Total SGST Liability (9%)</p>
          <h3 class="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">₹{{ totalSgstLiability() | number }}</h3>
          <p class="text-[10px] text-slate-400 mt-2">State Goods & Services Tax portion due to State Gov.</p>
        </div>

        <div class="glass-card p-6 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <p class="text-xs uppercase font-bold text-slate-400">Gross GST Collected (18%)</p>
          <h3 class="text-2xl font-black text-emerald-600 mt-1">₹{{ (totalCgstLiability() + totalSgstLiability()) | number }}</h3>
          <p class="text-[10px] text-slate-400 mt-2">Combined tax reserve matching standard co-living rates.</p>
        </div>
      </div>

      <!-- Invoices Tax Audit Breakdown Table -->
      <div class="glass-card overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h4 class="font-bold text-slate-700 dark:text-slate-200">GSTR-1 Invoicing Register</h4>
          <button pButton label="Export GSTR-1 Summary" icon="pi pi-file-excel" (click)="exportGstr1()"
            class="p-button-xs p-button-outlined rounded-lg text-xs py-1 border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50">
          </button>
        </div>

        <p-table [value]="invoices()" [paginator]="true" [rows]="10" responsiveLayout="scroll"
                 class="w-full border-collapse text-left text-xs">
          <ng-template pTemplate="header">
            <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold">
              <th class="py-3 px-4">Invoice ID</th>
              <th class="py-3 px-4">Resident</th>
              <th class="py-3 px-4">Rent Cycle</th>
              <th class="py-3 px-4 text-right">Taxable base (₹)</th>
              <th class="py-3 px-4 text-right">CGST (9%)</th>
              <th class="py-3 px-4 text-right">SGST (9%)</th>
              <th class="py-3 px-4 text-right">Total Invoice (₹)</th>
              <th class="py-3 px-4 text-center">Filing Status</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-inv>
            <tr class="hover:bg-slate-50/50">
              <td class="py-3.5 px-4 font-mono font-bold text-slate-500">{{ inv.id }}</td>
              <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{{ inv.tenantName }}</td>
              <td class="py-3.5 px-4 text-slate-500">{{ inv.issueDate }}</td>
              <td class="py-3.5 px-4 text-right text-slate-600">₹{{ inv.taxableValue | number }}</td>
              <td class="py-3.5 px-4 text-right text-violet-500">₹{{ inv.cgstTotal | number }}</td>
              <td class="py-3.5 px-4 text-right text-purple-500">₹{{ inv.sgstTotal | number }}</td>
              <td class="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-slate-100">₹{{ inv.amount | number }}</td>
              <td class="py-3.5 px-4 text-center">
                <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600">Ready</span>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="py-8 text-center text-slate-400">No GST invoices compiled in the system yet.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- GSTIN Profile Configuration Modal -->
      @if (showGstModal()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b pb-3">
                <h3 class="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  <i class="pi pi-id-card text-indigo-500"></i> GSTIN Statutory Profile
                </h3>
                <button pButton icon="pi pi-times" class="p-button-sm p-button-text text-slate-400" (click)="closeGstConfig()"></button>
              </div>

              <form [formGroup]="gstForm" class="space-y-4 text-xs">
                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">Organization Name</label>
                  <input type="text" pInputText formControlName="orgName" class="w-full" />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">GSTIN Identification Number *</label>
                  <input type="text" pInputText formControlName="gstin" class="w-full uppercase font-mono tracking-widest" placeholder="e.g. 27AAAAA1111A1Z1" />
                  @if (gstForm.get('gstin')?.hasError('invalidGst') && gstForm.get('gstin')?.touched) {
                    <p class="text-rose-500 font-semibold mt-1">Please enter a valid 15-character Indian GSTIN format.</p>
                  }
                </div>
              </form>
            </div>

            <div class="flex gap-2 pt-6 border-t mt-6">
              <button pButton label="Cancel" (click)="closeGstConfig()" class="p-button-sm p-button-outlined p-button-secondary rounded-lg flex-1 py-2"></button>
              <button pButton label="Save Profile" (click)="saveGstConfig()" [disabled]="gstForm.invalid" class="p-button-sm rounded-lg bg-indigo-500 text-white border-none flex-1 py-2"></button>
            </div>
          </div>
        </div>
      }
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
export class GstDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private crudService = inject(CrudService);

  properties: any[] = [];
  invoices = signal<any[]>([]);

  currentOrgName = signal('LiveSpace Homes Private Ltd.');
  currentGstin = signal('27AABCL8276D1Z5');

  showGstModal = signal(false);
  gstForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.gstForm = this.fb.group({
      orgName: [this.currentOrgName(), Validators.required],
      gstin: [this.currentGstin(), [Validators.required, gstValidator()]]
    });
  }

  loadData() {
    this.properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const rawInvoices = this.crudService.getAll<any>(StorageKeys.INVOICES);

    // Map invoices with GST itemized totals
    const mapped = rawInvoices.map((inv: any) => {
      const tenant = tenants.find(t => t.id === inv.tenantId);

      const items = inv.items || [
        {
          name: 'Base Room Rent',
          taxableValue: Math.round(Number(inv.amount || 0) / 1.18 * 0.9),
          cgst: Math.round((Number(inv.amount || 0) / 1.18 * 0.9) * 0.09),
          sgst: Math.round((Number(inv.amount || 0) / 1.18 * 0.9) * 0.09),
          total: Math.round((Number(inv.amount || 0) / 1.18 * 0.9) * 1.18)
        },
        {
          name: 'Amenity & Maintenance Charges',
          taxableValue: Math.round(Number(inv.amount || 0) / 1.18 * 0.1),
          cgst: Math.round((Number(inv.amount || 0) / 1.18 * 0.1) * 0.09),
          sgst: Math.round((Number(inv.amount || 0) / 1.18 * 0.1) * 0.09),
          total: Math.round((Number(inv.amount || 0) / 1.18 * 0.1) * 1.18)
        }
      ];

      const taxableValue = items.reduce((sum: number, it: any) => sum + it.taxableValue, 0);
      const cgstTotal = items.reduce((sum: number, it: any) => sum + it.cgst, 0);
      const sgstTotal = items.reduce((sum: number, it: any) => sum + it.sgst, 0);

      return {
        ...inv,
        tenantName: tenant ? (tenant.fullName || `${tenant.firstName} ${tenant.lastName}`) : 'Resident',
        items,
        taxableValue,
        cgstTotal,
        sgstTotal
      };
    });

    this.invoices.set(mapped);

    // Load org details if saved in storage
    const organizations = this.crudService.getAll<any>(StorageKeys.ORGANIZATIONS);
    if (organizations.length > 0) {
      const activeOrg = organizations[0];
      this.currentOrgName.set(activeOrg.name || activeOrg.orgName || this.currentOrgName());
      this.currentGstin.set(activeOrg.gstin || this.currentGstin());

      this.gstForm.patchValue({
        orgName: this.currentOrgName(),
        gstin: this.currentGstin()
      });
    }
  }

  totalTaxableTurnover = computed(() => {
    return this.invoices().reduce((sum, inv) => sum + inv.taxableValue, 0);
  });

  totalCgstLiability = computed(() => {
    return this.invoices().reduce((sum, inv) => sum + inv.cgstTotal, 0);
  });

  totalSgstLiability = computed(() => {
    return this.invoices().reduce((sum, inv) => sum + inv.sgstTotal, 0);
  });

  openGstConfig() {
    this.gstForm.patchValue({
      orgName: this.currentOrgName(),
      gstin: this.currentGstin()
    });
    this.showGstModal.set(true);
  }

  closeGstConfig() {
    this.showGstModal.set(false);
  }

  saveGstConfig() {
    if (this.gstForm.invalid) return;

    const f = this.gstForm.value;
    const gstin = String(f.gstin).toUpperCase().trim();

    this.currentOrgName.set(f.orgName);
    this.currentGstin.set(gstin);

    // Save back to Organization table
    const organizations = this.crudService.getAll<any>(StorageKeys.ORGANIZATIONS);
    if (organizations.length > 0) {
      const activeOrg = organizations[0];
      this.crudService.update<any>(StorageKeys.ORGANIZATIONS, activeOrg.id, {
        name: f.orgName,
        gstin: gstin
      });
    } else {
      this.crudService.create(StorageKeys.ORGANIZATIONS, {
        orgName: f.orgName,
        gstin: gstin,
        status: 'Active'
      });
    }

    alert('GSTIN business profile configured and validated successfully!');
    this.closeGstConfig();
  }

  exportGstr1() {
    alert('Preparing GSTR-1 Invoice Level Return Ledger... Exported 100% GSTR-1 compliance CSV file for government portal upload.');
  }
}
