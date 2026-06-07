import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface Receipt {
  id: string;
  receiptNo: string;
  date: string;
  amount: number;
  paymentMode: string;
  transactionId: string;
  tenantName: string;
  pgName: string;
  status: string;
}

@Component({
  selector: 'app-parent-receipt-list',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule, DialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Payment Receipts" subtitle="Download and view receipts for all payments made" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Receipts</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ receipts().length }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paid</p>
          <p class="text-2xl font-extrabold text-emerald-600 mt-1">₹{{ totalPaid() | number:'1.0-0' }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Payment</p>
          <p class="text-2xl font-extrabold text-indigo-600 mt-1">{{ receipts()[0]?.date || '—' }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Streak</p>
          <p class="text-2xl font-extrabold text-purple-600 mt-1">6 months 🔥</p>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 text-left">
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Receipt No</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Date</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Amount</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Mode</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Transaction ID</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of receipts(); track r.id) {
                <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="p-4 font-mono font-bold text-indigo-600">{{ r.receiptNo }}</td>
                  <td class="p-4 text-slate-700 dark:text-slate-300">{{ r.date }}</td>
                  <td class="p-4 font-bold text-slate-800 dark:text-white">₹{{ r.amount | number:'1.0-0' }}</td>
                  <td class="p-4">
                    <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">{{ r.paymentMode }}</span>
                  </td>
                  <td class="p-4 font-mono text-xs text-slate-500">{{ r.transactionId }}</td>
                  <td class="p-4 flex gap-1">
                    <button pButton icon="pi pi-eye" class="p-button-text p-button-sm p-button-rounded" (click)="viewReceipt(r)"></button>
                    <button pButton icon="pi pi-print" class="p-button-text p-button-sm p-button-rounded" (click)="printReceipt(r)"></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <p-dialog [(visible)]="detailVisible" header="Payment Receipt" [modal]="true" [style]="{width: '440px'}" styleClass="rounded-2xl">
        @if (selectedReceipt(); as r) {
          <div class="space-y-4 pt-2" id="receipt-print">
            <div class="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
              <h3 class="text-lg font-extrabold text-indigo-600">LiveSpace Pro</h3>
              <p class="text-xs text-slate-400">Payment Receipt</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Receipt No</span><span class="font-bold font-mono">{{ r.receiptNo }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Date</span><span class="font-bold">{{ r.date }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">From</span><span class="font-bold">{{ r.tenantName }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">To</span><span class="font-bold">{{ r.pgName }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Payment Mode</span><span class="font-bold">{{ r.paymentMode }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Transaction ID</span><span class="font-bold font-mono text-xs">{{ r.transactionId }}</span></div>
              <div class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span class="font-bold">Amount Paid</span>
                <span class="font-extrabold text-emerald-600 text-lg">₹{{ r.amount | number:'1.0-0' }}</span>
              </div>
            </div>
            <p class="text-center text-[10px] text-slate-400 italic">This is a computer-generated receipt and does not require a signature.</p>
          </div>
        }
      </p-dialog>
    </div>
  `,
  styles: [``]
})
export class ParentReceiptListComponent {
  detailVisible = false;
  selectedReceipt = signal<Receipt | null>(null);

  receipts = signal<Receipt[]>([
    { id: 'rcpt-1', receiptNo: 'RCT-2026-0601', date: '2026-06-01', amount: 16048, paymentMode: 'UPI', transactionId: 'UPI2026060198732', tenantName: 'Mr. Sharma (Parent)', pgName: 'Sunrise PG Hostel', status: 'Confirmed' },
    { id: 'rcpt-2', receiptNo: 'RCT-2026-0501', date: '2026-05-02', amount: 16284, paymentMode: 'Bank Transfer', transactionId: 'NEFT20260502451', tenantName: 'Mr. Sharma (Parent)', pgName: 'Sunrise PG Hostel', status: 'Confirmed' },
    { id: 'rcpt-3', receiptNo: 'RCT-2026-0401', date: '2026-04-01', amount: 15930, paymentMode: 'UPI', transactionId: 'UPI2026040187234', tenantName: 'Mr. Sharma (Parent)', pgName: 'Sunrise PG Hostel', status: 'Confirmed' },
    { id: 'rcpt-4', receiptNo: 'RCT-2026-0301', date: '2026-03-03', amount: 15871, paymentMode: 'UPI', transactionId: 'UPI2026030365821', tenantName: 'Mr. Sharma (Parent)', pgName: 'Sunrise PG Hostel', status: 'Confirmed' },
    { id: 'rcpt-5', receiptNo: 'RCT-2026-0201', date: '2026-02-01', amount: 16107, paymentMode: 'Card', transactionId: 'CRD2026020142981', tenantName: 'Mr. Sharma (Parent)', pgName: 'Sunrise PG Hostel', status: 'Confirmed' },
  ]);

  totalPaid = computed(() => this.receipts().reduce((s, r) => s + r.amount, 0));

  viewReceipt(r: Receipt) { this.selectedReceipt.set(r); this.detailVisible = true; }
  printReceipt(r: Receipt) { this.viewReceipt(r); }
}
