import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-ai-occupancy-forecast',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Predictive Occupancy Forecast" subtitle="Inspect AI-powered 90-day capacity trends and run rent scenario simulators" />

      <!-- Forecast summary stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass-card p-5 space-y-2">
          <p class="text-[10px] text-slate-500 font-extrabold uppercase">Projected Occupancy</p>
          <h3 class="text-xl font-black text-slate-800 dark:text-white">{{ projectedRate() | number:'1.0-0' }}% Capacity</h3>
        </div>
        <div class="glass-card p-5 space-y-2">
          <p class="text-[10px] text-slate-500 font-extrabold uppercase">Expected vacant Beds</p>
          <h3 class="text-xl font-black text-amber-500">{{ expectedVacant() }} Beds</h3>
        </div>
        <div class="glass-card p-5 space-y-2">
          <p class="text-[10px] text-slate-500 font-extrabold uppercase">Model Confidence SLA</p>
          <h3 class="text-xl font-black text-indigo-500">87% Accuracy</h3>
        </div>
        <div class="glass-card p-5 space-y-2">
          <p class="text-[10px] text-slate-500 font-extrabold uppercase">Target Seasonal Peak</p>
          <h3 class="text-xl font-black text-emerald-500">July Admissions</h3>
        </div>
      </div>

      <!-- Forecast graph and Scenario controller -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- 90-Day Predictive SVG Chart -->
        <div class="xl:col-span-2 glass-card p-6 space-y-4">
          <div class="flex justify-between items-center pb-2">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">90-Day Predictive Capacity Curve</h4>
            <div class="flex items-center gap-3 text-[10px] font-bold">
              <span class="flex items-center gap-1 text-slate-350 dark:text-slate-600">░░ Confidence Band</span>
              <span class="flex items-center gap-1 text-indigo-500">── Expected Forecast</span>
            </div>
          </div>

          <!-- Forecast Chart SVG -->
          <div class="relative h-60 flex items-center justify-center bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80">
            <svg viewBox="0 0 400 150" class="w-full h-full overflow-visible select-none">
              <!-- Horizontal grid lines -->
              <line x1="30" y1="20" x2="380" y2="20" stroke="#f1f5f9" stroke-width="1" class="dark:stroke-slate-800" />
              <line x1="30" y1="70" x2="380" y2="70" stroke="#f1f5f9" stroke-width="1" class="dark:stroke-slate-800" />
              <line x1="30" y1="120" x2="380" y2="120" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800/80" />

              <!-- Confidence Band Area -->
              <path [attr.d]="confidenceBandPath()" fill="rgba(99, 102, 241, 0.08)" stroke="none" />

              <!-- Projected Spline Expected curve -->
              <path [attr.d]="forecastPath()" fill="none" stroke="hsl(243, 75%, 59%)" stroke-width="2.5" />
              
              <!-- Hotspots circles for seasonal events -->
              <!-- Admissions Season peak circle -->
              <circle cx="280" [attr.cy]="peakY()" r="4" fill="hsl(142, 70%, 45%)" stroke="#fff" stroke-width="1.5" />
              
              <!-- Labels -->
              <text x="30" y="135" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">June (Current)</text>
              <text x="146.6" y="135" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">July</text>
              <text x="263.3" y="135" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">August</text>
              <text x="380" y="135" font-size="8" fill="#94a3b8" text-anchor="end" font-weight="bold">September</text>

              <!-- Seasonal Annotation Overlay -->
              <g class="opacity-80">
                <rect x="230" y="8" width="80" height="14" rx="3" fill="hsl(142, 70%, 45%)" />
                <text x="270" y="17" font-size="6.5" font-weight="extrabold" fill="#fff" text-anchor="middle">College Admissions Peak</text>
                <line x1="270" y1="22" x2="270" y2="40" stroke="hsl(142, 70%, 45%)" stroke-width="1" stroke-dasharray="2,2" />
              </g>
            </svg>
          </div>
          <p class="text-[9.5px] text-slate-500 italic text-center">Prediction based on Sector 62 historical co-living data and regional admissions indices</p>
        </div>

        <!-- Scenario Simulator Slider -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Scenario Simulator</h4>
          
          <div class="glass-card p-6 space-y-5">
            <div class="space-y-3.5 text-xs">
              
              <!-- Rent slider -->
              <div class="space-y-1.5">
                <div class="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                  <span>Room Rent Adjustment:</span>
                  <span [class]="rentDelta() > 0 ? 'text-indigo-500' : rentDelta() < 0 ? 'text-red-500' : 'text-slate-500'">
                    {{ rentDelta() > 0 ? '+' : '' }}{{ rentDelta() }}%
                  </span>
                </div>
                <input type="range" min="-15" max="15" [(ngModel)]="rentDelta"
                  class="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none dark:bg-slate-700">
              </div>

              <!-- Marketing spend slider -->
              <div class="space-y-1.5 pt-1.5">
                <div class="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                  <span>Marketing Budget Campaign:</span>
                  <span class="text-indigo-500">₹{{ marketingSpend() | number:'1.0-0' }}</span>
                </div>
                <input type="range" min="0" max="50000" step="5000" [(ngModel)]="marketingSpend"
                  class="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none dark:bg-slate-700">
              </div>

              <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 leading-relaxed space-y-1.5">
                <p class="font-bold text-slate-650 dark:text-slate-350 text-[10.5px]">Simulation Feedback:</p>
                <p>· Price elasticity coefficient: -0.68</p>
                <p>· Marketing conversion yield: +0.45% / ₹10k</p>
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
export class AIOccupancyForecast {
  // Scenario variables
  rentDelta = signal(0);
  marketingSpend = signal(15000);

  // Compute metrics based on sliders
  projectedRate = computed(() => {
    // base occupancy 84%
    // rent delta drops occupancy (elasticity -0.65)
    // marketing spend rises occupancy (+1.2% per ₹10k)
    const base = 84;
    const priceEffect = this.rentDelta() * -0.65;
    const marketingEffect = (this.marketingSpend() / 10000) * 1.2;
    return Math.max(10, Math.min(100, base + priceEffect + marketingEffect));
  });

  expectedVacant = computed(() => {
    const totalBeds = 45;
    const occupied = Math.round(totalBeds * (this.projectedRate() / 100));
    return Math.max(0, totalBeds - occupied);
  });

  // Circle peak dot height
  peakY = computed(() => {
    // curve value at admissions x=280 is generally ~88% -> y coordinate
    const rate = this.projectedRate();
    const yVal = 120 - (rate / 100) * 90;
    return Math.max(15, Math.min(125, yVal - 10));
  });

  // Compute Forecast SVG spline path coordinates
  forecastPath = computed(() => {
    const rate = this.projectedRate();
    // coordinates x spacing: x1=30, x2=146.6, x3=263.3, x4=380
    // base heights: y1=85, y2=80, y3=45, y4=30
    // adjust baseline heights relative to simulated rate multiplier
    const mult = rate / 84;
    
    const y1 = (120 - 75 * mult).toFixed(1);
    const y2 = (120 - 80 * mult).toFixed(1);
    const y3 = (120 - 105 * mult).toFixed(1);
    const y4 = (120 - 110 * mult).toFixed(1);

    return `M 30 ${y1} Q 146.6 ${y2} 263.3 ${y3} T 380 ${y4}`;
  });

  confidenceBandPath = computed(() => {
    const rate = this.projectedRate();
    const mult = rate / 84;

    // upper curve coordinates
    const uy1 = (120 - 88 * mult).toFixed(1);
    const uy2 = (120 - 95 * mult).toFixed(1);
    const uy3 = (120 - 115 * mult).toFixed(1);
    const uy4 = (120 - 120 * mult).toFixed(1);

    // lower curve coordinates
    const ly1 = (120 - 62 * mult).toFixed(1);
    const ly2 = (120 - 65 * mult).toFixed(1);
    const ly3 = (120 - 92 * mult).toFixed(1);
    const ly4 = (120 - 98 * mult).toFixed(1);

    // construct polygon path looping clockwise along upper line, then counterclockwise along lower line
    return `M 30 ${uy1} Q 146.6 ${uy2} 263.3 ${uy3} T 380 ${uy4} L 380 ${ly4} Q 263.3 ${ly3} 146.6 ${ly2} T 30 ${ly1} Z`;
  });
}
