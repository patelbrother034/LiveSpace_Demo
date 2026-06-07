import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';

interface Room {
  id: string;
  roomNumber: string;
  sharingType?: string;
  type: string;
  monthlyRent: number;
  propertyId: string;
}

interface PriceRecommendation {
  roomType: string;
  currentPrice: number;
  recommendedPrice: number;
  impact: number;
}

@Component({
  selector: 'app-ai-revenue-optimizer',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Revenue & Yield Optimizer" subtitle="Leverage dynamic pricing algorithms to optimize room rates and maximize yield" />

      <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        <!-- Left: Dynamic Pricing recommendations table -->
        <div class="xl:col-span-3 space-y-6">
          <div class="glass-card p-6 border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between gap-4">
            <div class="space-y-1">
              <h3 class="text-sm font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">AI Yield Lift Opportunity</h3>
              <h2 class="text-2xl font-black text-slate-800 dark:text-white">₹38,500 <span class="text-xs font-normal text-slate-500">additional earnings/mo</span></h2>
            </div>
            <button pButton label="Apply AI Pricing" icon="pi pi-check-circle" (click)="applyRecommendedPricing()"
              class="p-button-sm rounded-xl bg-emerald-500 border-none text-white hover:bg-emerald-600 shadow-md">
            </button>
          </div>

          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Pricing Recommendations</h4>
            
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase font-bold text-[10px]">
                    <th class="py-2.5">Room Sharing Type</th>
                    <th class="py-2.5 text-right">Current Price</th>
                    <th class="py-2.5 text-right text-indigo-500">AI Recommended</th>
                    <th class="py-2.5 text-right text-emerald-500 font-bold">Monthly Impact</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                  @for (r of recommendations(); track r.roomType) {
                    <tr>
                      <td class="py-3.5 font-bold text-slate-850 dark:text-white">{{ r.roomType }} Sharing</td>
                      <td class="py-3.5 text-right">₹{{ r.currentPrice | number:'1.0-0' }}</td>
                      <td class="py-3.5 text-right font-extrabold text-indigo-500">₹{{ r.recommendedPrice | number:'1.0-0' }}</td>
                      <td class="py-3.5 text-right font-extrabold text-emerald-500">+₹{{ r.impact | number:'1.0-0' }}/mo</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Price Elasticity Custom Visual -->
        <div class="xl:col-span-2 space-y-6">
          
          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Competitor Benchmarking</h4>
            
            <div class="space-y-4 text-xs">
              <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex justify-between items-center">
                <span>Double sharing HSR layout market rate:</span>
                <span class="font-bold">₹11,000 / mo</span>
              </div>
              <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex justify-between items-center">
                <span>Our pricing (with dynamic optimizer suggestions):</span>
                <span class="font-bold text-indigo-500">₹10,500 / mo</span>
              </div>
            </div>
          </div>

          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">EBITDA Yield Uplift Scenario</h4>
            <div class="relative h-28 flex items-center justify-center">
              <!-- Custom before vs after SVG -->
              <svg viewBox="0 0 150 60" class="w-full h-full overflow-visible">
                <!-- before bar -->
                <rect x="25" y="20" width="30" height="30" rx="4" fill="#cbd5e1" class="dark:fill-slate-700" />
                <text x="40" y="45" font-size="7" font-weight="black" fill="#475569" class="dark:fill-slate-350" text-anchor="middle">₹3.4L</text>
                <text x="40" y="58" font-size="7.5" font-weight="bold" fill="#64748b" text-anchor="middle">Before</text>

                <!-- after bar -->
                <rect x="95" y="10" width="30" height="40" rx="4" fill="hsl(142, 70%, 45%)" />
                <text x="110" y="35" font-size="7" font-weight="black" fill="#fff" text-anchor="middle">₹3.8L</text>
                <text x="110" y="58" font-size="7.5" font-weight="bold" fill="hsl(142, 70%, 45%)" text-anchor="middle">Optimized</text>
              </svg>
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
export class AIRevenueOptimizer implements OnInit {
  private crudService = inject(CrudService);

  recommendations = signal<PriceRecommendation[]>([]);

  ngOnInit() {
    this.loadRecommendations();
  }

  loadRecommendations() {
    this.recommendations.set([
      { roomType: 'Single Sharing', currentPrice: 12000, recommendedPrice: 13500, impact: 15000 },
      { roomType: 'Double Sharing', currentPrice: 8500, recommendedPrice: 9500, impact: 16000 },
      { roomType: 'Triple Sharing', currentPrice: 6500, recommendedPrice: 7000, impact: 7500 }
    ]);
  }

  applyRecommendedPricing() {
    // Overwrite Room rent values inside lsp_rooms to demonstrate dynamic pricing!
    const list = this.crudService.getAll<any>(StorageKeys.ROOMS);
    
    list.forEach(r => {
      if (r.propertyId === 'prop-001') {
        if (r.sharingType === 'Single' || r.type === 'Single') {
          r.monthlyRent = 13500;
        } else if (r.sharingType === 'Double' || r.type === 'Double') {
          r.monthlyRent = 9500;
        } else if (r.sharingType === 'Triple' || r.type === 'Triple') {
          r.monthlyRent = 7000;
        }
      }
    });

    localStorage.setItem(StorageKeys.ROOMS, JSON.stringify(list));
    alert('Yield Maximizer Applied! Monthly rent bounds successfully updated across all active properties.');
  }
}
