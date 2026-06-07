import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-tenant-payments',
  standalone: true,
  imports: [CommonModule, PageHeader, StatusBadge, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="My Payments" subtitle="Track your rent payments and download receipts" />

      <!-- Current Dues Card -->
      <div class="glass-card p-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
                 [class]="currentDues() > 0 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-emerald-50 dark:bg-emerald-950/30'">
              <i class="pi pi-indian-rupee text-2xl"
                 [class]="currentDues() > 0 ? 'text-amber-500' : 'text-emerald-500'"></i>
            </div>
            <div>
              <p class="text-sm text-slate-500 dark:text-slate-400">Current Dues</p>
              <p class="text-3xl font-bold" [class]="currentDues() > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
                ₹{{ currentDues() | number }}
              </p>
            </div>
          </div>
          @if (currentDues() > 0) {
            <button pButton label="Pay Now" icon="pi pi-credit-card" (click)="showPayModal.set(true)"
              class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white hover:opacity-90"></button>
          } @else {
            <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
              <i class="pi pi-check-circle text-emerald-500"></i>
              <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">All Paid Up!</span>
            </div>
          }
        </div>
      </div>

      <!-- Payment History -->
      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-history text-indigo-500"></i> Payment History
          </h3>
          <span class="text-xs text-slate-400">{{ transactions().length }} records</span>
        </div>

        @if (transactions().length === 0) {
          <div class="flex flex-col items-center py-12 text-center">
            <i class="pi pi-wallet text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
            <p class="text-sm text-slate-400">No payment records yet</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700">
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Date</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Type</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Amount</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Mode</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (tx of transactions(); track tx.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="py-3.5 pr-4 text-sm text-slate-700 dark:text-slate-300">{{ tx.paymentDate || tx.createdAt || '—' }}</td>
                    <td class="py-3.5 pr-4">
                      <span class="text-sm font-medium text-slate-800 dark:text-white">{{ tx.type }}</span>
                    </td>
                    <td class="py-3.5 pr-4 text-sm font-bold"
                        [class]="tx.type === 'EXPENSE' || tx.type === 'REFUND' ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'">
                      ₹{{ tx.amount | number }}
                    </td>
                    <td class="py-3.5 pr-4 text-sm text-slate-500 dark:text-slate-400">{{ tx.paymentMode || tx.mode || '—' }}</td>
                    <td class="py-3.5 pr-4"><app-status-badge [status]="tx.status" /></td>
                    <td class="py-3.5">
                      <button pButton icon="pi pi-download" label="Receipt" (click)="downloadReceipt()"
                        class="p-button-sm p-button-text p-button-secondary rounded-lg text-xs"></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Pay Now Modal -->
      @if (showPayModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" (click)="showPayModal.set(false)">
          <div class="glass-card p-8 max-w-sm w-full text-center" (click)="$event.stopPropagation()">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-qrcode text-3xl text-white"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Scan QR to Pay</h3>
            <div class="my-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div class="w-32 h-32 mx-auto bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3">
                <i class="pi pi-qrcode text-5xl text-slate-400"></i>
              </div>
              <p class="text-lg font-bold text-slate-800 dark:text-white">₹{{ currentDues() | number }}</p>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">UPI ID: <span class="font-mono font-semibold text-indigo-600 dark:text-indigo-400">livespace&#64;upi</span></p>
            <p class="text-xs text-slate-400 mb-6">Payment will be verified automatically</p>
            <button pButton label="Close" icon="pi pi-times" (click)="showPayModal.set(false)"
              class="p-button-outlined rounded-xl w-full"></button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class TenantPaymentsComponent implements OnInit {
  private crudService = inject(CrudService);

  currentDues = signal(0);
  transactions = signal<any[]>([]);
  showPayModal = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const me = tenants.find((t: any) => t.status === 'Active') || tenants[0];
    if (!me) return;

    this.currentDues.set(me.pendingDues || 0);

    const txs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS)
      .filter((tx: any) => tx.tenantId === me.id)
      .sort((a: any, b: any) => (b.paymentDate || b.createdAt || '').localeCompare(a.paymentDate || a.createdAt || ''));
    this.transactions.set(txs);
  }

  downloadReceipt() {
    alert('Receipt downloaded!');
  }
}
