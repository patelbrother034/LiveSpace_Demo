import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface SaaSPlan {
  id: string;
  name: string;
  price: number;
  bedLimit: number;
  aiInsightsEnabled: boolean;
  featureFlagsCount: number;
}

@Component({
  selector: 'app-admin-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="SaaS Pricing Plans" subtitle="Modify plan costs, bed boundaries constraints, and inspect billings streams" />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        @for (plan of plans(); track plan.id) {
          <div class="glass-card p-6 space-y-5 hover:border-indigo-500/20 transition-all flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 class="text-base font-extrabold text-slate-800 dark:text-white">{{ plan.name }}</h4>
                  <p class="text-[9.5px] text-indigo-500 font-semibold uppercase tracking-wider mt-0.5">SaaS Billing Tier</p>
                </div>
                <span class="text-[9.5px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-500">Active</span>
              </div>

              <div class="space-y-3.5 text-xs">
                <!-- Price input/slide -->
                <div class="space-y-1">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                    <span>Monthly Rate:</span>
                    <span>₹{{ plan.price | number:'1.0-0' }} / mo</span>
                  </div>
                  <input type="range" min="1000" max="50000" step="500" [(ngModel)]="plan.price" (ngModelChange)="savePlans()"
                    class="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none dark:bg-slate-700">
                </div>

                <!-- Bed limit -->
                <div class="space-y-1 pt-1.5">
                  <div class="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                    <span>Bed Limit Capacity:</span>
                    <span>{{ plan.bedLimit === 10000 ? 'Unlimited' : plan.bedLimit + ' Beds' }}</span>
                  </div>
                  <input type="range" min="50" max="500" step="50" [(ngModel)]="plan.bedLimit" (ngModelChange)="savePlans()"
                    *ngIf="plan.bedLimit < 10000"
                    class="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-200 rounded-lg appearance-none dark:bg-slate-700">
                </div>

                <!-- Features list toggle -->
                <div class="flex justify-between items-center pt-2">
                  <span class="font-bold text-slate-750 dark:text-slate-400">AI Intelligence Insights:</span>
                  <input type="checkbox" [(ngModel)]="plan.aiInsightsEnabled" (change)="savePlans()" class="h-4 w-4 rounded text-indigo-600">
                </div>
              </div>
            </div>

            <button pButton label="Save Configurations" (click)="notifyUpdate(plan.name)"
              class="w-full py-2.5 mt-4 rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-650 font-bold shadow-md shadow-indigo-500/10">
            </button>
          </div>
        }

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
export class AdminSubscriptions implements OnInit {
  plans = signal<SaaSPlan[]>([]);

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    const list = localStorage.getItem('lsp_saas_pricing_plans');
    if (list) {
      this.plans.set(JSON.parse(list));
    } else {
      const seed: SaaSPlan[] = [
        { id: 'plan-1', name: 'Starter Plan', price: 4500, bedLimit: 100, aiInsightsEnabled: false, featureFlagsCount: 2 },
        { id: 'plan-2', name: 'Growth Plan', price: 12000, bedLimit: 300, aiInsightsEnabled: true, featureFlagsCount: 5 },
        { id: 'plan-3', name: 'Enterprise Elite', price: 28000, bedLimit: 10000, aiInsightsEnabled: true, featureFlagsCount: 12 }
      ];
      localStorage.setItem('lsp_saas_pricing_plans', JSON.stringify(seed));
      this.plans.set(seed);
    }
  }

  savePlans() {
    localStorage.setItem('lsp_saas_pricing_plans', JSON.stringify(this.plans()));
  }

  notifyUpdate(name: string) {
    alert(`Pricing configuration for '${name}' updated successfully!`);
  }
}
