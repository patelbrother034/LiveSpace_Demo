import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface LedgerEntry { id: string; date: string; account: string; particular: string; debit: number; credit: number; balance: number; }

@Component({
  selector: 'app-accountant-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="General Ledger" subtitle="Double-entry accounting ledger with running balances" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Opening Balance</p><p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">₹5,00,000</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total Debits</p><p class="text-xl font-extrabold text-red-500 mt-1">₹{{ totalDebits() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total Credits</p><p class="text-xl font-extrabold text-emerald-600 mt-1">₹{{ totalCredits() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Closing Balance</p><p class="text-xl font-extrabold text-indigo-600 mt-1">₹{{ closingBalance() | number:'1.0-0' }}</p></div>
      </div>
      <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
        <select class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" [ngModel]="filterAccount()" (ngModelChange)="filterAccount.set($event)">
          <option value="">All Accounts</option><option>Rent Income</option><option>Operating Expenses</option><option>Security Deposits</option><option>Salary Expenses</option><option>Utility Expenses</option>
        </select>
        <span class="text-xs text-slate-400 ml-auto">{{ filteredEntries().length }} entries</span>
      </div>
      <div class="glass-card overflow-hidden"><div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
            <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Date</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Account</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Particulars</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Debit (₹)</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Credit (₹)</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Balance (₹)</th>
          </tr></thead>
          <tbody>
            @for (e of filteredEntries(); track e.id) {
              <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="p-3 text-slate-500 text-xs">{{ e.date }}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">{{ e.account }}</span></td>
                <td class="p-3 text-slate-700 dark:text-slate-300">{{ e.particular }}</td>
                <td class="p-3 text-right font-mono font-bold" [class]="e.debit > 0 ? 'text-red-500' : 'text-slate-300 dark:text-slate-700'">{{ e.debit > 0 ? (e.debit | number:'1.0-0') : '—' }}</td>
                <td class="p-3 text-right font-mono font-bold" [class]="e.credit > 0 ? 'text-emerald-600' : 'text-slate-300 dark:text-slate-700'">{{ e.credit > 0 ? (e.credit | number:'1.0-0') : '—' }}</td>
                <td class="p-3 text-right font-mono font-extrabold text-slate-800 dark:text-white">{{ e.balance | number:'1.0-0' }}</td>
              </tr>
            }
          </tbody>
          <tfoot><tr class="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 font-bold">
            <td colspan="3" class="p-3 text-xs uppercase text-slate-500">Totals</td>
            <td class="p-3 text-right font-mono text-red-500">{{ totalDebits() | number:'1.0-0' }}</td>
            <td class="p-3 text-right font-mono text-emerald-600">{{ totalCredits() | number:'1.0-0' }}</td>
            <td class="p-3 text-right font-mono text-indigo-600">{{ closingBalance() | number:'1.0-0' }}</td>
          </tr></tfoot>
        </table>
      </div></div>
    </div>
  `, styles: [``]
})
export class AccountantLedger {
  filterAccount = signal('');
  entries = signal<LedgerEntry[]>([
    { id: 'l1', date: 'Jun 3', account: 'Rent Income', particular: 'Rent — Rahul Sharma (301)', debit: 0, credit: 8500, balance: 508500 },
    { id: 'l2', date: 'Jun 3', account: 'Utility Expenses', particular: 'Electricity bill — June', debit: 15000, credit: 0, balance: 493500 },
    { id: 'l3', date: 'Jun 2', account: 'Rent Income', particular: 'Rent — Priya Patel (205)', debit: 0, credit: 7500, balance: 501000 },
    { id: 'l4', date: 'Jun 2', account: 'Operating Expenses', particular: 'Plumbing repair — Room 102', debit: 3200, credit: 0, balance: 497800 },
    { id: 'l5', date: 'Jun 1', account: 'Security Deposits', particular: 'Deposit — Amit Kumar', debit: 0, credit: 20000, balance: 517800 },
    { id: 'l6', date: 'Jun 1', account: 'Salary Expenses', particular: 'Salary — Suresh Kumar', debit: 18000, credit: 0, balance: 499800 },
    { id: 'l7', date: 'May 31', account: 'Rent Income', particular: 'Rent — Deepak Verma (201)', debit: 0, credit: 10000, balance: 509800 },
    { id: 'l8', date: 'May 31', account: 'Operating Expenses', particular: 'Refund — Sneha Reddy', debit: 5000, credit: 0, balance: 504800 },
    { id: 'l9', date: 'May 30', account: 'Operating Expenses', particular: 'Food vendor — May meals', debit: 45000, credit: 0, balance: 459800 },
    { id: 'l10', date: 'May 30', account: 'Rent Income', particular: 'Rent — Vikram Singh (304)', debit: 0, credit: 8500, balance: 468300 },
  ]);
  filteredEntries = computed(() => { const f = this.filterAccount(); return f ? this.entries().filter(e => e.account === f) : this.entries(); });
  totalDebits = computed(() => this.filteredEntries().reduce((s, e) => s + e.debit, 0));
  totalCredits = computed(() => this.filteredEntries().reduce((s, e) => s + e.credit, 0));
  closingBalance = computed(() => 500000 + this.totalCredits() - this.totalDebits());
}
