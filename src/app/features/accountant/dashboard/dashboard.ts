import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';

interface Transaction {
  id: string;
  amount: number;
  type: string; // RENT, DEPOSIT, EXPENSE
  paymentMode: string;
  createdAt: string;
}

@Component({
  selector: 'app-accountant-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeader, StatCard, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Financial Operations Cockpit" subtitle="Track platform cash-flows, double-entry reconciliations, and tax compliance" />

      <!-- Financial Metrics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="MTD Collections" value="₹3,45,000" icon="pi-indian-rupee" color="success" />
        <app-stat-card label="Outstanding Aging Dues" value="₹24,500" icon="pi-clock" color="danger" />
        <app-stat-card label="GST Liability (18%)" value="₹62,100" icon="pi-file" color="primary" />
        <app-stat-card label="Operational Expenses" value="₹18,500" icon="pi-credit-card" color="warning" />
      </div>

      <!-- Cash Flow Area Chart and Dues Aging -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Cash Flow Area Chart -->
        <div class="xl:col-span-2 glass-card p-6 space-y-4">
          <div class="flex justify-between items-center pb-2">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Platform Cash-Flow Dynamics</h4>
            <div class="flex items-center gap-3 text-[10px] font-bold">
              <span class="flex items-center gap-1 text-emerald-500">● Revenue</span>
              <span class="flex items-center gap-1 text-red-500">● Expenses</span>
            </div>
          </div>

          <div class="relative h-56 flex items-center justify-center">
            <!-- Custom HSL Financial SVG Area Chart -->
            <svg viewBox="0 0 400 150" class="w-full h-full overflow-visible">
              <!-- Y-Axis Reference lines -->
              <line x1="30" y1="20" x2="380" y2="20" stroke="#f1f5f9" stroke-width="1" class="dark:stroke-slate-800" />
              <line x1="30" y1="70" x2="380" y2="70" stroke="#f1f5f9" stroke-width="1" class="dark:stroke-slate-800" />
              <line x1="30" y1="120" x2="380" y2="120" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800/80" />

              <!-- Area Revenue (Gradient) -->
              <path d="M 30 120 L 30 75 Q 117.5 60 205 35 T 380 25 L 380 120 Z" fill="url(#revGrad)" opacity="0.12" />
              <!-- Spline Revenue -->
              <path d="M 30 75 Q 117.5 60 205 35 T 380 25" fill="none" stroke="hsl(142, 70%, 45%)" stroke-width="2.5" />

              <!-- Area Expenses (Gradient) -->
              <path d="M 30 120 L 30 110 Q 117.5 95 205 105 T 380 80 L 380 120 Z" fill="url(#expGrad)" opacity="0.10" />
              <!-- Spline Expenses -->
              <path d="M 30 110 Q 117.5 95 205 105 T 380 80" fill="none" stroke="hsl(346, 80%, 55%)" stroke-width="2.5" />

              <!-- Data Circles -->
              <circle cx="205" cy="35" r="3.5" fill="hsl(142, 70%, 45%)" stroke="#fff" stroke-width="1.5" />
              <circle cx="380" cy="25" r="3.5" fill="hsl(142, 70%, 45%)" stroke="#fff" stroke-width="1.5" />
              
              <circle cx="205" cy="105" r="3.5" fill="hsl(346, 80%, 55%)" stroke="#fff" stroke-width="1.5" />
              <circle cx="380" cy="80" r="3.5" fill="hsl(346, 80%, 55%)" stroke="#fff" stroke-width="1.5" />

              <!-- Text labels -->
              <text x="30" y="135" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">Mar</text>
              <text x="117.5" y="135" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">Apr</text>
              <text x="205" y="135" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">May (Active)</text>
              <text x="380" y="135" font-size="8" fill="#94a3b8" text-anchor="end" font-weight="bold">Forecast</text>

              <!-- Gradients -->
              <defs>
                <linearGradient id="revGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="hsl(142, 70%, 45%)" />
                  <stop offset="100%" stop-color="#fff" stop-opacity="0" />
                </linearGradient>
                <linearGradient id="expGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="hsl(346, 80%, 55%)" />
                  <stop offset="100%" stop-color="#fff" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p class="text-[10px] text-slate-400 italic text-center">Net profit margin grew 12% Q-o-Q due to optimized maintenance overheads</p>
        </div>

        <!-- Aging outstanding dues -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Outstanding Dues Aging</h4>
          
          <div class="glass-card p-5 space-y-4">
            <div class="space-y-3.5">
              <div class="space-y-1">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">1 - 15 Days Delay</span>
                  <span class="font-bold text-slate-800 dark:text-white">₹16,000</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-indigo-500 h-full" style="width: 65%"></div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">16 - 30 Days Delay</span>
                  <span class="font-bold text-slate-800 dark:text-white">₹8,500</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-full" style="width: 35%"></div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">30+ Days Delay</span>
                  <span class="font-bold text-slate-850 dark:text-white">₹0</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-red-500 h-full" style="width: 0%"></div>
                </div>
              </div>
            </div>

            <!-- Action buttons triggers -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2">
              <button pButton label="View Invoices" class="w-full p-button-sm rounded-xl" (click)="routeTo('invoices')"></button>
              <button pButton label="Approve Expenses" class="w-full p-button-sm p-button-outlined rounded-xl" (click)="routeTo('expenses')"></button>
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
export class AccountantDashboard implements OnInit {
  private router = inject(Router);
  private crudService = inject(CrudService);

  ngOnInit() {
    this.checkCollections();
  }

  checkCollections() {
    // Audit check of standard payments/transactions
  }

  routeTo(tab: string) {
    this.router.navigate([`/accountant/${tab}`]);
  }
}
