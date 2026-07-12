import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentModalService } from '../../../core/services/payment-modal.service';

@Component({
  selector: 'app-record-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (modal.isOpen()) {
      <!-- Full-viewport backdrop: direct child of body context via MainLayout root -->
      <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" style="z-index:99998"
           (click)="modal.close()"></div>

      <!-- Centered dialog -->
      <div class="fixed inset-0 flex items-center justify-center p-4" style="z-index:99999"
           (click)="modal.close()">
        <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
             (click)="$event.stopPropagation()">

          <!-- Header -->
          <div class="relative bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-8 py-6 overflow-hidden">
            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                  <i class="pi pi-indian-rupee text-white text-2xl"></i>
                </div>
                <div>
                  <h2 class="text-xl font-black text-white tracking-tight">Record Cash Collection</h2>
                  <p class="text-emerald-100 text-sm mt-0.5">Log a payment entry against a resident</p>
                </div>
              </div>
              <button (click)="modal.close()"
                class="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all cursor-pointer border-none">
                <i class="pi pi-times text-white text-base"></i>
              </button>
            </div>
            <div class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5"></div>
            <div class="absolute -top-6 right-20 w-24 h-24 rounded-full bg-white/5"></div>
          </div>

          <!-- Form Body -->
          <div class="px-8 py-6 overflow-y-auto max-h-[65vh] space-y-5">
            <form [formGroup]="form">

              <!-- Step 1: Resident -->
              <div>
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">1</span>
                  Select Resident
                </p>
                <select formControlName="tenantId"
                  class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 transition-all cursor-pointer">
                  <option value="" class="bg-white dark:bg-slate-800 text-slate-400">— Choose a Resident —</option>
                  @for (t of modal.tenants; track t.id) {
                    <option [value]="t.id" class="bg-white dark:bg-slate-800">
                      {{ t.fullName }} &nbsp;|&nbsp; Pending: ₹{{ t.pendingDues | number }}
                    </option>
                  }
                </select>
              </div>

              <hr class="border-slate-100 dark:border-slate-800"/>

              <!-- Step 2: Payment Details -->
              <div>
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">2</span>
                  Payment Details
                </p>
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Category *</label>
                    <select formControlName="type"
                      class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 transition-all cursor-pointer">
                      <option value="RENT" class="bg-white dark:bg-slate-800">🏠 Rent Income</option>
                      <option value="DEPOSIT" class="bg-white dark:bg-slate-800">🔒 Security Deposit</option>
                      <option value="UTILITY" class="bg-white dark:bg-slate-800">⚡ Utilities Payment</option>
                      <option value="PENALTY" class="bg-white dark:bg-slate-800">⚠️ Late Payment Penalty</option>
                    </select>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label class="text-xs font-semibold text-slate-500 dark:text-slate-400">Amount (₹) *</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-base">₹</span>
                      <input type="number" formControlName="amount" placeholder="0"
                        class="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm font-bold focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <hr class="border-slate-100 dark:border-slate-800"/>

              <!-- Step 3: Payment Method -->
              <div>
                <p class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">3</span>
                  Payment Method
                </p>
                <div class="grid grid-cols-3 gap-3 mb-4">
                  @for (m of paymentMethods; track m.value) {
                    <button type="button" (click)="form.patchValue({paymentMode: m.value})"
                      [class]="'flex flex-col items-center gap-2 py-4 px-2 rounded-xl border-2 transition-all cursor-pointer ' +
                        (form.value.paymentMode === m.value
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700')">
                      <span class="text-2xl">{{ m.emoji }}</span>
                      <span [class]="'text-xs font-bold ' + (form.value.paymentMode === m.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400')">
                        {{ m.label }}
                      </span>
                    </button>
                  }
                </div>
                <input type="text" formControlName="referenceId"
                  placeholder="Transaction Ref / UTR No. (e.g. UPI827653741)"
                  class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
              </div>

              <hr class="border-slate-100 dark:border-slate-800"/>

              <!-- Remarks -->
              <input type="text" formControlName="description"
                placeholder="Remarks / Description (e.g. June 2026 rent collected in cash)"
                class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />

            </form>
          </div>

          <!-- Footer -->
          <div class="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
            <button (click)="modal.close()"
              class="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer bg-transparent">
              Cancel
            </button>
            <button (click)="submit()"
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all cursor-pointer border-none flex items-center gap-2 whitespace-nowrap">
              <i class="pi pi-check-circle text-base"></i>
              Confirm &amp; Record Payment
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class RecordPaymentModal implements OnInit {
  modal = inject(PaymentModalService);
  private fb = inject(FormBuilder);

  form!: FormGroup;

  paymentMethods = [
    { value: 'UPI', emoji: '📱', label: 'UPI' },
    { value: 'Cash', emoji: '💵', label: 'Cash' },
    { value: 'BankTransfer', emoji: '🏦', label: 'Bank Transfer' }
  ];

  ngOnInit() {
    this.form = this.fb.group({
      tenantId: ['', Validators.required],
      type: ['RENT', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      paymentMode: ['UPI', Validators.required],
      referenceId: [''],
      description: ['']
    });
  }

  submit() {
    if (this.form.valid) {
      this.modal.submit(this.form.value);
      this.form.reset({ tenantId: '', type: 'RENT', amount: 0, paymentMode: 'UPI', referenceId: '', description: '' });
    }
  }
}
