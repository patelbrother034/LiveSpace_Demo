import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeader, StatusBadge, ButtonModule, InputTextModule, TableModule, TooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in print:p-0">
      <!-- Page Header -->
      <app-page-header title="Invoice Center" subtitle="Generate, monitor, and print tenant recurring billing records" class="print:hidden">
        <div class="flex gap-2">
          <button pButton label="Generate Batch Invoices" icon="pi pi-bolt" (click)="generateBatchInvoices()"
            class="p-button-sm rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 border-none text-white hover:opacity-90">
          </button>
        </div>
      </app-page-header>

      <!-- Filters & Toolbar -->
      <div class="glass-card p-5 print:hidden">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search input -->
          <div class="relative md:col-span-2">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="text" pInputText
              placeholder="Search by invoice ID or resident name..."
              class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 transition-all"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)" />
          </div>

          <!-- Status filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              [ngModel]="selectedStatus()"
              (ngModelChange)="selectedStatus.set($event)">
              <option value="All">All Invoice Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <!-- Property filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              [ngModel]="selectedProperty()"
              (ngModelChange)="selectedProperty.set($event)">
              <option value="All">All Properties</option>
              @for (p of properties; track p.id) {
                <option [value]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Invoices table -->
      <div class="glass-card overflow-hidden print:hidden">
        <p-table [value]="filteredInvoices()" [paginator]="true" [rows]="10" responsiveLayout="scroll"
                 class="w-full border-collapse text-left text-xs">
          <ng-template pTemplate="header">
            <tr class="border-b text-slate-400 uppercase font-semibold">
              <th class="py-3 px-4">Invoice ID</th>
              <th class="py-3 px-4">Resident / Property</th>
              <th class="py-3 px-4">Issue Date</th>
              <th class="py-3 px-4">Due Date</th>
              <th class="py-3 px-4 text-right">Taxable Amount</th>
              <th class="py-3 px-4 text-right">Total Amount (₹)</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-center">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-inv>
            <tr class="hover:bg-slate-50/50">
              <td class="py-3.5 px-4 font-mono font-bold text-slate-500">{{ inv.id }}</td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-800 dark:text-white">{{ inv.tenantName }}</p>
                <p class="text-[10px] text-slate-400">{{ inv.propertyName }}</p>
              </td>
              <td class="py-3.5 px-4 text-slate-500">{{ inv.issueDate }}</td>
              <td class="py-3.5 px-4 text-rose-500 font-semibold">{{ inv.dueDate }}</td>
              <td class="py-3.5 px-4 text-right text-slate-500">₹{{ inv.taxableValue | number }}</td>
              <td class="py-3.5 px-4 text-right font-black text-slate-800 dark:text-white">₹{{ inv.amount | number }}</td>
              <td class="py-3.5 px-4 text-center">
                <app-status-badge [status]="inv.status" />
              </td>
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm text-indigo-500 hover:bg-indigo-50"
                    v-tooltip="View Details" (click)="viewInvoiceDetails(inv)">
                  </button>
                  @if (inv.status !== 'Paid') {
                    <button pButton icon="pi pi-check-circle" class="p-button-rounded p-button-text p-button-sm text-emerald-500 hover:bg-emerald-50"
                      v-tooltip="Mark Paid" (click)="markInvoicePaid(inv)">
                    </button>
                  }
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="py-8 text-center text-slate-400">No invoices logged. Tap 'Generate Batch Invoices' to initialize recurring resident bills.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Itemized Print Preview Modal -->
      @if (activeInvoiceForPrint()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in print:static print:bg-transparent print:p-0 print:z-auto">
          <div class="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
            <!-- Modal Actions (Hidden on Print) -->
            <div class="p-4 border-b bg-slate-50 dark:bg-slate-900 flex justify-between items-center print:hidden">
              <span class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i class="pi pi-file-pdf text-rose-500 text-lg"></i> Invoice Detail Sheet
              </span>
              <div class="flex gap-2">
                <button pButton label="Print Invoice" icon="pi pi-print" (click)="printActiveInvoice()"
                  class="p-button-sm rounded-lg bg-indigo-600 border-none text-white hover:opacity-90">
                </button>
                <button pButton label="Close" icon="pi pi-times" class="p-button-sm p-button-outlined p-button-secondary rounded-lg"
                  (click)="closePrintPreview()">
                </button>
              </div>
            </div>

            <!-- Printable Layout Area -->
            <div class="p-8 flex-1 overflow-y-auto print:overflow-visible text-xs text-slate-700 bg-white print:p-0" id="print-area">
              <!-- Brand Header -->
              <div class="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                <div>
                  <h2 class="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                    <span class="bg-indigo-600 text-white px-2 py-0.5 rounded-lg text-sm">LS</span> LiveSpace Pro
                  </h2>
                  <p class="text-[10px] text-slate-400 mt-1 uppercase font-bold">Premium Student Housing & Co-Living Communities</p>
                  <p class="text-[9px] text-slate-400">GSTIN: 27AABCL8276D1Z5 | Maharashtra State</p>
                </div>
                <div class="text-right">
                  <h3 class="text-lg font-bold text-slate-900 uppercase">Tax Invoice</h3>
                  <p class="font-bold text-indigo-600 font-mono mt-1">Invoice ID: {{ activeInvoiceForPrint().id }}</p>
                  <p class="text-slate-400 mt-0.5">Status: <span class="font-bold text-indigo-500 uppercase">{{ activeInvoiceForPrint().status }}</span></p>
                </div>
              </div>

              <!-- Address Details -->
              <div class="grid grid-cols-2 gap-8 mb-6 border-b border-slate-100 pb-6">
                <div>
                  <p class="font-bold uppercase text-[9px] text-slate-400 mb-1.5">Billed From (Organization)</p>
                  <p class="font-bold text-slate-800">LiveSpace Pro Managed Properties</p>
                  <p class="text-slate-400 mt-0.5">Corporate HQ, IT Expressway, Sector 4</p>
                  <p class="text-slate-400">Pune, Maharashtra, India</p>
                </div>
                <div>
                  <p class="font-bold uppercase text-[9px] text-slate-400 mb-1.5">Billed To (Resident)</p>
                  <p class="font-bold text-slate-800">{{ activeInvoiceForPrint().tenantName }}</p>
                  <p class="text-slate-400 mt-0.5">Property: {{ activeInvoiceForPrint().propertyName }}</p>
                  <p class="text-slate-400">Period: Recurring Monthly Room Dues</p>
                </div>
              </div>

              <!-- Meta Data Dates -->
              <div class="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl mb-6 font-semibold">
                <div>
                  <p class="text-[9px] uppercase text-slate-400">Invoice Date</p>
                  <p class="text-slate-800 mt-0.5">{{ activeInvoiceForPrint().issueDate }}</p>
                </div>
                <div>
                  <p class="text-[9px] uppercase text-slate-400">Due Date</p>
                  <p class="text-rose-600 mt-0.5">{{ activeInvoiceForPrint().dueDate }}</p>
                </div>
                <div>
                  <p class="text-[9px] uppercase text-slate-400">Payment Term</p>
                  <p class="text-slate-800 mt-0.5">Net 10 Days</p>
                </div>
                <div>
                  <p class="text-[9px] uppercase text-slate-400">Payment Mode</p>
                  <p class="text-indigo-600 mt-0.5">UPI / Direct Transfer</p>
                </div>
              </div>

              <!-- Itemized Table -->
              <table class="w-full border-collapse mb-8 text-[11px]">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-400 uppercase text-[9px] font-bold">
                    <th class="py-2 text-left">Item Description</th>
                    <th class="py-2 text-right">Taxable Value</th>
                    <th class="py-2 text-right">CGST (9%)</th>
                    <th class="py-2 text-right">SGST (9%)</th>
                    <th class="py-2 text-right pr-2">Total Price (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of activeInvoiceForPrint().items; track item.name) {
                    <tr class="border-b border-slate-100">
                      <td class="py-3">
                        <p class="font-bold text-slate-800">{{ item.name }}</p>
                        <p class="text-[9px] text-slate-400">Sac Code: 996311 (Rental Housing)</p>
                      </td>
                      <td class="py-3 text-right">₹{{ item.taxableValue | number }}</td>
                      <td class="py-3 text-right text-slate-500">₹{{ item.cgst | number }}</td>
                      <td class="py-3 text-right text-slate-500">₹{{ item.sgst | number }}</td>
                      <td class="py-3 text-right font-bold text-slate-800 pr-2">₹{{ item.total | number }}</td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Calculations Summary -->
              <div class="flex justify-end mb-8">
                <div class="w-72 space-y-2 border-t pt-4 text-xs font-semibold">
                  <div class="flex justify-between text-slate-400">
                    <span>Taxable Subtotal</span>
                    <span>₹{{ activeInvoiceForPrint().taxableValue | number }}</span>
                  </div>
                  <div class="flex justify-between text-slate-400">
                    <span>CGST Total (9%)</span>
                    <span>₹{{ activeInvoiceForPrint().cgstTotal | number }}</span>
                  </div>
                  <div class="flex justify-between text-slate-400">
                    <span>SGST Total (9%)</span>
                    <span>₹{{ activeInvoiceForPrint().sgstTotal | number }}</span>
                  </div>
                  <div class="flex justify-between border-t border-slate-100 pt-2 text-base font-black text-indigo-600">
                    <span>Total Due (INR)</span>
                    <span>₹{{ activeInvoiceForPrint().amount | number }}</span>
                  </div>
                </div>
              </div>

              <!-- Statutory Disclaimer -->
              <div class="border-t border-slate-100 pt-6 text-[10px] text-slate-400 space-y-2">
                <p class="font-bold text-slate-500 uppercase">Terms & Conditions:</p>
                <p>1. This is a computer-generated tax invoice and does not require a physical signature.</p>
                <p>2. Please complete settlements before the specified due date to avoid standard late payment penalty charges of ₹250/day.</p>
                <p>3. Payments should ideally be routed via UPI or bank transfer registered under the Resident Portal dashboard.</p>
              </div>
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
    @media print {
      body * {
        visibility: hidden;
      }
      #print-area, #print-area * {
        visibility: visible;
      }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  private crudService = inject(CrudService);

  properties: any[] = [];
  invoices = signal<any[]>([]);

  searchQuery = signal('');
  selectedStatus = signal('All');
  selectedProperty = signal('All');

  activeInvoiceForPrint = signal<any | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rawInvoices = this.crudService.getAll<any>(StorageKeys.INVOICES);
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);

    // Map properties and tenant names to invoices
    const mapped = rawInvoices.map((inv: any) => {
      const prop = this.properties.find(p => p.id === inv.propertyId);
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
        propertyName: prop ? prop.name : 'Unknown Property',
        items,
        taxableValue,
        cgstTotal,
        sgstTotal
      };
    });

    this.invoices.set(mapped);
  }

  filteredInvoices = computed(() => {
    let list = this.invoices();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();
    const propId = this.selectedProperty();

    if (query) {
      list = list.filter(inv =>
        inv.id.toLowerCase().includes(query) ||
        inv.tenantName.toLowerCase().includes(query)
      );
    }

    if (status !== 'All') {
      list = list.filter(inv => inv.status === status);
    }

    if (propId !== 'All') {
      list = list.filter(inv => inv.propertyId === propId);
    }

    // Sort by date descending
    return list.sort((a, b) => {
      const dateA = a.issueDate || a.createdAt || '';
      const dateB = b.issueDate || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  });

  generateBatchInvoices() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const activeTenants = tenants.filter((t: any) => t.status === 'Active' || t.status === 'Notice');

    if (activeTenants.length === 0) {
      alert('There are no active or notice period residents found to bill in this organization.');
      return;
    }

    let generatedCount = 0;
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7); // YYYY-MM

    activeTenants.forEach((tenant: any, index: number) => {
      // Prevent duplicates for current month
      const duplicates = this.invoices().some(inv => inv.tenantId === tenant.id && inv.issueDate.startsWith(currentMonth));
      if (duplicates) return;

      const rentAmount = Number(tenant.monthlyRent || tenant.rent || 12000);
      const roomRentTaxable = Math.round(rentAmount / 1.18 * 0.9);
      const roomRentCgst = Math.round(roomRentTaxable * 0.09);
      const roomRentSgst = Math.round(roomRentTaxable * 0.09);
      const roomRentTotal = roomRentTaxable + roomRentCgst + roomRentSgst;

      const amenityTaxable = Math.round(rentAmount / 1.18 * 0.1);
      const amenityCgst = Math.round(amenityTaxable * 0.09);
      const amenitySgst = Math.round(amenityTaxable * 0.09);
      const amenityTotal = amenityTaxable + amenityCgst + amenitySgst;

      const newInvId = 'inv-' + Date.now().toString().slice(-4) + '-' + (index + 10);

      const items = [
        {
          name: 'Base Room Rent Charge',
          taxableValue: roomRentTaxable,
          cgst: roomRentCgst,
          sgst: roomRentSgst,
          total: roomRentTotal
        },
        {
          name: 'Co-Living Utilities & Amenity Surcharge',
          taxableValue: amenityTaxable,
          cgst: amenityCgst,
          sgst: amenitySgst,
          total: amenityTotal
        }
      ];

      const newInvoice = {
        id: newInvId,
        orgId: 'org-001',
        propertyId: tenant.propertyId,
        tenantId: tenant.id,
        amount: rentAmount,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Net 10 days
        status: 'Unpaid',
        items,
        createdAt: new Date().toISOString().split('T')[0]
      };

      this.crudService.create(StorageKeys.INVOICES, newInvoice);

      // Increase tenant's pending dues
      const currentDues = tenant.pendingDues || 0;
      this.crudService.update<any>(StorageKeys.TENANTS, tenant.id, {
        pendingDues: currentDues + rentAmount,
        paymentStatus: 'Unpaid'
      });

      generatedCount++;
    });

    alert(`Success! Generated ${generatedCount} recurring tax invoices for active residents. Resident balances have been updated.`);
    this.loadData();
  }

  viewInvoiceDetails(inv: any) {
    this.activeInvoiceForPrint.set(inv);
  }

  closePrintPreview() {
    this.activeInvoiceForPrint.set(null);
  }

  printActiveInvoice() {
    window.print();
  }

  markInvoicePaid(inv: any) {
    // 1. Mark invoice as paid
    this.crudService.update<any>(StorageKeys.INVOICES, inv.id, {
      status: 'Paid'
    });

    // 2. Create payment transaction
    const newTxId = 'tx-' + Date.now().toString().slice(-4);
    const newTx = {
      id: newTxId,
      orgId: 'org-001',
      propertyId: inv.propertyId,
      tenantId: inv.tenantId,
      type: 'RENT',
      amount: inv.amount,
      paymentMode: 'UPI',
      paymentDate: new Date().toISOString().split('T')[0],
      description: `Rent Invoice settled automatically — ID: ${inv.id}`,
      status: 'Paid',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.crudService.create(StorageKeys.TRANSACTIONS, newTx);

    // 3. Subtract tenant dues
    const tenant = this.crudService.getById<any>(StorageKeys.TENANTS, inv.tenantId);
    if (tenant) {
      const currentDues = tenant.pendingDues || 0;
      const newDues = Math.max(0, currentDues - inv.amount);
      this.crudService.update<any>(StorageKeys.TENANTS, inv.tenantId, {
        pendingDues: newDues,
        totalPaid: (tenant.totalPaid || 0) + inv.amount,
        paymentStatus: newDues === 0 ? 'Paid' : 'Partial'
      });
    }

    // 4. Create receipt
    const newReceipt = {
      id: 'rcpt-' + Date.now().toString().slice(-4),
      orgId: 'org-001',
      propertyId: inv.propertyId,
      tenantId: inv.tenantId,
      transactionId: newTxId,
      amount: inv.amount,
      receivedDate: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI',
      referenceNumber: 'AUTO-INV-SETTLE',
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.crudService.create(StorageKeys.RECEIPTS, newReceipt);

    alert(`Successfully marked invoice ${inv.id} as PAID! Running cash balance and resident dues balances updated.`);
    this.loadData();
  }
}
