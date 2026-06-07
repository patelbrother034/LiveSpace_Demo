import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface Receipt { id: string; receiptNo: string; tenant: string; amount: number; mode: string; date: string; }

@Component({
  selector: 'app-accountant-receipts',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Receipts" subtitle="Manage and print payment receipts" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total Receipts</p><p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{{ receipts().length }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">This Month</p><p class="text-xl font-extrabold text-indigo-600 mt-1">{{ monthReceipts() }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Cash Receipts</p><p class="text-xl font-extrabold text-amber-600 mt-1">{{ cashReceipts() }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Digital Receipts</p><p class="text-xl font-extrabold text-emerald-600 mt-1">{{ digitalReceipts() }}</p></div>
      </div>
      <div class="glass-card overflow-hidden"><div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left">
            <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Receipt No</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Tenant</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Amount</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Mode</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Date</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            @for (r of receipts(); track r.id) {
              <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="p-3 font-mono font-bold text-indigo-600">{{ r.receiptNo }}</td>
                <td class="p-3 font-medium text-slate-800 dark:text-white">{{ r.tenant }}</td>
                <td class="p-3 font-bold text-emerald-600">₹{{ r.amount | number:'1.0-0' }}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="r.mode === 'Cash' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'">{{ r.mode }}</span></td>
                <td class="p-3 text-slate-500">{{ r.date }}</td>
                <td class="p-3"><button pButton icon="pi pi-print" label="Print" class="p-button-sm p-button-outlined rounded-lg" (click)="printReceipt(r)"></button></td>
              </tr>
            }
          </tbody>
        </table>
      </div></div>
    </div>
  `, styles: [``]
})
export class AccountantReceipts {
  receipts = signal<Receipt[]>([
    { id: 'r1', receiptNo: 'RCT-2026-0045', tenant: 'Rahul Sharma', amount: 8500, mode: 'UPI', date: 'Jun 3, 2026' },
    { id: 'r2', receiptNo: 'RCT-2026-0044', tenant: 'Priya Patel', amount: 7500, mode: 'Cash', date: 'Jun 2, 2026' },
    { id: 'r3', receiptNo: 'RCT-2026-0043', tenant: 'Amit Kumar', amount: 10000, mode: 'Bank Transfer', date: 'Jun 1, 2026' },
    { id: 'r4', receiptNo: 'RCT-2026-0042', tenant: 'Deepak Verma', amount: 10000, mode: 'UPI', date: 'May 31, 2026' },
    { id: 'r5', receiptNo: 'RCT-2026-0041', tenant: 'Vikram Singh', amount: 8500, mode: 'Cash', date: 'May 30, 2026' },
    { id: 'r6', receiptNo: 'RCT-2026-0040', tenant: 'Kavita Nair', amount: 7500, mode: 'UPI', date: 'May 29, 2026' },
    { id: 'r7', receiptNo: 'RCT-2026-0039', tenant: 'Sneha Reddy', amount: 6500, mode: 'Bank Transfer', date: 'May 28, 2026' },
  ]);
  monthReceipts = computed(() => this.receipts().filter(r => r.date.includes('Jun')).length);
  cashReceipts = computed(() => this.receipts().filter(r => r.mode === 'Cash').length);
  digitalReceipts = computed(() => this.receipts().filter(r => r.mode !== 'Cash').length);
  printReceipt(r: Receipt) { alert(`Printing receipt ${r.receiptNo} for ₹${r.amount}`); }
}
