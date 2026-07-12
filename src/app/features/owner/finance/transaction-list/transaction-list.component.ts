import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { PaymentModalService } from '../../../../core/services/payment-modal.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PageHeader,
    StatusBadge, ButtonModule, InputTextModule, TableModule, TooltipModule
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Transaction Registry" subtitle="Audit and record operational cash flows">
        <button pButton label="Record Payment" icon="pi pi-indian-rupee" (click)="openPaymentModal()"
          class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- Filters & Toolbar -->
      <div class="glass-card p-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search input -->
          <div class="relative md:col-span-2">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="text" pInputText
              placeholder="Search by description or transaction ID..."
              class="w-full !pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 transition-all"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)" />
          </div>

          <!-- Type filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              [ngModel]="selectedType()"
              (ngModelChange)="selectedType.set($event)">
              <option value="All">All Types</option>
              <option value="RENT">Rent Incomes</option>
              <option value="DEPOSIT">Security Deposits</option>
              <option value="EXPENSE">Expenses</option>
              <option value="REFUND">Refunds</option>
              <option value="UTILITY">Utilities</option>
            </select>
          </div>

          <!-- Export CSV Simulation -->
          <div class="flex items-center justify-end">
            <button pButton label="Export Excel/CSV" icon="pi pi-download" (click)="simulateExport()"
              class="w-full p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50">
            </button>
          </div>
        </div>
      </div>

      <!-- Transactions table -->
      <div class="glass-card overflow-hidden">
        <p-table [value]="filteredTransactions()" [paginator]="true" [rows]="10" responsiveLayout="scroll"
                 class="w-full border-collapse text-left text-xs">
          <ng-template pTemplate="header">
            <tr class="border-b text-slate-400 uppercase font-semibold">
              <th class="py-3 px-4">TX ID</th>
              <th class="py-3 px-4">Resident / Entity</th>
              <th class="py-3 px-4">Type</th>
              <th class="py-3 px-4 text-right">Amount (₹)</th>
              <th class="py-3 px-4">Date</th>
              <th class="py-3 px-4">Mode</th>
              <th class="py-3 px-4 text-center">Status</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-tx>
            <tr class="hover:bg-slate-50/50">
              <td class="py-3.5 px-4 font-mono font-bold text-[10px] text-slate-400">{{ tx.id }}</td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-800 dark:text-white">{{ tx.entityName }}</p>
                <p class="text-[10px] text-slate-400">{{ tx.propertyName || 'N/A' }}</p>
              </td>
              <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                  [class]="tx.type === 'RENT' || tx.type === 'DEPOSIT' || tx.type === 'UTILITY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
                  {{ tx.type }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right font-bold" [class.text-rose-600]="tx.type === 'EXPENSE' || tx.type === 'REFUND'">
                {{ tx.type === 'EXPENSE' || tx.type === 'REFUND' ? '-' : '+' }}₹{{ tx.amount | number }}
              </td>
              <td class="py-3.5 px-4 text-slate-500">{{ tx.paymentDate || tx.createdAt }}</td>
              <td class="py-3.5 px-4 font-semibold text-slate-400">{{ tx.paymentMode || 'UPI' }}</td>
              <td class="py-3.5 px-4 text-center">
                <app-status-badge [status]="tx.status" />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="py-8 text-center text-slate-400">No transaction logs match your criteria.</td>
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
  `]
})
export class TransactionListComponent implements OnInit {
  private crudService = inject(CrudService);
  private paymentModal = inject(PaymentModalService);

  searchQuery = signal('');
  selectedType = signal('All');
  transactions = signal<any[]>([]);
  private activeTenants: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const rawTxs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);
    const properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const expenses = this.crudService.getAll<any>(StorageKeys.EXPENSES);

    const mapped = rawTxs.map((tx: any) => {
      const prop = properties.find((p: any) => p.id === tx.propertyId);
      let entityName = 'Operational Expense';
      if (tx.tenantId) {
        const tenant = tenants.find((t: any) => t.id === tx.tenantId);
        entityName = tenant ? (tenant.fullName || `${tenant.firstName} ${tenant.lastName}`) : 'Unknown Resident';
      } else if (tx.type === 'EXPENSE') {
        const expItem = expenses.find((e: any) => e.id === tx.id);
        entityName = expItem ? expItem.payee || expItem.category : 'Vendor';
      }
      return { ...tx, entityName, propertyName: prop ? prop.name : 'All Portfolio' };
    });

    this.transactions.set(mapped);

    this.activeTenants = tenants
      .filter((t: any) => t.status === 'Active' || t.status === 'Notice')
      .map((t: any) => ({
        id: t.id,
        fullName: t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
        pendingDues: t.pendingDues || 0,
        propertyId: t.propertyId,
        monthlyRent: t.monthlyRent || t.rent || 0
      }));
  }

  filteredTransactions = computed(() => {
    let list = this.transactions();
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.selectedType();

    if (query) {
      list = list.filter(tx =>
        tx.id.toLowerCase().includes(query) ||
        tx.entityName.toLowerCase().includes(query) ||
        (tx.description && tx.description.toLowerCase().includes(query))
      );
    }
    if (type !== 'All') {
      list = list.filter(tx => tx.type === type);
    }
    return list.sort((a, b) => {
      const dateA = a.paymentDate || a.createdAt || '';
      const dateB = b.paymentDate || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  });

  openPaymentModal() {
    this.paymentModal.open(this.activeTenants, (data) => this.handlePaymentSubmit(data));
  }

  handlePaymentSubmit(f: any) {
    const tenant = this.activeTenants.find(t => t.id === f.tenantId);
    if (!tenant) return;

    const newTxId = 'tx-' + Date.now().toString().slice(-4);
    this.crudService.create(StorageKeys.TRANSACTIONS, {
      id: newTxId, orgId: 'org-001',
      propertyId: tenant.propertyId,
      tenantId: f.tenantId, type: f.type,
      amount: f.amount, paymentMode: f.paymentMode,
      paymentDate: new Date().toISOString().split('T')[0],
      description: f.description || `Cash Collection - ${f.type}`,
      status: 'Paid', createdAt: new Date().toISOString().split('T')[0]
    });

    const actualTenant = this.crudService.getById<any>(StorageKeys.TENANTS, f.tenantId);
    if (actualTenant) {
      const newDues = Math.max(0, (actualTenant.pendingDues || 0) - f.amount);
      this.crudService.update<any>(StorageKeys.TENANTS, f.tenantId, {
        pendingDues: newDues,
        totalPaid: (actualTenant.totalPaid || 0) + f.amount,
        paymentStatus: newDues === 0 ? 'Paid' : 'Partial'
      });
    }

    this.crudService.create(StorageKeys.RECEIPTS, {
      id: 'rcpt-' + Date.now().toString().slice(-4),
      orgId: 'org-001', propertyId: tenant.propertyId,
      tenantId: f.tenantId, transactionId: newTxId,
      amount: f.amount,
      receivedDate: new Date().toISOString().split('T')[0],
      paymentMode: f.paymentMode,
      referenceNumber: f.referenceId || 'CASH-RECVD',
      createdAt: new Date().toISOString().split('T')[0]
    });

    alert(`✅ Payment of ₹${f.amount.toLocaleString()} recorded for ${tenant.fullName}!`);
    this.loadData();
  }

  simulateExport() {
    alert('Simulating CSV Export... Your transaction spreadsheet has been processed and downloaded successfully.');
  }
}
