import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { generateId } from '../../../utilities/id-generator.util';

interface ParentUser {
  id: string;
  tenantId: string;
  fullName: string;
}

interface TenantResident {
  id: string;
  propertyId: string;
  fullName: string;
  monthlyRent: number;
  securityDeposit: number;
  pendingDues: number;
  paymentStatus: string;
}

interface TransactionItem {
  id: string;
  orgId: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  type: string;
  paymentMode: string;
  status: string;
  date: string;
  reference?: string;
  description?: string;
}

@Component({
  selector: 'app-parent-payment-history',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatCard, StatusBadge, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in" *ngIf="student()">
      <!-- Page Header -->
      <app-page-header title="Student Dues & Billing" subtitle="Track monthly invoices, download receipts, and securely settle outstanding dues on behalf of your ward">
        <button pButton label="Back to Dashboard" icon="pi pi-arrow-left" (click)="navigateBack()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <!-- KPI Center -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <app-stat-card label="Outstanding Balance" [value]="'₹' + student()!.pendingDues.toLocaleString('en-IN')" icon="pi-indian-rupee" [color]="student()!.pendingDues > 0 ? 'danger' : 'success'" />
        <app-stat-card label="Monthly Rent Dues" [value]="'₹' + student()!.monthlyRent.toLocaleString('en-IN')" icon="pi-calendar" color="primary" />
        <app-stat-card label="Security Deposit Locked" [value]="'₹' + student()!.securityDeposit.toLocaleString('en-IN')" icon="pi-lock" color="warning" />
      </div>

      <!-- Action Panel settles dues -->
      @if (student()!.pendingDues > 0) {
        <div class="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-pulse">
          <div class="space-y-1">
            <h3 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i class="pi pi-exclamation-circle text-red-500"></i> Dues Alert
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Outstanding rent of <strong class="text-slate-800 dark:text-white">₹{{ student()!.pendingDues.toLocaleString('en-IN') }}</strong> is due immediately for this month.
            </p>
          </div>
          <button pButton label="Settle Dues Now" icon="pi pi-credit-card" (click)="openCheckoutModal()"
            class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90 px-6 py-2.5 font-bold shadow-md shadow-indigo-500/25 shrink-0">
          </button>
        </div>
      }

      <!-- Multi Tab Selector -->
      <div class="glass-card overflow-hidden">
        <!-- Tabs Header -->
        <div class="flex border-b border-slate-100 dark:border-slate-800/80">
          <button (click)="activeTab.set('ledger')"
            [class]="activeTab() === 'ledger' ? 'border-b-2 border-indigo-500 font-extrabold text-indigo-500' : 'text-slate-400 font-medium'"
            class="flex-1 py-4 text-sm transition-all focus:outline-none">
            Payment History Ledger
          </button>
          <button (click)="activeTab.set('invoices')"
            [class]="activeTab() === 'invoices' ? 'border-b-2 border-indigo-500 font-extrabold text-indigo-500' : 'text-slate-400 font-medium'"
            class="flex-1 py-4 text-sm transition-all focus:outline-none">
            Invoices List
          </button>
          <button (click)="activeTab.set('receipts')"
            [class]="activeTab() === 'receipts' ? 'border-b-2 border-indigo-500 font-extrabold text-indigo-500' : 'text-slate-400 font-medium'"
            class="flex-1 py-4 text-sm transition-all focus:outline-none">
            Printable Receipts
          </button>
        </div>

        <!-- Tab Body: LEDGER -->
        <div *ngIf="activeTab() === 'ledger'" class="p-6 overflow-x-auto animate-fade-in">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th class="py-3 px-4">Transaction ID</th>
                <th class="py-3 px-4">Date</th>
                <th class="py-3 px-4">Payment Mode</th>
                <th class="py-3 px-4 text-right">Amount</th>
                <th class="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
              @for (tx of transactions(); track tx.id) {
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="py-3.5 px-4 font-mono font-bold text-indigo-500 text-xs">#{{ tx.id.replace('tx-', '') }}</td>
                  <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">{{ formatDate(tx.date) }}</td>
                  <td class="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">{{ tx.paymentMode }}</td>
                  <td class="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-white">₹{{ tx.amount.toLocaleString('en-IN') }}</td>
                  <td class="py-3.5 px-4 text-center"><app-status-badge [status]="tx.status" /></td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="py-8 text-center text-slate-400 italic">No transactions logged.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Tab Body: INVOICES -->
        <div *ngIf="activeTab() === 'invoices'" class="p-6 space-y-4 animate-fade-in">
          @for (inv of invoices(); track inv.id) {
            <div class="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <p class="text-xs font-mono font-bold text-indigo-500">Invoice #{{ inv.id }}</p>
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">Rent Invoice for {{ inv.month }}</h4>
                <p class="text-xs text-slate-400">Issued Date: {{ inv.issueDate }} • Rent: ₹{{ inv.rentAmount }} • Utilities: ₹{{ inv.utilAmount }}</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-extrabold text-slate-800 dark:text-white text-base">₹{{ inv.rentAmount + inv.utilAmount }}</span>
                <button pButton label="Print" icon="pi pi-print" (click)="printInvoice(inv)"
                  class="p-button-xs p-button-outlined rounded-lg text-xs hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:border-slate-700">
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Tab Body: RECEIPTS -->
        <div *ngIf="activeTab() === 'receipts'" class="p-6 space-y-4 animate-fade-in">
          @for (tx of transactions(); track tx.id) {
            <div class="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <p class="text-xs font-mono font-bold text-emerald-500">Receipt #RC-{{ tx.id.replace('tx-', '') }}</p>
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">Rent payment for {{ formatDateMonth(tx.date) }}</h4>
                <p class="text-xs text-slate-400">Mode: {{ tx.paymentMode }} • Ref: {{ tx.reference || 'N/A' }}</p>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-extrabold text-slate-800 dark:text-white text-base">₹{{ tx.amount.toLocaleString('en-IN') }}</span>
                <button pButton label="Download Receipt" icon="pi pi-download" (click)="downloadReceipt(tx)"
                  class="p-button-xs p-button-outlined rounded-lg text-xs hover:bg-slate-100 text-slate-600 dark:text-slate-300 dark:border-slate-700">
                </button>
              </div>
            </div>
          } @empty {
            <p class="text-xs text-slate-400 italic py-4 text-center">No payment receipts available yet.</p>
          }
        </div>
      </div>

      <!-- SIMULATED CHECKOUT MODAL OVERLAY -->
      @if (showCheckout()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="glass-card max-w-md w-full p-8 relative overflow-hidden">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-4">Settle Outstanding Rent</h3>
            <p class="text-xs text-slate-500 mb-6">Settling outstanding dues on behalf of <strong>{{ student()!.fullName }}</strong>.</p>
            
            <form (ngSubmit)="processCheckout()" class="space-y-4">
              <!-- Dues breakdown -->
              <div class="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-xs space-y-2 border border-slate-100 dark:border-slate-800">
                <div class="flex justify-between font-semibold">
                  <span>Pending Monthly Rent:</span>
                  <span>₹{{ student()!.monthlyRent.toLocaleString('en-IN') }}</span>
                </div>
                <div class="flex justify-between font-extrabold text-indigo-500 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-sm">
                  <span>Total Amount Payable:</span>
                  <span>₹{{ student()!.pendingDues.toLocaleString('en-IN') }}</span>
                </div>
              </div>

              <!-- Payment Method selection -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</label>
                <select [(ngModel)]="paymentMode" name="paymentMode" class="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 cursor-pointer">
                  <option value="UPI">GooglePay / PhonePe (UPI)</option>
                  <option value="NetBanking">Net Banking (SBI/HDFC/ICICI)</option>
                  <option value="CreditCard">Credit / Debit Card</option>
                </select>
              </div>

              <!-- Dummy Card / UPI detail field -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment ID / Account Detail</label>
                <input type="text" required pInputText [(ngModel)]="paymentRef" name="paymentRef"
                  placeholder="e.g. 9876543210@paytm or Card ending 1234" class="w-full text-xs" />
              </div>

              <!-- Submit/Cancel -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" pButton label="Cancel" (click)="showCheckout.set(false)" class="p-button-text p-button-sm text-slate-500"></button>
                <button type="submit" pButton label="Authorize Payment" class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white hover:opacity-90"></button>
              </div>
            </form>
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
  `]
})
export class ParentPaymentHistory implements OnInit {
  private authService = inject(AuthService);
  private crudService = inject(CrudService);
  private router = inject(Router);

  student = signal<TenantResident | null>(null);
  parentUser = signal<ParentUser | null>(null);
  
  transactions = signal<TransactionItem[]>([]);
  invoices = signal<any[]>([]);

  // States
  activeTab = signal<'ledger' | 'invoices' | 'receipts'>('ledger');
  showCheckout = signal(false);

  // Form checkout
  paymentMode = 'UPI';
  paymentRef = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const parents = this.crudService.getAll<ParentUser>(StorageKeys.PARENTS);
    const parentId = (user as any).linkedParentId || 'parent-001';
    const parentRecord = parents.find(p => p.id === parentId);

    if (parentRecord) {
      this.parentUser.set(parentRecord);

      const tenants = this.crudService.getAll<TenantResident>(StorageKeys.TENANTS);
      const child = tenants.find(t => t.id === parentRecord.tenantId);

      if (child) {
        this.student.set(child);

        // Fetch child transactions
        const allTx = this.crudService.getAll<TransactionItem>(StorageKeys.TRANSACTIONS);
        const childTx = allTx.filter(t => t.tenantId === child.id);
        this.transactions.set(childTx);

        // Seed static invoices for demo
        this.invoices.set([
          { id: 'INV-2026-05', month: 'May 2026', issueDate: '2026-05-01', rentAmount: child.monthlyRent, utilAmount: 850 },
          { id: 'INV-2026-04', month: 'April 2026', issueDate: '2026-04-01', rentAmount: child.monthlyRent, utilAmount: 700 }
        ]);
      }
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatDateMonth(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  openCheckoutModal() {
    this.paymentRef = '';
    this.showCheckout.set(true);
  }

  processCheckout() {
    if (!this.student() || !this.paymentRef) return;

    const outstandingAmt = this.student()!.pendingDues;

    // 1. Create a new transaction in localStorage
    const newTx: TransactionItem = {
      id: generateId('tx'),
      orgId: 'org-001',
      tenantId: this.student()!.id,
      tenantName: this.student()!.fullName,
      amount: outstandingAmt,
      type: 'RENT',
      paymentMode: this.paymentMode,
      status: 'Paid',
      date: new Date().toISOString(),
      reference: this.paymentRef,
      description: `Rent paid on behalf by parent ${this.parentUser()!.fullName}`
    };

    const allTx = this.crudService.getAll<TransactionItem>(StorageKeys.TRANSACTIONS);
    allTx.unshift(newTx);
    localStorage.setItem(StorageKeys.TRANSACTIONS, JSON.stringify(allTx));

    // 2. Update the tenant resident outstanding balance & status
    const allTenants = this.crudService.getAll<TenantResident>(StorageKeys.TENANTS);
    const tIdx = allTenants.findIndex(t => t.id === this.student()!.id);
    if (tIdx !== -1) {
      allTenants[tIdx].pendingDues = 0;
      allTenants[tIdx].paymentStatus = 'Paid';
      localStorage.setItem(StorageKeys.TENANTS, JSON.stringify(allTenants));
      this.student.set(allTenants[tIdx]);
    }

    // 3. Update local transactions list
    this.transactions.set([newTx, ...this.transactions()]);

    this.showCheckout.set(false);
    alert('Dues paid and settled successfully! Receipt generated.');
  }

  printInvoice(inv: any) {
    alert(`Printing Rent Invoice #${inv.id} for ₹${inv.rentAmount + inv.utilAmount}...`);
  }

  downloadReceipt(tx: any) {
    alert(`Downloading Payment Receipt RC-${tx.id.replace('tx-', '')} for ₹${tx.amount}...`);
  }

  navigateBack() {
    this.router.navigate(['/parent/dashboard']);
  }
}
