import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';

interface ParsedTransaction {
  type: string; // RENT, EXPENSE
  amount: number;
  hostName?: string;
  particulars?: string;
  paymentMode: string;
  referenceId?: string;
}

@Component({
  selector: 'app-ai-voice-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Conversational Voice Ledger" subtitle="Record daily PG transactions hands-free using pre-scripted speech commands" />

      <div class="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Left Panel: Sound Wave and mic controller -->
        <div class="glass-card p-6 flex flex-col items-center justify-center space-y-6 text-center">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider self-start">Voice Audio Console</h4>
          
          <!-- Pulsing mic button -->
          <div class="relative flex items-center justify-center">
            <div class="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl scale-125 transition-all"
              [class.animate-pulse]="isRecording()"></div>
            
            <button (click)="triggerMic()"
              class="h-20 w-20 rounded-full flex items-center justify-center border-none text-white shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.03]"
              [class]="isRecording() ? 'bg-red-500 shadow-red-500/20' : 'bg-indigo-500 shadow-indigo-500/20'">
              <i class="pi text-2xl" [class]="isRecording() ? 'pi-spin pi-spinner' : 'pi-microphone'"></i>
            </button>
          </div>

          @if (isRecording()) {
            <!-- Sound wave animation -->
            <div class="flex items-center gap-1.5 h-8 pt-2">
              <span class="w-1 bg-red-500 rounded animate-wave h-4" style="animation-delay: 0.1s"></span>
              <span class="w-1 bg-red-500 rounded animate-wave h-7" style="animation-delay: 0.2s"></span>
              <span class="w-1 bg-red-500 rounded animate-wave h-8" style="animation-delay: 0.3s"></span>
              <span class="w-1 bg-red-500 rounded animate-wave h-5" style="animation-delay: 0.4s"></span>
              <span class="w-1 bg-red-500 rounded animate-wave h-3" style="animation-delay: 0.5s"></span>
            </div>
            <p class="text-xs font-bold text-red-500 italic animate-pulse">Transcribing speech audio stream...</p>
          } @else {
            <p class="text-xs text-slate-400 italic">Click the mic or choose a preset command below to start.</p>
          }

          <!-- Quick presets triggers -->
          <div class="w-full space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-left">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Example commands to click:</p>
            <div class="space-y-1.5">
              @for (c of commands; track c) {
                <button (click)="speakCommand(c)" [disabled]="isRecording()"
                  class="w-full text-left p-2.5 rounded-xl border border-slate-150/40 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/60 text-[10.5px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer hover:border-indigo-500 transition-all truncate">
                  "{{ c }}"
                </button>
              }
            </div>
          </div>

        </div>

        <!-- Right Panel: AI Auto-Parsed Ledger output -->
        <div class="space-y-6">
          <div class="glass-card p-6 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">AI Auto-Parsed Fields</h4>

            @if (parsedTx() && !isRecording()) {
              <div class="space-y-3.5 text-xs animate-fade-in">
                <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span class="text-slate-500">Transaction Type:</span>
                  <span class="font-extrabold uppercase" [class]="parsedTx()!.type === 'RENT' ? 'text-emerald-500' : 'text-red-500'">{{ parsedTx()!.type }}</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span class="text-slate-500">Target Amount:</span>
                  <span class="font-extrabold text-slate-800 dark:text-white">₹{{ parsedTx()!.amount | number:'1.0-0' }}</span>
                </div>
                @if (parsedTx()!.hostName) {
                  <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <span class="text-slate-500">Resident / Tenant:</span>
                    <span class="font-bold text-slate-800 dark:text-white">{{ parsedTx()!.hostName }}</span>
                  </div>
                }
                @if (parsedTx()!.particulars) {
                  <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <span class="text-slate-500">Particulars:</span>
                    <span class="font-bold text-slate-800 dark:text-white truncate max-w-44">{{ parsedTx()!.particulars }}</span>
                  </div>
                }
                <div class="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span class="text-slate-500">Payment Mode:</span>
                  <span class="font-semibold text-slate-800 dark:text-white">{{ parsedTx()!.paymentMode }}</span>
                </div>

                <button pButton label="Confirm & Log Transaction" icon="pi pi-check-circle" (click)="saveParsedTransaction()"
                  class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white hover:opacity-90 font-bold shadow-md shadow-emerald-500/10 cursor-pointer">
                </button>
              </div>
            } @else {
              <div class="h-48 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs italic">
                <i class="pi pi-file-export text-2xl mb-2 text-indigo-500 animate-pulse"></i>
                Parsed parameters details will load here once voice command concludes.
              </div>
            }
          </div>
        </div>

      </div>
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
    @keyframes wave {
      0%, 100% { transform: scaleY(0.4); }
      50% { transform: scaleY(1.3); }
    }
    .animate-wave {
      animation: wave 0.8s ease-in-out infinite;
      transform-origin: center;
    }
  `]
})
export class AIVoiceLedger {
  private crudService = inject(CrudService);

  commands = [
    'Received 8500 rupees from Aditya Patel in Room 102',
    'Spent 2000 on plumbing repair spares for building B',
    'Electricity bill invoice of 15000 settled'
  ];

  isRecording = signal(false);
  parsedTx = signal<ParsedTransaction | null>(null);

  triggerMic() {
    this.isRecording.set(true);
    this.parsedTx.set(null);

    setTimeout(() => {
      // Auto select command mock
      this.speakCommand(this.commands[0]);
    }, 2500);
  }

  speakCommand(text: string) {
    this.isRecording.set(true);
    this.parsedTx.set(null);

    // Simulated parsing time delay
    setTimeout(() => {
      let type = 'RENT';
      let amount = 8500;
      let hostName: string | undefined = 'Aditya Patel';
      let particulars = 'To Room Rent Revenue';
      let mode = 'UPI';

      if (text.includes('plumbing')) {
        type = 'EXPENSE';
        amount = 2000;
        hostName = undefined;
        particulars = 'Plumbing repair spares building B';
        mode = 'Cash';
      } else if (text.includes('Electricity')) {
        type = 'EXPENSE';
        amount = 15000;
        hostName = undefined;
        particulars = 'Electricity utility bill payment';
        mode = 'NetBanking';
      }

      this.parsedTx.set({
        type: type,
        amount: amount,
        hostName: hostName,
        particulars: particulars,
        paymentMode: mode,
        referenceId: 'tx-' + Math.random().toString(36).substring(7)
      });
      this.isRecording.set(false);
    }, 1800);
  }

  saveParsedTransaction() {
    if (!this.parsedTx()) return;

    const tx = this.parsedTx()!;
    if (tx.type === 'RENT') {
      // Find Aditya Patel and clear dues (mock update)
      const list = this.crudService.getAll<any>(StorageKeys.TENANTS);
      const aditya = list.find((t: any) => t.fullName.includes('Aditya'));
      if (aditya) {
        aditya.pendingDues = Math.max(0, aditya.pendingDues - tx.amount);
        if (aditya.pendingDues === 0) aditya.paymentStatus = 'Paid';
        localStorage.setItem(StorageKeys.TENANTS, JSON.stringify(list));
      }
    } else {
      // Create expense claim
      const list = this.crudService.getAll<any>('lsp_expenses');
      list.push({
        id: tx.referenceId,
        title: tx.particulars,
        category: 'Utilities',
        amount: tx.amount,
        submittedBy: 'Owner Voice Command',
        date: new Date().toISOString(),
        status: 'Approved',
        receiptNo: 'VOI-' + Math.random().toString(36).substring(7).toUpperCase()
      });
      localStorage.setItem('lsp_expenses', JSON.stringify(list));
    }

    // Save transaction in database
    const txs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);
    txs.unshift({
      id: tx.referenceId,
      tenantId: 'tenant-001',
      propertyId: 'prop-001',
      amount: tx.amount,
      type: tx.type,
      paymentMode: tx.paymentMode,
      status: 'Paid',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(StorageKeys.TRANSACTIONS, JSON.stringify(txs));

    this.parsedTx.set(null);
    alert('Voice Transaction Reconciled! Cashbook ledger successfully updated in local storage database.');
  }
}
