import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';

interface Transaction {
  id: string;
  tenantId?: string;
  amount: number;
  type: string; // RENT, DEPOSIT, EXPENSE
  paymentMode: string;
  status: string;
  createdAt: string;
  tenantName?: string;
}

interface Tenant {
  id: string;
  fullName: string;
}

@Component({
  selector: 'app-accountant-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Reconciliation & Ledger" subtitle="Maintain balanced double-entry general ledgers and verify payments" />

      <!-- Tab View selectors -->
      <div class="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-0.5">
        <button (click)="view.set('ledger')"
          class="pb-3 text-sm font-bold border-b-2 bg-transparent border-none cursor-pointer transition-all px-4"
          [class]="view() === 'ledger' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'">
          Double-Entry Ledger Book
        </button>
        <button (click)="view.set('reconciliation')"
          class="pb-3 text-sm font-bold border-b-2 bg-transparent border-none cursor-pointer transition-all px-4"
          [class]="view() === 'reconciliation' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'">
          Transaction Reconciliation
        </button>
      </div>

      <!-- VIEW 1: DOUBLE ENTRY LEDGER -->
      @if (view() === 'ledger') {
        <div class="space-y-6 animate-fade-in">
          
          <!-- General Reserves Cards -->
          <div class="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div class="space-y-0.5">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Net General Reserves</p>
              <h2 class="text-2xl font-black text-slate-800 dark:text-white">₹{{ reserves() | number:'1.2-2' }}</h2>
            </div>
            <div class="space-y-0.5">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Debits today</p>
              <h3 class="text-lg font-bold text-red-500">₹{{ totalDebits() | number:'1.0-0' }}</h3>
            </div>
            <div class="space-y-0.5">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Credits today</p>
              <h3 class="text-lg font-bold text-emerald-500">₹{{ totalCredits() | number:'1.0-0' }}</h3>
            </div>
          </div>

          <!-- Ledger Table -->
          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Debit & Credit Journal</h4>
            
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase font-bold text-[10px]">
                    <th class="py-2.5">Date</th>
                    <th class="py-2.5">Particulars / Details</th>
                    <th class="py-2.5">Ref No.</th>
                    <th class="py-2.5 text-right">Debit (Dr)</th>
                    <th class="py-2.5 text-right">Credit (Cr)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                  @for (j of journalEntries(); track j.refId) {
                    <tr>
                      <td class="py-3.5">{{ j.date | date:'shortDate' }}</td>
                      <td class="py-3.5">
                        <span class="font-bold text-slate-850 dark:text-white">{{ j.particulars }}</span>
                        @if (j.subtext) {
                          <p class="text-[9.5px] text-slate-400 font-semibold mt-0.5">{{ j.subtext }}</p>
                        }
                      </td>
                      <td class="py-3.5 font-mono text-slate-400">{{ j.refId }}</td>
                      <td class="py-3.5 text-right font-extrabold text-red-500">{{ j.debit ? '₹' + (j.debit | number:'1.0-0') : '-' }}</td>
                      <td class="py-3.5 text-right font-extrabold text-emerald-500">{{ j.credit ? '₹' + (j.credit | number:'1.0-0') : '-' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }

      <!-- VIEW 2: RECONCILIATION -->
      @if (view() === 'reconciliation') {
        <div class="glass-card p-5 space-y-4 animate-fade-in">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">All Bank Reconciliations</h4>
            
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Filter Mode:</span>
              <select [(ngModel)]="activeModeFilter"
                class="p-1 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
                <option value="All">All Transactions</option>
                <option value="UPI">UPI Payments Only</option>
                <option value="Cash">Cash Collections</option>
                <option value="BankTransfer">Bank NetBanking</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead>
                <tr class="text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase font-bold text-[10px]">
                  <th class="py-2.5">Transaction ID</th>
                  <th class="py-2.5">Resident</th>
                  <th class="py-2.5">Amount</th>
                  <th class="py-2.5">Category</th>
                  <th class="py-2.5">Mode</th>
                  <th class="py-2.5">Status</th>
                  <th class="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                @for (tx of filteredTransactions(); track tx.id) {
                  <tr>
                    <td class="py-3.5 font-mono text-slate-450">{{ tx.id }}</td>
                    <td class="py-3.5 font-bold text-slate-850 dark:text-white">{{ tx.tenantName }}</td>
                    <td class="py-3.5 font-extrabold">₹{{ tx.amount | number:'1.0-0' }}</td>
                    <td class="py-3.5">{{ tx.type }}</td>
                    <td class="py-3.5">{{ tx.paymentMode }}</td>
                    <td class="py-3.5">
                      <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase"
                        [class]="tx.status === 'Paid' || tx.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                        {{ tx.status }}
                      </span>
                    </td>
                    <td class="py-3.5 text-right">
                      <button pButton label="Reconciled" [disabled]="tx.status === 'Reconciled'"
                        class="p-button-xs rounded-lg px-2.5 py-1 text-[10px] bg-emerald-500 border-none text-white hover:bg-emerald-600"
                        (click)="reconcileTx(tx.id)">
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="py-6 text-center text-slate-400 italic">No transactions found.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
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
export class AccountantPayments implements OnInit {
  private crudService = inject(CrudService);

  view = signal<'ledger' | 'reconciliation'>('ledger');
  activeModeFilter = 'All';

  transactions = signal<Transaction[]>([]);
  tenants = signal<Tenant[]>([]);

  reserves = signal(324500); // base reserves
  totalCredits = computed(() => {
    return this.journalEntries().reduce((acc, curr) => acc + (curr.credit || 0), 0);
  });
  totalDebits = computed(() => {
    return this.journalEntries().reduce((acc, curr) => acc + (curr.debit || 0), 0);
  });

  filteredTransactions = computed(() => {
    const list = this.transactions();
    const mode = this.activeModeFilter;
    if (mode === 'All') return list;
    return list.filter(tx => tx.paymentMode === mode);
  });

  // Compiled Ledger Entries
  journalEntries = computed(() => {
    const list: any[] = [];
    
    // Convert transactions to Debit/Credit rows
    this.transactions().forEach(tx => {
      if (tx.type === 'RENT' || tx.type === 'DEPOSIT') {
        // Cash/Bank debited, income credited
        list.push({
          date: tx.createdAt,
          particulars: tx.type === 'RENT' ? 'To Room Rent Revenue' : 'To Tenant Security Deposits',
          subtext: `Received from ${tx.tenantName} via ${tx.paymentMode}`,
          refId: tx.id,
          credit: tx.amount,
          debit: 0
        });
      }
    });

    // Load operational expenses
    const expenses = this.crudService.getAll<any>('lsp_expenses');
    expenses.forEach(ex => {
      if (ex.status === 'Approved') {
        list.push({
          date: ex.date || new Date().toISOString(),
          particulars: `By Operations: ${ex.title}`,
          subtext: `Settled via Bank NetBanking`,
          refId: ex.id,
          debit: ex.amount,
          credit: 0
        });
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const residents = this.crudService.getAll<Tenant>(StorageKeys.TENANTS);
    this.tenants.set(residents);

    const txs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);
    const mapped = txs.filter(t => t.propertyId === 'prop-001').map(tx => {
      const res = residents.find(t => t.id === tx.tenantId);
      return {
        id: tx.id,
        tenantId: tx.tenantId,
        tenantName: res ? res.fullName : 'Resident User',
        amount: tx.amount,
        type: tx.type,
        paymentMode: tx.paymentMode || 'UPI',
        status: tx.status,
        createdAt: tx.createdAt
      };
    });

    this.transactions.set(mapped);
  }

  reconcileTx(txId: string) {
    const txs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);
    const idx = txs.findIndex(t => t.id === txId);
    if (idx !== -1) {
      txs[idx].status = 'Reconciled';
      localStorage.setItem(StorageKeys.TRANSACTIONS, JSON.stringify(txs));
      
      // Update local reserves balance
      this.reserves.update(val => val + txs[idx].amount);
      this.loadData();
      alert('Transaction successfully verified and reconciled with bank statement!');
    }
  }
}
