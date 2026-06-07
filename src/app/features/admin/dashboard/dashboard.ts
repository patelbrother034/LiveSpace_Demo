import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeader, StatCard],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Platform Command Center" subtitle="Monitor microservice telemetry, SaaS subscriptions, and global platform health" />

      <!-- Platform Telemetry stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Total SaaS Tenants" value="12 Organizations" icon="pi-briefcase" color="primary" />
        <app-stat-card label="Platform Uptime" value="99.98% SLA" icon="pi-check-circle" color="success" />
        <app-stat-card label="SaaS MRR Growth" value="₹14,50,000" icon="pi-chart-bar" color="success" />
        <app-stat-card label="Telemetry Node Rate" value="OK (Healthy)" icon="pi-server" color="success" />
      </div>

      <!-- Telemetry Dials Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Live Node Telemetry Gauges -->
        <div class="xl:col-span-2 glass-card p-6 space-y-5">
          <div class="flex justify-between items-center pb-2">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Live System Resource Telemetry</h4>
            <span class="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold uppercase animate-pulse select-none">Realtime Telemetry</span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            
            <!-- CPU Dial -->
            <div class="space-y-2">
              <p class="text-[10px] text-slate-500 font-bold uppercase">CPU Load</p>
              <div class="relative h-20 w-20 mx-auto flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path class="text-slate-100 dark:text-slate-800" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="text-indigo-500 transition-all duration-500" [attr.stroke-dasharray]="cpuDashArray()" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute text-xs font-black text-slate-800 dark:text-white">{{ cpuVal() }}%</div>
              </div>
            </div>

            <!-- RAM Dial -->
            <div class="space-y-2">
              <p class="text-[10px] text-slate-500 font-bold uppercase">RAM Usage</p>
              <div class="relative h-20 w-20 mx-auto flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path class="text-slate-100 dark:text-slate-800" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="text-emerald-500 transition-all duration-500" [attr.stroke-dasharray]="ramDashArray()" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute text-xs font-black text-slate-800 dark:text-white">{{ ramVal() }}%</div>
              </div>
            </div>

            <!-- API Latency Dial -->
            <div class="space-y-2">
              <p class="text-[10px] text-slate-500 font-bold uppercase">API Latency</p>
              <div class="relative h-20 w-20 mx-auto flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path class="text-slate-100 dark:text-slate-800" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="text-sky-500 transition-all duration-500" [attr.stroke-dasharray]="latDashArray()" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute text-xs font-black text-slate-800 dark:text-white">{{ latencyVal() }}ms</div>
              </div>
            </div>

            <!-- Error rate Dial -->
            <div class="space-y-2">
              <p class="text-[10px] text-slate-500 font-bold uppercase">HTTP Error Rate</p>
              <div class="relative h-20 w-20 mx-auto flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path class="text-slate-100 dark:text-slate-800" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="text-red-500 transition-all duration-500" [attr.stroke-dasharray]="errDashArray()" stroke-width="3.5" stroke-linecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="absolute text-xs font-black text-slate-800 dark:text-white">{{ errorVal() }}%</div>
              </div>
            </div>

          </div>
        </div>

        <!-- SaaS subscriptions allocation -->
        <div class="xl:col-span-1 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Acquisition growth trends</h4>
          
          <div class="glass-card p-5 space-y-4 flex flex-col justify-between h-64">
            <div class="space-y-1">
              <span class="text-xs font-semibold text-slate-500">Global SaaS Telemetry summary:</span>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                All cloud clusters operating under nominal SLA bounds. Database transactions replication latency verified at **14ms**.
              </p>
            </div>
            
            <div class="relative h-24 flex items-center justify-center border-t border-slate-100 dark:border-slate-800/80 pt-2">
              <!-- custom vector -->
              <svg viewBox="0 0 150 50" class="w-full h-full overflow-visible">
                <path d="M 10 45 L 35 40 Q 60 30 85 20 T 140 5" fill="none" stroke="hsl(243, 75%, 59%)" stroke-width="2" />
                <circle cx="140" cy="5" r="2" fill="hsl(243, 75%, 59%)" />
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
export class AdminDashboard implements OnInit, OnDestroy {
  cpuVal = signal(42);
  ramVal = signal(68);
  latencyVal = signal(24);
  errorVal = signal(0.04);

  // Dash Arrays for SVG Circular bars
  cpuDashArray = computed(() => `${this.cpuVal()}, 100`);
  ramDashArray = computed(() => `${this.ramVal()}, 100`);
  latDashArray = computed(() => `${(this.latencyVal() / 200) * 100}, 100`);
  errDashArray = computed(() => `${this.errorVal() * 200}, 100`);

  private intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      // Simulate live fluctuating telemetry
      this.cpuVal.set(Math.floor(35 + Math.random() * 15));
      this.ramVal.set(Math.floor(65 + Math.random() * 5));
      this.latencyVal.set(Math.floor(20 + Math.random() * 12));
      this.errorVal.set(Number((0.02 + Math.random() * 0.04).toFixed(2)));
    }, 2800);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
