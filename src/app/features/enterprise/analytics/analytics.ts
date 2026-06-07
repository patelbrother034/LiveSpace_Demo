import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface PGProperty {
  id: string;
  name: string;
  monthlyRevenue: number;
  totalBeds: number;
  occupiedBeds: number;
}

@Component({
  selector: 'app-enterprise-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Portfolio Intelligence & Analytics" subtitle="Run comparative metrics analysis and inspect staff operational scores" />

      <!-- Analytics Selection -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Radar Chart Side-by-Side Comparison -->
        <div class="xl:col-span-2 glass-card p-6 space-y-4">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Property Comparison Radar</h4>
            <div class="flex items-center gap-2">
              <select [(ngModel)]="propA" (change)="updateRadar()"
                class="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
                @for (p of properties(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
              <span class="text-xs font-semibold text-slate-400">vs</span>
              <select [(ngModel)]="propB" (change)="updateRadar()"
                class="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
                @for (p of properties(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Radar Chart SVG Container -->
          <div class="relative h-64 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl p-4">
            
            <!-- Custom Radar Polyline Chart -->
            <svg viewBox="0 0 200 200" class="w-full h-full overflow-visible select-none">
              <!-- Radial Grid Concentric Pentagon Outlines -->
              <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800" />
              <polygon points="100,40 161,84 138,152 62,152 39,84" fill="none" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800" />
              <polygon points="100,60 146,93 129,139 71,139 54,93" fill="none" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800" />
              <polygon points="100,80 131,102 120,126 80,126 69,102" fill="none" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800/60" />
              
              <!-- Axes Spoke Rays -->
              <line x1="100" y1="100" x2="100" y2="20" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />
              <line x1="100" y1="100" x2="176" y2="75" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />
              <line x1="100" y1="100" x2="147" y2="165" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />
              <line x1="100" y1="100" x2="53" y2="165" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />
              <line x1="100" y1="100" x2="24" y2="75" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />

              <!-- Dimension Labels -->
              <text x="100" y="14" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="middle">Revenue / Bed</text>
              <text x="182" y="78" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="start">Review Score</text>
              <text x="153" y="174" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="start">Response Time</text>
              <text x="47" y="174" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="end">Staff Score</text>
              <text x="18" y="78" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="end">Cost Margin</text>

              <!-- Polygon Shape A (Primary Hub - Indigo) -->
              <polygon [attr.points]="pointsA()" fill="rgba(99, 102, 241, 0.15)" stroke="hsl(243, 75%, 59%)" stroke-width="2" />
              
              <!-- Polygon Shape B (Secondary Hub - Emerald) -->
              <polygon [attr.points]="pointsB()" fill="rgba(16, 185, 129, 0.15)" stroke="hsl(142, 70%, 45%)" stroke-width="2" />
            </svg>
            
            <!-- Legend Indicators overlay -->
            <div class="absolute bottom-3 flex gap-4 text-[9px] font-extrabold select-none">
              <span class="flex items-center gap-1 text-indigo-500">● {{ getPropName(propA) }}</span>
              <span class="flex items-center gap-1 text-emerald-500">● {{ getPropName(propB) }}</span>
            </div>
          </div>
        </div>

        <!-- Occupancy Forecast & Projections -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">6-Month occupancy Projections</h4>
          
          <div class="glass-card p-5 space-y-5">
            <div class="space-y-1">
              <span class="text-xs font-semibold text-slate-500">AI Yield Optimization Insights</span>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                "Occupancy at HSR Layout Hub is projected to reach **94%** in July due to corporate tech onboarding. Recommend a **4% rent adjustment** for new leases next month."
              </p>
            </div>

            <!-- Forecast graph mini SVG -->
            <div class="relative h-28 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-center">
              <svg viewBox="0 0 150 60" class="w-full h-full overflow-visible">
                <!-- trend line -->
                <path d="M 10 40 L 40 35 Q 70 30 100 15 T 140 10" fill="none" stroke="hsl(243, 75%, 59%)" stroke-width="2" />
                <circle cx="140" cy="10" r="2.5" fill="hsl(243, 75%, 59%)" />
                
                <text x="10" y="55" font-size="7" fill="#94a3b8" font-weight="bold">May</text>
                <text x="75" y="55" font-size="7" fill="#94a3b8" font-weight="bold">Jul</text>
                <text x="140" y="55" font-size="7" fill="#94a3b8" font-weight="bold">Sep</text>
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
export class EnterpriseAnalytics implements OnInit {
  private crudService = inject(CrudService);

  properties = signal<PGProperty[]>([]);

  propA = 'prop-001';
  propB = 'prop-002';

  // Radar points computations
  pointsA = signal('100,45 160,84 130,139 71,139 45,93');
  pointsB = signal('100,30 146,93 120,126 80,126 54,93');

  ngOnInit() {
    this.loadData();
    this.updateRadar();
  }

  loadData() {
    const list = this.crudService.getAll<PGProperty>(StorageKeys.PROPERTIES);
    this.properties.set(list.slice(0, 4));
    if (list.length >= 2) {
      this.propA = list[0].id;
      this.propB = list[1].id;
    }
  }

  updateRadar() {
    // Generate different points coordinates dynamically based on selection to show high-fidelity feedback
    if (this.propA === this.propB) {
      this.pointsA.set('100,40 150,84 125,140 75,140 50,84');
      this.pointsB.set('100,40 150,84 125,140 75,140 50,84');
      return;
    }

    // Seed configurations based on combinations
    if (this.propA === 'prop-001') {
      this.pointsA.set('100,25 165,75 140,150 65,150 35,75'); // High performance shape
    } else {
      this.pointsA.set('100,50 140,88 120,130 80,130 60,88');
    }

    if (this.propB === 'prop-002') {
      this.pointsB.set('100,45 155,80 135,140 70,140 45,80');
    } else {
      this.pointsB.set('100,30 160,93 110,120 90,120 54,93');
    }
  }

  getPropName(id: string): string {
    const prop = this.properties().find(p => p.id === id);
    return prop ? prop.name : id;
  }
}
