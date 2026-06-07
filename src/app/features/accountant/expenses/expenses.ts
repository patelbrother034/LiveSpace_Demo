import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface ExpenseClaim {
  id: string;
  title: string;
  category: string; // Salary, Utilities, Repair, Food, Other
  amount: number;
  submittedBy: string;
  date: string;
  status: string; // Pending, Approved, Rejected
  receiptNo?: string;
  remarks?: string;
}

@Component({
  selector: 'app-accountant-expenses',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule, DialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Expenses & Claims" subtitle="Approve operational bills, employee claims, and verify invoices" />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Left Panel: Claims Approval Queue -->
        <div class="xl:col-span-2 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Claims Approval Queue</h4>

          <div class="space-y-4">
            @for (ex of pendingClaims(); track ex.id) {
              <div class="glass-card p-5 space-y-4 hover:border-indigo-500/10 transition-all text-xs">
                <div class="flex justify-between items-start">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {{ ex.category }}
                      </span>
                      <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ ex.title }}</h4>
                    </div>
                    <p class="text-slate-500">Submitted by: <b>{{ ex.submittedBy }}</b> · Date: {{ ex.date | date:'mediumDate' }}</p>
                  </div>
                  <span class="font-extrabold text-sm text-slate-800 dark:text-white">₹{{ ex.amount | number:'1.0-0' }}</span>
                </div>

                <div class="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <button pButton label="View Receipt" icon="pi pi-search" (click)="viewReceipt(ex)"
                    class="p-button-xs p-button-outlined rounded-lg text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"></button>
                  <button pButton label="Reject" class="p-button-xs p-button-text text-red-500 hover:bg-red-50" (click)="settleClaim(ex.id, 'Rejected')"></button>
                  <button pButton label="Approve Expense" class="p-button-xs rounded-lg bg-emerald-500 border-none text-white hover:bg-emerald-600" (click)="settleClaim(ex.id, 'Approved')"></button>
                </div>
              </div>
            } @empty {
              <div class="h-44 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 italic">
                <i class="pi pi-check-circle text-2xl text-emerald-500 mb-2"></i>
                All operational expense claims successfully cleared.
              </div>
            }
          </div>
        </div>

        <!-- Right Panel: Settle Log history -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Settled Claims Log</h4>

          <div class="glass-card p-5 space-y-3.5 max-h-[460px] overflow-y-auto">
            @for (ex of settledClaims(); track ex.id) {
              <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-[11px] space-y-1.5">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-slate-800 dark:text-white line-clamp-1 pr-2">{{ ex.title }}</span>
                  <span class="font-extrabold" [class]="ex.status === 'Approved' ? 'text-emerald-500' : 'text-red-500'">
                    ₹{{ ex.amount | number:'1.0-0' }}
                  </span>
                </div>
                <div class="flex justify-between items-center text-[9px] text-slate-400">
                  <span>{{ ex.category }} · {{ ex.submittedBy }}</span>
                  <span class="font-bold uppercase">{{ ex.status }}</span>
                </div>
              </div>
            } @empty {
              <p class="text-xs text-slate-400 italic text-center py-6">No claims settled today.</p>
            }
          </div>
        </div>

      </div>

      <!-- Receipt Dialog -->
      <p-dialog [(visible)]="receiptDialog" [header]="'Receipt Details: ' + (activeClaim()?.receiptNo || '')"
        [modal]="true" [style]="{width: '420px'}" styleClass="rounded-2xl dark:bg-slate-900">
        <div class="space-y-4 p-2 text-xs" *ngIf="activeClaim()">
          
          <div class="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <h5 class="text-center font-bold text-sm tracking-widest border-b border-dashed border-slate-350 pb-2 uppercase">RETAIL INVOICE</h5>
            <div class="space-y-1 text-[10.5px]">
              <p><b>Vendor:</b> Metro Hardware Noida Sec 63</p>
              <p><b>Bill No:</b> {{ activeClaim()!.receiptNo }}</p>
              <p><b>Date:</b> {{ activeClaim()!.date | date:'mediumDate' }}</p>
              <p><b>Claimant:</b> {{ activeClaim()!.submittedBy }}</p>
            </div>
            
            <div class="border-t border-dashed border-slate-350 my-2 pt-2">
              <div class="flex justify-between">
                <span>Part: {{ activeClaim()!.title }}</span>
                <span class="font-extrabold">₹{{ activeClaim()!.amount | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="border-t border-black my-2 pt-2 flex justify-between text-xs font-bold uppercase">
              <span>Grand Total Paid:</span>
              <span class="text-indigo-500">₹{{ activeClaim()!.amount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="flex justify-end">
            <button pButton label="Dismiss" class="p-button-sm rounded-xl bg-indigo-500 border-none text-white px-4" (click)="receiptDialog = false"></button>
          </div>

        </div>
      </p-dialog>
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
export class AccountantExpenses implements OnInit {
  private crudService = inject(CrudService);

  claims = signal<ExpenseClaim[]>([]);

  pendingClaims = computed(() => this.claims().filter(c => c.status === 'Pending'));
  settledClaims = computed(() => this.claims().filter(c => c.status !== 'Pending'));

  // Dialog View
  receiptDialog = false;
  activeClaim = signal<ExpenseClaim | null>(null);

  ngOnInit() {
    this.loadClaims();
  }

  loadClaims() {
    const list = this.crudService.getAll<any>('lsp_expenses');
    
    if (list.length === 0) {
      const seed: ExpenseClaim[] = [
        { id: 'ex-101', title: 'Diesel purchase for power backup generator', category: 'Utilities', amount: 4500, submittedBy: 'Suresh Kumar (Caretaker)', date: new Date().toISOString(), status: 'Pending', receiptNo: 'MET-29831' },
        { id: 'ex-102', title: 'Warden monthly cell allowance claim', category: 'Salary', amount: 1500, submittedBy: 'Deepak Mishra (Warden)', date: new Date().toISOString(), status: 'Pending', receiptNo: 'CEL-89123' },
        { id: 'ex-103', title: 'Plumbing contractor tap replacement spares', category: 'Repair', amount: 3200, submittedBy: 'Suresh Kumar (Caretaker)', date: new Date(Date.now() - 24 * 3600000).toISOString(), status: 'Approved', receiptNo: 'PLU-09823' }
      ];
      localStorage.setItem('lsp_expenses', JSON.stringify(seed));
      this.claims.set(seed);
    } else {
      this.claims.set(list);
    }
  }

  viewReceipt(claim: ExpenseClaim) {
    this.activeClaim.set(claim);
    this.receiptDialog = true;
  }

  settleClaim(claimId: string, status: string) {
    const list = this.crudService.getAll<any>('lsp_expenses');
    const idx = list.findIndex(c => c.id === claimId);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem('lsp_expenses', JSON.stringify(list));
      this.loadClaims();
      
      const actionText = status === 'Approved' ? 'approved and cash reserved updated!' : 'rejected.';
      alert(`Claim successfully ${actionText}`);
    }
  }
}
