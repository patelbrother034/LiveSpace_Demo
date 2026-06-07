import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface Transaction { id: string; date: string; description: string; type: string; amount: number; reference: string; status: string; category: string; }

@Component({
  selector: 'app-accountant-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Transactions" subtitle="Complete financial transaction ledger" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total Credits</p><p class="text-xl font-extrabold text-emerald-600 mt-1">₹{{ totalCredits() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total Debits</p><p class="text-xl font-extrabold text-red-500 mt-1">₹{{ totalDebits() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Net Balance</p><p class="text-xl font-extrabold text-indigo-600 mt-1">₹{{ netBalance() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Count</p><p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{{ transactions().length }}</p></div>
      </div>
      <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-[200px]"><i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i><input pInputText placeholder="Search transactions..." class="w-full !pl-9 rounded-xl text-sm" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" /></div>
        <select class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" [ngModel]="filterType()" (ngModelChange)="filterType.set($event)">
          <option value="">All Types</option><option value="Credit">Credit</option><option value="Debit">Debit</option>
        </select>
      </div>
      <div class="glass-card overflow-hidden"><div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left">
            <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Date</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Description</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Type</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Amount</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Reference</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
          </tr></thead>
          <tbody>
            @for (t of filtered(); track t.id) {
              <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="p-3 text-slate-500">{{ t.date }}</td><td class="p-3 font-medium text-slate-800 dark:text-white">{{ t.description }}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="t.type === 'Credit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">{{ t.type }}</span></td>
                <td class="p-3 font-bold" [class]="t.type === 'Credit' ? 'text-emerald-600' : 'text-red-500'">{{ t.type === 'Credit' ? '+' : '-' }}₹{{ t.amount | number:'1.0-0' }}</td>
                <td class="p-3 font-mono text-xs text-slate-400">{{ t.reference }}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{{ t.status }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div></div>
    </div>
  `, styles: [``]
})
export class AccountantTransactions {
  searchQuery = signal(''); filterType = signal('');
  transactions = signal<Transaction[]>([
    { id: 'tx1', date: 'Jun 3, 2026', description: 'Rent collection — Rahul Sharma (Room 301)', type: 'Credit', amount: 8500, reference: 'RNT-060301', status: 'Completed', category: 'Rent' },
    { id: 'tx2', date: 'Jun 3, 2026', description: 'Electricity bill payment — June 2026', type: 'Debit', amount: 15000, reference: 'UTL-060601', status: 'Completed', category: 'Utilities' },
    { id: 'tx3', date: 'Jun 2, 2026', description: 'Rent collection — Priya Patel (Room 205)', type: 'Credit', amount: 7500, reference: 'RNT-060202', status: 'Completed', category: 'Rent' },
    { id: 'tx4', date: 'Jun 2, 2026', description: 'Plumbing repair — Room 102', type: 'Debit', amount: 3200, reference: 'MNT-060201', status: 'Completed', category: 'Maintenance' },
    { id: 'tx5', date: 'Jun 1, 2026', description: 'Security deposit — New tenant Amit Kumar', type: 'Credit', amount: 20000, reference: 'DEP-060101', status: 'Completed', category: 'Deposit' },
    { id: 'tx6', date: 'Jun 1, 2026', description: 'Staff salary — Suresh Kumar (Caretaker)', type: 'Debit', amount: 18000, reference: 'SAL-060101', status: 'Completed', category: 'Salary' },
    { id: 'tx7', date: 'May 31, 2026', description: 'Rent collection — Deepak Verma (Room 201)', type: 'Credit', amount: 10000, reference: 'RNT-053101', status: 'Completed', category: 'Rent' },
    { id: 'tx8', date: 'May 31, 2026', description: 'Refund — Sneha Reddy deposit adjustment', type: 'Debit', amount: 5000, reference: 'REF-053101', status: 'Completed', category: 'Refund' },
    { id: 'tx9', date: 'May 30, 2026', description: 'Food vendor payment — May meals', type: 'Debit', amount: 45000, reference: 'FD-053001', status: 'Pending', category: 'Food' },
    { id: 'tx10', date: 'May 30, 2026', description: 'Rent collection — Vikram Singh (Room 304)', type: 'Credit', amount: 8500, reference: 'RNT-053002', status: 'Completed', category: 'Rent' },
  ]);
  totalCredits = computed(() => this.transactions().filter(t => t.type === 'Credit').reduce((s, t) => s + t.amount, 0));
  totalDebits = computed(() => this.transactions().filter(t => t.type === 'Debit').reduce((s, t) => s + t.amount, 0));
  netBalance = computed(() => this.totalCredits() - this.totalDebits());
  filtered = computed(() => {
    let list = this.transactions();
    const q = this.searchQuery().toLowerCase(); const f = this.filterType();
    if (q) list = list.filter(t => t.description.toLowerCase().includes(q));
    if (f) list = list.filter(t => t.type === f);
    return list;
  });
}
