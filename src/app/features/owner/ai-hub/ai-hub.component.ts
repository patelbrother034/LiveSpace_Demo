import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageHeader } from '../../../shared/components/page-header/page-header';

interface AIEngine {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  highlightText: string;
}

@Component({
  selector: 'app-ai-hub-gateway',
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="AI Operations Hub" subtitle="Explore future platform capabilities with simulated machine learning models" />

      <!-- Introductory Glassmorphic Hero Banner -->
      <div class="glass-card p-6 border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-500/10 to-purple-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
        <div class="space-y-1.5 z-10">
          <h2 class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-sparkles text-indigo-500 text-2xl animate-pulse"></i>
            LiveSpace AI Labs
          </h2>
          <p class="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Welcome to the AI Operations Hub. This center showcases predictive analytics, roommate compatibility calculations, yield optimization scenarios, and conversational voice ledgers configured as simulated demonstrations.
          </p>
        </div>
        <div class="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
          🔮 Model Version: Beta 2.1
        </div>
      </div>

      <!-- AI Engines Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        @for (e of engines; track e.id) {
          <div (click)="launchEngine(e.route)"
            class="glass-card p-5 space-y-4 hover:scale-[1.03] hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between">
            <!-- Glow background corner -->
            <div class="absolute -top-10 -right-10 h-20 w-20 rounded-full opacity-10 blur-lg transition-all group-hover:scale-150"
              [style.backgroundColor]="e.color"></div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <div class="h-9 w-9 rounded-full flex items-center justify-center"
                  [style.backgroundColor]="e.color + '15'">
                  <i class="pi text-sm" [class]="e.icon" [style.color]="e.color"></i>
                </div>
                <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded"
                  [style.backgroundColor]="e.color + '20'" [style.color]="e.color">
                  {{ e.highlightText }}
                </span>
              </div>

              <div class="space-y-1">
                <h4 class="text-sm font-black text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {{ e.title }}
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed line-clamp-3">
                  {{ e.description }}
                </p>
              </div>
            </div>

            <!-- Action launch indicators -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-indigo-500">
              <span>Launch Demo</span>
              <i class="pi pi-arrow-right group-hover:translate-x-1.5 transition-transform"></i>
            </div>
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
export class AIHubComponent {
  private router = inject(Router);

  engines: AIEngine[] = [
    { id: '1', title: 'Roommate Matching', description: 'Calculates roommate compatibility pairings based on sleep schedules, food habits, and study styles, complete with SVG radar comparison charts.', icon: 'pi-users', color: 'hsl(243, 75%, 59%)', route: 'roommate-matching', highlightText: 'Compatibility' },
    { id: '2', title: 'Occupancy Forecast', description: 'Simulates 90-day seasonal occupancy forecasts, displaying predictions upper/lower confidence bands and custom rent rate slides dynamic updates.', icon: 'pi-chart-line', color: 'hsl(142, 70%, 45%)', route: 'occupancy-forecast', highlightText: 'Predictive' },
    { id: '3', title: 'Revenue Optimizer', description: 'Calculates yield maximization prices for double/triple sharing beds and applies recommended monthly pricing variables in one tap.', icon: 'pi-indian-rupee', color: 'hsl(38, 92%, 50%)', route: 'revenue-optimizer', highlightText: 'Yield' },
    { id: '4', title: 'Maintenance Diagnostics', description: 'Predicts appliance failures, maps health scores, and provides a simulated diagnostics chat helper that suggestions repair parts and costs.', icon: 'pi-ticket', color: 'hsl(0, 95%, 40%)', route: 'maintenance-diagnostics', highlightText: 'Prescriptive' },
    { id: '5', title: 'Fraud Risk Auditor', description: 'Scans cash payments timing anomalies, invoice amounts, and duplicate transactions, flagging suspicious entries in accountant log queues.', icon: 'pi-shield', color: 'hsl(346, 80%, 55%)', route: 'fraud-detection', highlightText: 'Security' },
    { id: '6', title: 'Voice Ledger Parser', description: 'Breathtaking pulsing sound wave recorder simulator. Auto-detects spoken transactions, parsing amount, tenant, categories, and logs directly.', icon: 'pi-microphone', color: 'hsl(280, 85%, 50%)', route: 'voice-ledger', highlightText: 'NLP Demo' },
    { id: '7', title: 'Property Insights Carousel', description: 'Horizontal metrics cards detailing predictive warnings, operational breakdowns, and high-priority recommendations strategies.', icon: 'pi-lightbulb', color: 'hsl(200, 95%, 40%)', route: 'property-insights', highlightText: 'Insights' }
  ];

  launchEngine(path: string) {
    this.router.navigate([`/owner/ai-hub/${path}`]);
  }
}
