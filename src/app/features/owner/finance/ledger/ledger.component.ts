import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-ledger',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeader, ButtonModule, TableModule, TooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in print:space-y-4 print:p-0">
      <!-- Page Header -->
      <app-page-header title="General Cash Ledger" subtitle="Double-entry T-account ledger registry & cash flow balancing" class="print:hidden">
        <button pButton label="Print Ledger Statement" icon="pi pi-print" (click)="printLedger()"
          class="p-button-sm rounded-xl bg-indigo-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- Print Only Header -->
      <div class="hidden print:block border-b-2 border-slate-800 pb-4 mb-6">
        <h1 class="text-2xl font-bold text-slate-900">LIVESPACE PRO — GENERAL CASH LEDGER</h1>
        <p class="text-sm text-slate-500">Generated on: {{ todayDate | date:'medium' }} | Property: {{ selectedPropertyName() }}</p>
      </div>

      <!-- Filters & Toolbar -->
      <div class="glass-card p-5 print:hidden">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Property filter -->
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Property Filter</label>
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

          <!-- Month filter -->
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase mb-2">Fiscal Month</label>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              [ngModel]="selectedMonth()"
              (ngModelChange)="selectedMonth.set($event)">
              <option value="All">All Time</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          <!-- Account Summary -->
          <div class="flex items-center justify-end">
            <div class="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl px-5 py-3 w-full md:w-auto text-right">
              <p class="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Closing Running Cash</p>
              <p class="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{{ closingBalance() | number }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Double-Entry T-Account Summary Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-6 border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-xs uppercase font-bold text-slate-400">Total Debit (Inflows)</p>
              <h3 class="text-2xl font-black text-emerald-600 mt-1">₹{{ totalInflows() | number }}</h3>
            </div>
            <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center">
              <i class="pi pi-arrow-down-left font-bold"></i>
            </div>
          </div>
          <p class="text-[10px] text-slate-400 mt-3">Rents, security deposits, penalty collections & utility dues.</p>
        </div>

        <div class="glass-card p-6 border-l-4 border-rose-500 bg-gradient-to-br from-rose-500/5 to-transparent">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-xs uppercase font-bold text-slate-400">Total Credit (Outflows)</p>
              <h3 class="text-2xl font-black text-rose-600 mt-1">₹{{ totalOutflows() | number }}</h3>
            </div>
            <div class="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/30 text-rose-600 flex items-center justify-center">
              <i class="pi pi-arrow-up-right font-bold"></i>
            </div>
          </div>
          <p class="text-[10px] text-slate-400 mt-3">Maintenance operations, caretaker approvals & security refunds.</p>
        </div>

        <div class="glass-card p-6 border-l-4 border-indigo-500 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-xs uppercase font-bold text-slate-400">Net Operating Position</p>
              <h3 class="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">₹{{ (totalInflows() - totalOutflows()) | number }}</h3>
            </div>
            <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center">
              <i class="pi pi-percentage font-bold"></i>
            </div>
          </div>
          <p class="text-[10px] text-slate-400 mt-3">Platform net liquidity surplus generated in selected parameters.</p>
        </div>
      </div>

      <!-- Ledger Books Table -->
      <div class="glass-card overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center print:hidden">
          <h4 class="font-bold text-slate-700 dark:text-slate-200">Ledger Statement Entries</h4>
          <span class="text-xs text-slate-400">{{ filteredLedger().length }} entries found</span>
        </div>

        <p-table [value]="filteredLedger()" [paginator]="true" [rows]="15" responsiveLayout="scroll"
                 class="w-full border-collapse text-left text-xs">
          <ng-template pTemplate="header">
            <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase font-semibold">
              <th class="py-3 px-4">Post Date</th>
              <th class="py-3 px-4">Description / Entity</th>
              <th class="py-3 px-4">Ref Code</th>
              <th class="py-3 px-4 text-right">Debit (In +)</th>
              <th class="py-3 px-4 text-right">Credit (Out -)</th>
              <th class="py-3 px-4 text-right pr-6">Running Cash Balance</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-tx>
            <tr class="hover:bg-slate-50/50 border-b border-slate-100 dark:border-slate-800/40">
              <td class="py-3.5 px-4 text-slate-500 font-semibold font-mono">{{ tx.paymentDate || tx.createdAt }}</td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-800 dark:text-white">{{ tx.description || 'N/A' }}</p>
                <p class="text-[10px] text-slate-400">Entity: {{ tx.entityName }}</p>
              </td>
              <td class="py-3.5 px-4 font-mono text-[10px] text-slate-400 font-bold uppercase">{{ tx.id }}</td>
              
              <!-- Debit -->
              <td class="py-3.5 px-4 text-right font-bold text-emerald-600 bg-emerald-500/[0.01]">
                @if (tx.isDebit) {
                  +₹{{ tx.amount | number }}
                } @else {
                  —
                }
              </td>
              
              <!-- Credit -->
              <td class="py-3.5 px-4 text-right font-bold text-rose-600 bg-rose-500/[0.01]">
                @if (!tx.isDebit) {
                  -₹{{ tx.amount | number }}
                } @else {
                  —
                }
              </td>
              
              <!-- Running Balance -->
              <td class="py-3.5 px-4 text-right pr-6 font-mono font-bold text-slate-700 dark:text-slate-300">
                ₹{{ tx.runningBalance | number }}
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="py-8 text-center text-slate-400">No ledger transactions posted under these filters.</td>
            </tr>
          </ng-template>
        </p-table>
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
    @media print {
      body {
        background: white !important;
        color: black !important;
      }
      .glass-card {
        border: 1px solid #cbd5e1 !important;
        box-shadow: none !important;
        background: transparent !important;
      }
    }
  `]
})
export class LedgerComponent implements OnInit {
  private crudService = inject(CrudService);

  todayDate = new Date();
  properties: any[] = [];
  transactions = signal<any[]>([]);

  selectedProperty = signal('All');
  selectedMonth = signal('All');

  selectedPropertyName = computed(() => {
    const id = this.selectedProperty();
    if (id === 'All') return 'All Properties Portfolio';
    const prop = this.properties.find(p => p.id === id);
    return prop ? prop.name : 'Unknown Property';
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const rawTxs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const expenses = this.crudService.getAll<any>(StorageKeys.EXPENSES);

    // Map Mapped Transactions with entity names
    const mapped = rawTxs.map((tx: any) => {
      let entityName = 'Operational Expense';
      if (tx.tenantId) {
        const tenant = tenants.find((t: any) => t.id === tx.tenantId);
        entityName = tenant ? (tenant.fullName || `${tenant.firstName} ${tenant.lastName}`) : 'Resident';
      } else if (tx.type === 'EXPENSE') {
        const expItem = expenses.find((e: any) => e.id === tx.id);
        entityName = expItem ? expItem.payee || expItem.category : 'Vendor';
      }

      // Check if transaction is Debit (inflow) or Credit (outflow)
      // Debits increase cash (RENT, DEPOSIT, UTILITY, PENALTY, ADVANCE, FOOD)
      // Credits reduce cash (EXPENSE, REFUND, MAINTENANCE)
      const isDebit = !(tx.type === 'EXPENSE' || tx.type === 'REFUND' || tx.type === 'MAINTENANCE');

      return {
        ...tx,
        entityName,
        isDebit
      };
    });

    // Chronological sort ascending to compute correct historic running balances
    const chronological = [...mapped].sort((a, b) => {
      const dateA = a.paymentDate || a.createdAt || '';
      const dateB = b.paymentDate || b.createdAt || '';
      return dateA.localeCompare(dateB);
    });

    let balanceAccumulator = 0;
    const withRunning = chronological.map(tx => {
      if (tx.isDebit) {
        balanceAccumulator += Number(tx.amount || 0);
      } else {
        balanceAccumulator -= Number(tx.amount || 0);
      }
      return {
        ...tx,
        runningBalance: balanceAccumulator
      };
    });

    // Save final list descending (latest at top)
    this.transactions.set(withRunning.reverse());
  }

  filteredLedger = computed(() => {
    let list = this.transactions();
    const propId = this.selectedProperty();
    const month = this.selectedMonth();

    if (propId !== 'All') {
      list = list.filter(tx => tx.propertyId === propId);
    }

    if (month !== 'All') {
      list = list.filter(tx => {
        const dateStr = tx.paymentDate || tx.createdAt || '';
        const m = dateStr.split('-')[1]; // YYYY-MM-DD
        return m === month;
      });
    }

    return list;
  });

  closingBalance = computed(() => {
    const list = this.filteredLedger();
    if (list.length === 0) return 0;
    // Since list is sorted descending (latest at top), the first element represents the final closing balance for this set
    return list[0].runningBalance;
  });

  totalInflows = computed(() => {
    return this.filteredLedger()
      .filter(tx => tx.isDebit)
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  });

  totalOutflows = computed(() => {
    return this.filteredLedger()
      .filter(tx => !tx.isDebit)
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  });

  printLedger() {
    window.print();
  }
}
