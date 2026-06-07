import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { CrudService } from '../../../../core/services/crud.service';
import { ButtonModule } from 'primeng/button';

interface AnomalyExpense {
  id: string;
  title: string;
  amount: number;
  submittedBy: string;
  reason: string;
  category: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: string;
}

@Component({
  selector: 'app-ai-fraud-detection',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="SaaS Operations Fraud Auditor" subtitle="Identify cost inflating expenses, timing anomalies, and suspicious vendor patterns" />

      <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        <!-- Left: Flagged Anomaly Transactions Queue -->
        <div class="xl:col-span-3 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Flagged Suspicious Queue</h4>

          <div class="space-y-4">
            @for (ex of activeAnomalyClaims(); track ex.id) {
              <div class="glass-card p-5 space-y-4 hover:border-red-500/10 transition-all text-xs border-l-4"
                [class]="ex.riskLevel === 'High' ? 'border-red-500' : 'border-amber-500'">
                
                <div class="flex justify-between items-start">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {{ ex.category }}
                      </span>
                      <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ ex.title }}</h4>
                    </div>
                    <p class="text-slate-500">Submitted by: <b>{{ ex.submittedBy }}</b> · Ref ID: {{ ex.id }}</p>
                  </div>
                  <span class="font-extrabold text-sm text-red-500">₹{{ ex.amount | number:'1.0-0' }}</span>
                </div>

                <!-- Anomaly reason banner -->
                <div class="p-2.5 rounded-lg bg-red-500/5 text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-950 flex items-center gap-1.5">
                  <i class="pi pi-shield"></i>
                  <span>Anomaly Trigger: {{ ex.reason }}</span>
                </div>

                <div class="flex gap-2 justify-end pt-1">
                  <button pButton label="Flag for Audit" class="p-button-xs p-button-text text-red-500 hover:bg-red-50" (click)="settleAnomaly(ex.id, 'Flagged')"></button>
                  <button pButton label="Investigate" class="p-button-xs p-button-outlined rounded-lg text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-800" (click)="settleAnomaly(ex.id, 'Investigating')"></button>
                  <button pButton label="Approve & Clear" class="p-button-xs rounded-lg bg-emerald-500 border-none text-white hover:bg-emerald-600" (click)="settleAnomaly(ex.id, 'Approved')"></button>
                </div>

              </div>
            } @empty {
              <div class="h-44 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 italic">
                <i class="pi pi-check-circle text-2xl text-emerald-500 mb-2 animate-bounce"></i>
                All flagged transactions audited and cleared successfully.
              </div>
            }
          </div>
        </div>

        <!-- Right: Global Fraud Risk Speedometer -->
        <div class="xl:col-span-2 space-y-6">
          <div class="glass-card p-5 space-y-4 flex flex-col items-center text-center">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider self-start">Operational Fraud Risk Index</h4>
            
            <div class="relative h-40 w-44 flex items-center justify-center">
              <!-- Custom Speedometer dial SVG -->
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <!-- Background gray semi-circle -->
                <path class="text-slate-100 dark:text-slate-800" stroke-width="3.5" stroke-dasharray="50, 100" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                <!-- Risk level color overlay (Orange - Medium) -->
                <path class="text-amber-500 transition-all duration-700" stroke-width="4" stroke-dasharray="18, 100" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
              </svg>
              <!-- Indicator label -->
              <div class="absolute flex flex-col items-center justify-center top-14">
                <span class="text-lg font-black text-amber-500">MEDIUM</span>
                <span class="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Audit Risk Score</span>
              </div>
            </div>
            <p class="text-[9.5px] text-slate-500 italic mt-2">Platform anomaly index is at 12% tolerance bounds due to recent duplicate geyser invoice pings</p>
          </div>

          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Verification Stats</h4>
            
            <div class="space-y-3.5 text-xs">
              <div class="flex justify-between">
                <span>Audited Items:</span>
                <span class="font-bold">4 cleared</span>
              </div>
              <div class="flex justify-between">
                <span>Total Flagged:</span>
                <span class="font-bold text-red-500">{{ activeAnomalyClaims().length }} pending</span>
              </div>
            </div>
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
  `]
})
export class AIFraudDetection implements OnInit {
  private crudService = inject(CrudService);

  anomalies = signal<AnomalyExpense[]>([]);

  activeAnomalyClaims = computed(() => this.anomalies().filter(c => c.status === 'Pending'));

  ngOnInit() {
    this.loadAnomalies();
  }

  loadAnomalies() {
    const list = localStorage.getItem('lsp_fraud_anomalies');
    if (list) {
      this.anomalies.set(JSON.parse(list));
    } else {
      const seed: AnomalyExpense[] = [
        { id: 'fra-1', title: 'Power Backup Generator Fuel Bill', amount: 18500, submittedBy: 'Suresh Kumar (Caretaker)', category: 'Utilities', reason: 'Fuel purchase voucher cost is 3.2x higher than historical Sector 62 averages.', riskLevel: 'High', status: 'Pending' },
        { id: 'fra-2', title: 'Water Tanker Cleaning Spares', amount: 5000, submittedBy: 'Suresh Kumar (Caretaker)', category: 'Repair', reason: 'Possible duplicate invoice entry matches voucher ID #PLU-09823.', riskLevel: 'Medium', status: 'Pending' },
        { id: 'fra-3', title: 'Electrical switch spares purchase Sec 62', amount: 800, submittedBy: 'Priya Sharma (Accountant)', category: 'Other', reason: 'Timing Anomaly: 5 cash payouts recorded in single day by same user.', riskLevel: 'Low', status: 'Pending' }
      ];
      localStorage.setItem('lsp_fraud_anomalies', JSON.stringify(seed));
      this.anomalies.set(seed);
    }
  }

  settleAnomaly(id: string, status: string) {
    const list = this.anomalies();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem('lsp_fraud_anomalies', JSON.stringify(list));
      this.anomalies.set([...list]);
      
      const actionText = status === 'Approved' ? 'approved and resolved.' : `marked as ${status}.`;
      alert(`SaaS Fraud Audit: Transaction ID ${id} ${actionText}`);
    }
  }
}
