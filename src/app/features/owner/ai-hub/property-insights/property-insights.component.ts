import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';

interface InsightCard {
  id: string;
  title: string;
  category: 'Financial' | 'Operational' | 'Safety' | 'Growth' | 'Risk';
  text: string;
  badge: string;
  color: string;
}

interface ActionStrategy {
  priority: 'High' | 'Medium' | 'Low';
  strategy: string;
  costImpact: string;
}

@Component({
  selector: 'app-ai-property-insights',
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Portfolio Predictive Insights" subtitle="Explore operational warnings, growth suggestions, and priority strategies" />

      <!-- Horizontal Carousel Cards -->
      <div class="space-y-3">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">🔮 AI Live Insights Carousel</h4>
        
        <!-- Horizontal Scrollable Container -->
        <div class="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-indigo-500">
          @for (c of insights; track c.id) {
            <div class="glass-card p-5 space-y-4 hover:scale-[1.01] transition-all min-w-[280px] md:min-w-[320px] max-w-[325px] flex flex-col justify-between relative overflow-hidden shrink-0 group">
              <!-- glow corner -->
              <div class="absolute -top-12 -right-12 h-20 w-20 rounded-full opacity-10 blur-xl group-hover:scale-150 transition-all"
                [style.backgroundColor]="c.color"></div>
              
              <div class="space-y-3">
                <div class="flex justify-between items-center text-[10px] font-extrabold">
                  <span class="uppercase text-slate-400">{{ c.category }}</span>
                  <span class="px-2 py-0.5 rounded uppercase"
                    [style.backgroundColor]="c.color + '20'" [style.color]="c.color">
                    {{ c.badge }}
                  </span>
                </div>

                <div class="space-y-1">
                  <h5 class="text-xs font-black text-slate-800 dark:text-white">{{ c.title }}</h5>
                  <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{{ c.text }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- prioritized strategies list -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- prioritized recommendations -->
        <div class="xl:col-span-2 glass-card p-6 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">AI Prioritized Action Plans</h4>
          
          <div class="space-y-3 text-xs">
            @for (s of strategies; track s.strategy) {
              <div class="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between gap-4">
                <div class="space-y-0.5">
                  <h5 class="font-bold text-slate-850 dark:text-white">{{ s.strategy }}</h5>
                  <p class="text-[9.5px] text-slate-450">Projected Uplift: <b>{{ s.costImpact }}</b></p>
                </div>

                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded"
                  [class]="s.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'">
                  {{ s.priority }} Priority
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Category explanation stats -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Optimization SLA Status</h4>
          
          <div class="glass-card p-5 space-y-4 text-xs leading-relaxed">
            <p>· Insights Index: **98.4% nominal accuracy**</p>
            <p>· Priority allocation triggers based on Indian tech hub co-living benchmark margins.</p>
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
export class AIPropertyInsights {
  insights: InsightCard[] = [
    { id: '1', title: 'Triple Sharing EBITDA Margin', category: 'Financial', text: 'Triple sharing rooms in Royal Heights Noida outperform standard double configurations by 23.4% EBITDA, driven by high Sector 62 tech onboarding.', badge: 'Outperforming', color: 'hsl(142, 70%, 45%)' },
    { id: '2', title: 'Single Room Noida Benchmarks', category: 'Growth', text: 'Average Noida Sector 62 single room rent rate benchmarks sit at ₹15,000. Our current rate ₹13,500 is 11.2% below local tech hub indexes.', badge: 'Revenue Lift', color: 'hsl(38, 92%, 50%)' },
    { id: '3', title: 'Building B Ticket Volumes', category: 'Operational', text: 'Residents of Building B have raised 3.2x more maintenance requests (AC, geysers) compared to Building A, indicating aging infrastructure spares wear.', badge: 'Critical Wear', color: 'hsl(0, 95%, 40%)' },
    { id: '4', title: 'Risk Overdue Balances', category: 'Risk', text: 'Warden curfew scans show 4 student accounts with rent outstanding delay exceeding 30 days. Action recommended to trigger automated parent warnings.', badge: 'Risk Alert', color: 'hsl(346, 80%, 55%)' }
  ];

  strategies: ActionStrategy[] = [
    { priority: 'High', strategy: 'Increase triple sharing bed capacity in Building A by converting 2 underutilized common rooms.', costImpact: '+₹35,000 / month yield' },
    { priority: 'High', strategy: 'Schedule preventive carbon filter replacements for Building B RO purifier core systems.', costImpact: '-₹18,000 emergency ticket overheads' },
    { priority: 'Medium', strategy: 'Trigger SMS warnings to parents for 4 tenants with overdue accounts exceeding 30 days.', costImpact: '₹22,000 collection aging clearance' }
  ];
}
