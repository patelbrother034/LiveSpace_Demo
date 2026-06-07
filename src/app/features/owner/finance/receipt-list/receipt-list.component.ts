import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeader, ButtonModule, InputTextModule, TableModule, TooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in print:p-0">
      <!-- Page Header -->
      <app-page-header title="Receipt Registry" subtitle="Manage and print thermal handover receipts for cash and digital transactions" class="print:hidden">
      </app-page-header>

      <!-- Filters & Toolbar -->
      <div class="glass-card p-5 print:hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search input -->
          <div class="relative md:col-span-2">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="text" pInputText
              placeholder="Search by receipt ID or resident name..."
              class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 transition-all"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)" />
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

      <!-- Receipts list table -->
      <div class="glass-card overflow-hidden print:hidden">
        <p-table [value]="filteredReceipts()" [paginator]="true" [rows]="10" responsiveLayout="scroll"
                 class="w-full border-collapse text-left text-xs">
          <ng-template pTemplate="header">
            <tr class="border-b text-slate-400 uppercase font-semibold">
              <th class="py-3 px-4">Receipt ID</th>
              <th class="py-3 px-4">Resident</th>
              <th class="py-3 px-4">Property</th>
              <th class="py-3 px-4">Received Date</th>
              <th class="py-3 px-4">Payment Method</th>
              <th class="py-3 px-4">Reference No.</th>
              <th class="py-3 px-4 text-right">Settled Amount (₹)</th>
              <th class="py-3 px-4 text-center">Receipt Slips</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-rcpt>
            <tr class="hover:bg-slate-50/50">
              <td class="py-3.5 px-4 font-mono font-bold text-slate-500">{{ rcpt.id }}</td>
              <td class="py-3.5 px-4 font-bold text-slate-800 dark:text-white">{{ rcpt.tenantName }}</td>
              <td class="py-3.5 px-4 text-slate-500">{{ rcpt.propertyName }}</td>
              <td class="py-3.5 px-4 text-slate-500">{{ rcpt.receivedDate }}</td>
              <td class="py-3.5 px-4 font-semibold text-slate-400">{{ rcpt.paymentMode }}</td>
              <td class="py-3.5 px-4 font-mono text-slate-400 font-bold text-[10px]">{{ rcpt.referenceNumber }}</td>
              <td class="py-3.5 px-4 text-right font-black text-emerald-600">₹{{ rcpt.amount | number }}</td>
              <td class="py-3.5 px-4 text-center">
                <button pButton icon="pi pi-print" label="Thermal Slip"
                  class="p-button-sm p-button-outlined p-button-secondary rounded-lg text-[10px] py-1 px-2 hover:bg-slate-50"
                  (click)="openReceiptSlip(rcpt)">
                </button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="py-8 text-center text-slate-400">No receipt vouchers logged under these filters.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Thermal Receipt Slip Print Modal -->
      @if (activeReceiptForSlip()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in print:static print:bg-transparent print:p-0 print:z-auto">
          <!-- Thermal Slip Container (Simulated 80mm roll width) -->
          <div class="bg-white text-slate-800 w-80 max-w-sm rounded-xl shadow-2xl p-6 flex flex-col font-mono text-[10px] print:shadow-none print:rounded-none print:w-full print:p-2 border border-slate-200 dark:border-slate-700">
            
            <!-- Close & Print Row (Hidden during print) -->
            <div class="flex justify-between items-center pb-4 border-b border-dashed mb-4 print:hidden">
              <span class="font-bold text-[9px] uppercase tracking-wider text-slate-400">Handover Slip</span>
              <div class="flex gap-1">
                <button pButton icon="pi pi-print" class="p-button-sm p-button-rounded bg-indigo-600 text-white border-none py-1 px-2" (click)="printSlip()"></button>
                <button pButton icon="pi pi-times" class="p-button-sm p-button-rounded p-button-outlined p-button-secondary py-1 px-2" (click)="closeSlip()"></button>
              </div>
            </div>

            <!-- Thermal content container -->
            <div id="thermal-slip">
              <!-- Center Header -->
              <div class="text-center space-y-1 mb-4">
                <h3 class="text-xs font-black tracking-tight uppercase">LIVESPACE MANAGED HOMES</h3>
                <p class="text-[8px] text-slate-500 uppercase">Premium Co-Living Communities</p>
                <p class="text-[8px] text-slate-400">Property: {{ activeReceiptForSlip().propertyName }}</p>
                <p class="text-[8px] text-slate-400 font-bold">GSTIN: 27AABCL8276D1Z5</p>
              </div>

              <div class="border-b border-dashed my-3"></div>

              <!-- Metadata Table -->
              <div class="space-y-1 text-slate-600">
                <p><span class="font-bold text-slate-800">RECEIPT ID:</span> {{ activeReceiptForSlip().id }}</p>
                <p><span class="font-bold text-slate-800">TX ID REF:</span> {{ activeReceiptForSlip().transactionId }}</p>
                <p><span class="font-bold text-slate-800">DATE/TIME :</span> {{ activeReceiptForSlip().receivedDate }} | 12:45 PM</p>
                <p><span class="font-bold text-slate-800">RESIDENT  :</span> {{ activeReceiptForSlip().tenantName }}</p>
              </div>

              <div class="border-b border-dashed my-3"></div>

              <!-- Itemization -->
              <div class="space-y-2">
                <div class="flex justify-between font-bold text-slate-800 uppercase">
                  <span>Category</span>
                  <span>Amount</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>Room Rent & Dues Allocation</span>
                  <span>₹{{ activeReceiptForSlip().amount | number }}</span>
                </div>
              </div>

              <div class="border-b border-dashed my-3"></div>

              <!-- Final Total -->
              <div class="space-y-1.5 text-right">
                <p class="text-slate-400">Total Received (INR)</p>
                <h4 class="text-sm font-black text-slate-900 font-mono">₹{{ activeReceiptForSlip().amount | number }}.00</h4>
                <p class="text-[8px] font-bold italic text-slate-500 text-left capitalize">Amount: {{ getWords(activeReceiptForSlip().amount) }} Rupees Only</p>
              </div>

              <div class="border-b border-dashed my-3"></div>

              <!-- Payment details -->
              <div class="space-y-1 text-slate-500 text-[8px] uppercase font-bold">
                <p>Payment Mode : {{ activeReceiptForSlip().paymentMode }}</p>
                <p>Reference No : {{ activeReceiptForSlip().referenceNumber }}</p>
                <p>Status       : SUCCESS / SETTLED</p>
              </div>

              <div class="border-b border-dashed my-3"></div>

              <!-- Handshake Footer -->
              <div class="text-center space-y-2 mt-4">
                <div class="h-8 border border-slate-200 border-dashed rounded flex items-center justify-center bg-slate-50">
                  <p class="text-[7px] text-slate-400 italic font-sans font-bold">Verified Digital Signature Slip</p>
                </div>
                <p class="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Thank you for your timely settlement!</p>
                <p class="text-[7px] text-slate-400 italic">For billing issues or support, please raise a ticket under the resident portal.</p>
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
      #thermal-slip, #thermal-slip * {
        visibility: visible;
      }
      #thermal-slip {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white !important;
        color: black !important;
      }
    }
  `]
})
export class ReceiptListComponent implements OnInit {
  private crudService = inject(CrudService);

  properties: any[] = [];
  receipts = signal<any[]>([]);

  searchQuery = signal('');
  selectedProperty = signal('All');

  activeReceiptForSlip = signal<any | null>(null);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rawReceipts = this.crudService.getAll<any>(StorageKeys.RECEIPTS);
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);

    // Map properties and tenant names to receipts
    const mapped = rawReceipts.map((rcpt: any) => {
      const prop = this.properties.find(p => p.id === rcpt.propertyId);
      const tenant = tenants.find(t => t.id === rcpt.tenantId);

      return {
        ...rcpt,
        tenantName: tenant ? (tenant.fullName || `${tenant.firstName} ${tenant.lastName}`) : 'Resident',
        propertyName: prop ? prop.name : 'All Portfolio'
      };
    });

    this.receipts.set(mapped);
  }

  filteredReceipts = computed(() => {
    let list = this.receipts();
    const query = this.searchQuery().toLowerCase().trim();
    const propId = this.selectedProperty();

    if (query) {
      list = list.filter(rcpt =>
        rcpt.id.toLowerCase().includes(query) ||
        rcpt.tenantName.toLowerCase().includes(query)
      );
    }

    if (propId !== 'All') {
      list = list.filter(rcpt => rcpt.propertyId === propId);
    }

    // Sort by date descending
    return list.sort((a, b) => {
      const dateA = a.receivedDate || a.createdAt || '';
      const dateB = b.receivedDate || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  });

  openReceiptSlip(rcpt: any) {
    this.activeReceiptForSlip.set(rcpt);
  }

  closeSlip() {
    this.activeReceiptForSlip.set(null);
  }

  printSlip() {
    window.print();
  }

  getWords(num: number): string {
    if (num === 0) return 'zero';
    const a = [
      '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const numToWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' and ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 !== 0 ? ' ' + numToWords(n % 1000) : '');
      return n.toString(); // Simple fallback for larger values
    };

    return numToWords(num);
  }
}
