import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface InvoiceItem {
  description: string;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  tenantName: string;
  tenantId: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: string;
}

interface Tenant {
  id: string;
  fullName: string;
  monthlyRent: number;
}

@Component({
  selector: 'app-accountant-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, DialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Billing & Tax Invoices" subtitle="Compile professional student invoices and verify tax breakdowns" />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Left Panel: Invoice Builder -->
        <div class="xl:col-span-1 space-y-6">
          <div class="glass-card p-6 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Compile New Invoice</h4>
            
            <div class="space-y-3.5 text-xs">
              <div class="space-y-1">
                <label class="font-bold text-slate-500 uppercase text-[9px]">Select Tenant</label>
                <select [(ngModel)]="selectedTenantId" (change)="onTenantSelected()"
                  class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
                  <option value="">-- Select Resident --</option>
                  @for (t of tenants(); track t.id) {
                    <option [value]="t.id">{{ t.fullName }}</option>
                  }
                </select>
              </div>

              <!-- Line Items Builder -->
              <div class="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <h5 class="font-bold text-slate-700 dark:text-slate-300">Custom Line Items</h5>
                
                @for (item of formItems; track $index) {
                  <div class="flex gap-2 items-center">
                    <input type="text" [(ngModel)]="item.description" placeholder="Description"
                      class="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-955 text-xs focus:ring-1 focus:ring-indigo-500">
                    <input type="number" [(ngModel)]="item.amount" placeholder="Amt"
                      class="w-20 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-955 text-xs focus:ring-1 focus:ring-indigo-500 text-right">
                    <button (click)="removeLineItem($index)" class="text-red-500 border-none bg-transparent cursor-pointer font-bold">×</button>
                  </div>
                }

                <button pButton label="Add Line Item" icon="pi pi-plus" (click)="addLineItem()"
                  class="p-button-xs p-button-text p-0 hover:bg-transparent text-indigo-500 mt-1">
                </button>
              </div>

              <!-- Computations summary -->
              <div class="space-y-1.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700/80 text-[11px]">
                <div class="flex justify-between">
                  <span>Subtotal:</span>
                  <span class="font-semibold text-slate-700 dark:text-slate-300">₹{{ subtotal() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span>GST Liability (18%):</span>
                  <span class="font-semibold text-slate-700 dark:text-slate-300">₹{{ gst() | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-xs font-bold border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
                  <span class="text-slate-800 dark:text-white">Grand Total:</span>
                  <span class="text-indigo-500">₹{{ grandTotal() | number:'1.2-2' }}</span>
                </div>
              </div>

              <button pButton label="Generate & Send Invoice" icon="pi pi-file-export" (click)="generateInvoice()"
                [disabled]="!selectedTenantId || formItems.length === 0"
                class="w-full py-2.5 rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 font-bold shadow-md shadow-indigo-500/10">
              </button>
            </div>
          </div>
        </div>

        <!-- Right Panel: Invoices List & printable view -->
        <div class="xl:col-span-2 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Invoices Directory</h4>

          <div class="glass-card p-5 space-y-4 max-h-[580px] overflow-y-auto">
            @for (inv of invoices(); track inv.id) {
              <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-850 dark:text-white">{{ inv.invoiceNo }}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-extrabold uppercase">{{ inv.status }}</span>
                  </div>
                  <p class="text-slate-500">Host: <b>{{ inv.tenantName }}</b> · Billing Date: {{ inv.date | date:'mediumDate' }}</p>
                </div>

                <div class="flex items-center gap-4 justify-between md:justify-end">
                  <div class="text-right">
                    <p class="font-extrabold text-slate-800 dark:text-white text-sm">₹{{ inv.total | number:'1.0-0' }}</p>
                    <p class="text-[9px] text-slate-400">Inc 18% GST (₹{{ inv.gst | number:'1.0-0' }})</p>
                  </div>
                  <div class="flex gap-2">
                    <button pButton label="Print Invoice" icon="pi pi-print" (click)="openPrint(inv)"
                      class="p-button-xs p-button-outlined rounded-lg border-slate-200 text-slate-700 dark:text-slate-300"></button>
                  </div>
                </div>
              </div>
            } @empty {
              <p class="text-xs text-slate-400 italic text-center py-8">No invoice compiled yet.</p>
            }
          </div>
        </div>

      </div>

      <!-- Printable Invoice Dialog -->
      <p-dialog [(visible)]="printDialog" [header]="'Tax Invoice: ' + (activePrintInvoice()?.invoiceNo || '')"
        [modal]="true" [style]="{width: '520px'}" styleClass="rounded-2xl dark:bg-slate-900">
        <div class="space-y-6 p-4 text-xs font-serif bg-white text-black border border-slate-300" *ngIf="activePrintInvoice()" id="printable-invoice">
          
          <!-- Company Banner -->
          <div class="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h2 class="text-lg font-bold uppercase font-sans tracking-wide">LiveSpace Pro Co-Living</h2>
              <p class="font-sans text-[10px] text-slate-650">Sector 62, Noida, Uttar Pradesh, 201301</p>
              <p class="font-sans text-[10px] text-slate-650">GSTIN: 09AAPCL8712C1Z2</p>
            </div>
            <div class="text-right font-sans">
              <h3 class="text-sm font-bold uppercase">Tax Receipt</h3>
              <p class="text-[10px]">No: {{ activePrintInvoice()!.invoiceNo }}</p>
              <p class="text-[10px]">Date: {{ activePrintInvoice()!.date | date:'mediumDate' }}</p>
            </div>
          </div>

          <!-- Billing Info -->
          <div>
            <p class="font-sans text-[9px] uppercase font-bold text-slate-500">Billed To:</p>
            <h4 class="font-bold text-sm">{{ activePrintInvoice()!.tenantName }}</h4>
            <p class="font-sans text-[10px] text-slate-650 font-semibold">Resident of Room {{ activePrintInvoice()!.id.substring(0, 3).toUpperCase() }}</p>
          </div>

          <!-- Items Table -->
          <table class="w-full text-left font-sans text-[11px] border-collapse">
            <thead>
              <tr class="border-b border-black font-bold uppercase text-[9px]">
                <th class="py-1">Description</th>
                <th class="py-1 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              @for (item of activePrintInvoice()!.items; track item.description) {
                <tr class="border-b border-slate-100 text-slate-700">
                  <td class="py-1.5">{{ item.description }}</td>
                  <td class="py-1.5 text-right font-bold">₹{{ item.amount | number:'1.2-2' }}</td>
                </tr>
              }
              <tr class="font-bold border-t border-black text-slate-900">
                <td class="py-1.5 text-right">Subtotal:</td>
                <td class="py-1.5 text-right">₹{{ activePrintInvoice()!.subtotal | number:'1.2-2' }}</td>
              </tr>
              <tr class="text-slate-600">
                <td class="py-1 text-right">CGST (9%):</td>
                <td class="py-1 text-right">₹{{ (activePrintInvoice()!.gst / 2) | number:'1.2-2' }}</td>
              </tr>
              <tr class="text-slate-600">
                <td class="py-1 text-right">SGST (9%):</td>
                <td class="py-1 text-right">₹{{ (activePrintInvoice()!.gst / 2) | number:'1.2-2' }}</td>
              </tr>
              <tr class="font-bold border-t-2 border-black text-sm text-slate-900">
                <td class="py-2 text-right">Grand Total:</td>
                <td class="py-2 text-right">₹{{ activePrintInvoice()!.total | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>

          <div class="pt-6 font-sans text-[9px] text-center text-slate-500 border-t border-slate-200">
            <p>This is a computer-generated tax receipt under the CGST Act 2017. No signature required.</p>
          </div>

          <div class="flex gap-2 justify-end pt-4 font-sans no-print">
            <button pButton label="Simulate PDF Download" icon="pi pi-download" (click)="simulateDownload()"
              class="p-button-outlined rounded-lg p-button-sm text-slate-700 border-slate-200 hover:bg-slate-50"></button>
            <button pButton label="Trigger Print" icon="pi pi-print" (click)="triggerPrintWindow()"
              class="rounded-xl p-button-sm bg-indigo-500 text-white border-none hover:bg-indigo-650"></button>
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
export class AccountantInvoices implements OnInit {
  private crudService = inject(CrudService);

  tenants = signal<Tenant[]>([]);
  invoices = signal<Invoice[]>([]);

  // Form Model
  selectedTenantId = '';
  formItems: InvoiceItem[] = [];

  // Dialog Print
  printDialog = false;
  activePrintInvoice = signal<Invoice | null>(null);

  // Computations Signals
  subtotal = computed(() => {
    return this.formItems.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  });

  gst = computed(() => {
    return this.subtotal() * 0.18;
  });

  grandTotal = computed(() => {
    return this.subtotal() + this.gst();
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const list = this.crudService.getAll<Tenant>(StorageKeys.TENANTS);
    this.tenants.set(list.filter((t: any) => t.propertyId === 'prop-001' && t.status === 'Active'));

    const listInvs = localStorage.getItem('lsp_compiled_invoices');
    if (listInvs) {
      this.invoices.set(JSON.parse(listInvs));
    } else {
      const seed: Invoice[] = [
        { id: 'inv-1', invoiceNo: 'INV-2026-001', tenantId: 'tenant-001', tenantName: 'Aditya Patel', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), items: [{ description: 'Monthly Rent - May 2026', amount: 8500 }, { description: 'Mess Food Charge', amount: 2000 }], subtotal: 10500, gst: 1890, total: 12390, status: 'Paid' },
        { id: 'inv-2', invoiceNo: 'INV-2026-002', tenantId: 'tenant-002', tenantName: 'Rahul Sharma', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), items: [{ description: 'Monthly Rent - May 2026', amount: 9500 }, { description: 'Electricity usage charge', amount: 1500 }], subtotal: 11000, gst: 1980, total: 12980, status: 'Paid' }
      ];
      localStorage.setItem('lsp_compiled_invoices', JSON.stringify(seed));
      this.invoices.set(seed);
    }
  }

  onTenantSelected() {
    const tenant = this.tenants().find(t => t.id === this.selectedTenantId);
    this.formItems = [];
    if (tenant) {
      this.formItems.push({ description: `Monthly Room Rent - Room ${tenant.id.toUpperCase()}`, amount: tenant.monthlyRent });
      this.formItems.push({ description: 'Mess Food Maintenance', amount: 2200 });
    }
  }

  addLineItem() {
    this.formItems.push({ description: '', amount: 0 });
  }

  removeLineItem(idx: number) {
    this.formItems.splice(idx, 1);
  }

  generateInvoice() {
    if (!this.selectedTenantId || this.formItems.length === 0) return;

    const tenant = this.tenants().find(t => t.id === this.selectedTenantId);
    if (!tenant) return;

    const newInvoice: Invoice = {
      id: 'inv-' + Math.random().toString(36).substring(7),
      invoiceNo: 'INV-2026-00' + (this.invoices().length + 1),
      tenantId: this.selectedTenantId,
      tenantName: tenant.fullName,
      date: new Date().toISOString(),
      items: [...this.formItems],
      subtotal: this.subtotal(),
      gst: this.gst(),
      total: this.grandTotal(),
      status: 'Paid'
    };

    const current = this.invoices();
    current.unshift(newInvoice);
    localStorage.setItem('lsp_compiled_invoices', JSON.stringify(current));
    this.invoices.set(current);

    // Reset Form
    this.selectedTenantId = '';
    this.formItems = [];

    alert('Tax invoice successfully compiled and logged under lsp_invoices!');
  }

  openPrint(inv: Invoice) {
    this.activePrintInvoice.set(inv);
    this.printDialog = true;
  }

  simulateDownload() {
    alert('Invoice PDF compilation successful! Download simulated to resident portal files.');
  }

  triggerPrintWindow() {
    window.print();
  }
}
