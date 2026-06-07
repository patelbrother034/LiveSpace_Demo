import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, PageHeader,
    StatusBadge, ButtonModule, InputTextModule, TooltipModule, DatePicker
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Operational Expenses" subtitle="Track utility bills, staff payrolls, repairs, and vendor cash flows">
        <button pButton label="Log New Expense" icon="pi pi-plus" (click)="openExpenseModal()"
          class="p-button-sm rounded-xl bg-gradient-to-r from-rose-500 to-red-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-card p-5 space-y-2 border-l-4 border-rose-500">
          <p class="text-xs text-slate-400 font-bold uppercase">Total Approved Expenses</p>
          <p class="text-2xl font-bold text-rose-600">₹{{ stats().totalApproved | number }}</p>
          <span class="text-[10px] text-slate-400">Current calendar cycle</span>
        </div>
        <div class="glass-card p-5 space-y-2 border-l-4 border-amber-500">
          <p class="text-xs text-slate-400 font-bold uppercase">Pending Approval</p>
          <p class="text-2xl font-bold text-amber-600">₹{{ stats().totalPending | number }}</p>
          <span class="text-[10px] text-amber-500 font-semibold">{{ stats().pendingCount }} requests require audit</span>
        </div>
        <div class="glass-card p-5 space-y-2">
          <p class="text-xs text-slate-400 font-bold uppercase">Primary Spend Category</p>
          <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ stats().topCategory }}</p>
          <span class="text-[10px] text-slate-400">Represents largest outflow</span>
        </div>
      </div>

      <!-- Expenses logs table -->
      <div class="glass-card p-6">
        <div class="flex items-center justify-between border-b pb-3 mb-4">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Expense Log & Audits</h3>
          <div class="flex items-center gap-2">
            @for (filter of ['All', 'Approved', 'Pending', 'Rejected']; track filter) {
              <button pButton [label]="filter"
                [class]="activeFilter() === filter ? 'p-button-sm rounded-lg bg-indigo-500 text-white' : 'p-button-sm p-button-text text-slate-500'"
                (click)="activeFilter.set(filter)">
              </button>
            }
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b text-slate-400 uppercase font-semibold">
                <th class="py-3 px-3">Description</th>
                <th class="py-3 px-3">Category</th>
                <th class="py-3 px-3">Payee / Vendor</th>
                <th class="py-3 px-3 text-right">Amount (₹)</th>
                <th class="py-3 px-3">Date</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              @for (exp of filteredExpenses(); track exp.id) {
                <tr class="hover:bg-slate-50/50">
                  <td class="py-3 px-3 font-semibold text-slate-800 dark:text-white">
                    {{ exp.description }}
                  </td>
                  <td class="py-3 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {{ exp.category }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-slate-500">{{ exp.payee }}</td>
                  <td class="py-3 px-3 text-right font-bold text-rose-500">₹{{ exp.amount | number }}</td>
                  <td class="py-3 px-3 text-slate-500">{{ exp.paymentDate }}</td>
                  <td class="py-3 px-3 text-center">
                    <app-status-badge [status]="exp.status" />
                  </td>
                  <td class="py-3 px-3 text-center">
                    @if (exp.status === 'Pending') {
                      <div class="flex items-center justify-center gap-1">
                        <button pButton icon="pi pi-times-circle" class="p-button-sm p-button-text p-button-rounded text-rose-500" pTooltip="Reject Expense" tooltipPosition="top" (click)="auditExpense(exp.id, 'Rejected')"></button>
                        <button pButton icon="pi pi-check-circle" class="p-button-sm p-button-text p-button-rounded text-emerald-500" pTooltip="Approve & Pay" tooltipPosition="top" (click)="auditExpense(exp.id, 'Approved')"></button>
                      </div>
                    } @else {
                      <span class="text-[10px] text-slate-400">Audited</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="py-6 text-center text-slate-400">No expense records found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Log Expense Dialog Panel -->
      @if (showExpenseModal()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div class="w-full max-w-md bg-white dark:bg-slate-900 h-full p-8 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div class="space-y-6">
              <div class="flex items-center justify-between border-b pb-3">
                <h3 class="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <i class="pi pi-wallet text-rose-500"></i> Log Vendor Outflow
                </h3>
                <button pButton icon="pi pi-times" class="p-button-sm p-button-text text-slate-400" (click)="closeExpenseModal()"></button>
              </div>

              <form [formGroup]="expenseForm" class="space-y-4 text-xs">
                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">Select Property Context *</label>
                  <select formControlName="propertyId" class="w-full px-3 py-2 rounded-lg border bg-white">
                    <option value="">Choose Property</option>
                    @for (p of properties; track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">Payee / Vendor Name *</label>
                  <input type="text" pInputText formControlName="payee" class="w-full" placeholder="e.g. Agarwal Plumbing Solutions" />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">Spend Category *</label>
                  <select formControlName="category" class="w-full px-3 py-2 rounded-lg border bg-white">
                    <option value="Utilities">Utility Bills (Electricity/Internet)</option>
                    <option value="Maintenance">Repairs & Maintenance</option>
                    <option value="Food Supply">Food & Catering Supplies</option>
                    <option value="Staff Salaries">Staff Salaries / Payroll</option>
                    <option value="Marketing">Marketing / Software Licensing</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">Payment Amount (₹) *</label>
                  <input type="number" pInputText formControlName="amount" class="w-full" placeholder="e.g. 3500" />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">Expense Outflow Date *</label>
                  <p-datepicker formControlName="paymentDate" styleClass="w-full" inputStyleClass="w-full" dateFormat="yy-mm-dd"></p-datepicker>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">Expense Description *</label>
                  <input type="text" pInputText formControlName="description" class="w-full" placeholder="e.g. Plumbing replacement in block C washrooms" />
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-bold text-slate-400 uppercase">Simulated Receipt Upload</label>
                  <div class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center text-slate-400">
                    <i class="pi pi-file text-xl mb-1 block"></i>
                    <p class="text-[10px]">Upload scanned vendor invoice bills</p>
                  </div>
                </div>
              </form>
            </div>

            <div class="flex gap-2 pt-6 border-t mt-6">
              <button pButton label="Cancel" (click)="closeExpenseModal()" class="p-button-sm p-button-outlined p-button-secondary rounded-lg flex-1 py-2"></button>
              <button pButton label="Submit for Approval" (click)="submitExpense()" class="p-button-sm rounded-lg bg-rose-500 text-white border-none flex-1 py-2"></button>
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
  `]
})
export class ExpenseListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private crudService = inject(CrudService);

  activeFilter = signal<string>('All');
  expenses = signal<any[]>([]);
  properties: any[] = [];
  showExpenseModal = signal<boolean>(false);
  expenseForm!: FormGroup;

  ngOnInit() {
    this.loadData();
    this.initForm();
  }

  initForm() {
    this.expenseForm = this.fb.group({
      propertyId: ['', Validators.required],
      payee: ['', Validators.required],
      category: ['Utilities', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      paymentDate: [new Date().toISOString().split('T')[0], Validators.required],
      description: ['', Validators.required]
    });
  }

  loadData() {
    const rawExpenses = this.crudService.getAll<any>(StorageKeys.EXPENSES);
    this.expenses.set(rawExpenses);
    this.properties = this.crudService.getAll<any>(StorageKeys.PROPERTIES);
  }

  stats = computed(() => {
    const list = this.expenses();
    const approved = list.filter(e => e.status === 'Approved');
    const pending = list.filter(e => e.status === 'Pending');

    const totalApproved = approved.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalPending = pending.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Compute top spend category
    const catSums: Record<string, number> = {};
    approved.forEach(e => {
      catSums[e.category] = (catSums[e.category] || 0) + e.amount;
    });

    let topCategory = 'Utilities';
    let max = 0;
    Object.keys(catSums).forEach(cat => {
      if (catSums[cat] > max) {
        max = catSums[cat];
        topCategory = cat;
      }
    });

    return {
      totalApproved,
      totalPending,
      pendingCount: pending.length,
      topCategory
    };
  });

  filteredExpenses = computed(() => {
    let list = this.expenses();
    const filter = this.activeFilter();

    if (filter !== 'All') {
      list = list.filter(e => e.status === filter);
    }
    
    // Sort by date descending
    return list.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  });

  openExpenseModal() {
    this.showExpenseModal.set(true);
  }

  closeExpenseModal() {
    this.showExpenseModal.set(false);
    this.expenseForm.reset({ category: 'Utilities', paymentDate: new Date().toISOString().split('T')[0] });
  }

  submitExpense() {
    if (this.expenseForm.invalid) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const f = this.expenseForm.value;
    const newExp = {
      id: 'exp-' + Date.now().toString().slice(-4),
      orgId: 'org-001',
      propertyId: f.propertyId,
      category: f.category,
      amount: f.amount,
      paymentDate: f.paymentDate,
      payee: f.payee,
      description: f.description,
      status: 'Pending', // Defaults to Pending approval
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.crudService.create(StorageKeys.EXPENSES, newExp);
    alert('Expense request successfully logged! Marked as Pending Approval for owners.');
    this.closeExpenseModal();
    this.loadData();
  }

  auditExpense(id: string, status: string) {
    const expense = this.crudService.getById<any>(StorageKeys.EXPENSES, id);
    if (!expense) return;

    this.crudService.update<any>(StorageKeys.EXPENSES, id, { status });

    // If approved, dynamically log a Debit transaction in lsp_transactions
    if (status === 'Approved') {
      const newTx = {
        id: expense.id, // Match the ID to establish relational tracking
        orgId: expense.orgId,
        propertyId: expense.propertyId,
        tenantId: '', // Blank represents operational spend
        type: 'EXPENSE',
        amount: expense.amount,
        paymentMode: 'BankTransfer',
        paymentDate: expense.paymentDate,
        description: `Approved operational expense payout: ${expense.description}`,
        status: 'Paid',
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.crudService.create(StorageKeys.TRANSACTIONS, newTx);
      alert(`Expense approved! Payout debited from running ledger balance.`);
    } else {
      alert('Expense request rejected. No ledger balance altered.');
    }

    this.loadData();
  }
}
