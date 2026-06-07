import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface PGProperty {
  id: string;
  name: string;
  type: string;
  gender: string;
  totalBeds: number;
  occupiedBeds: number;
  monthlyRevenue: number;
}

@Component({
  selector: 'app-enterprise-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeader, StatCard],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Enterprise Command Deck" subtitle="Monitor multi-city co-living occupancy grids and brand portfolios" />

      <!-- Enterprise KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Total PG Portfolios" value="4 Properties" icon="pi-building" color="primary" />
        <app-stat-card label="Aggregate Occupancy" value="84% Capacity" icon="pi-users" color="success" />
        <app-stat-card label="Monthly SaaS Billings" value="₹7,85,000" icon="pi-indian-rupee" color="warning" />
        <app-stat-card label="Franchise Compliance" value="98.5% Score" icon="pi-check-circle" color="success" />
      </div>

      <!-- Tech Hubs Portfolio Map and Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Tech Hubs Custom SVG India Map -->
        <div class="xl:col-span-1 glass-card p-6 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Indian Tech Hubs Footprint</h4>
          
          <div class="relative h-60 flex items-center justify-center bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-150/40 dark:border-slate-800/80 p-2">
            <!-- Custom Vector Indian tech centers map -->
            <svg viewBox="0 0 200 240" class="w-full h-full overflow-visible">
              <!-- Outline shape of India simplified -->
              <path d="M 60 40 L 95 10 L 120 40 L 155 90 L 180 130 L 150 170 L 120 220 L 105 235 L 90 200 L 70 180 L 50 150 L 35 125 L 45 90 L 40 60 Z" 
                fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" class="dark:fill-slate-800/40 dark:stroke-slate-700" />
              
              <!-- Hotspots circles for PG hubs -->
              <!-- Noida NCR -->
              <g class="cursor-pointer group">
                <circle cx="95" cy="70" r="5" fill="hsl(243, 75%, 59%)" class="animate-pulse" />
                <circle cx="95" cy="70" r="2.5" fill="hsl(243, 75%, 59%)" />
                <text x="105" y="73" font-size="7.5" font-weight="extrabold" fill="#475569" class="dark:fill-slate-400 group-hover:fill-indigo-500">Noida (88%)</text>
              </g>

              <!-- Gurgaon -->
              <g class="cursor-pointer group">
                <circle cx="85" cy="75" r="5" fill="hsl(243, 75%, 59%)" class="animate-pulse" />
                <circle cx="85" cy="75" r="2.5" fill="hsl(243, 75%, 59%)" />
                <text x="50" y="78" font-size="7.5" font-weight="extrabold" fill="#475569" class="dark:fill-slate-400 group-hover:fill-indigo-500">Gurgaon (91%)</text>
              </g>

              <!-- Pune -->
              <g class="cursor-pointer group">
                <circle cx="65" cy="140" r="5" fill="hsl(243, 75%, 59%)" class="animate-pulse" />
                <circle cx="65" cy="140" r="2.5" fill="hsl(243, 75%, 59%)" />
                <text x="35" y="143" font-size="7.5" font-weight="extrabold" fill="#475569" class="dark:fill-slate-400 group-hover:fill-indigo-500">Pune (78%)</text>
              </g>

              <!-- Bangalore HSR -->
              <g class="cursor-pointer group">
                <circle cx="85" cy="180" r="5" fill="hsl(243, 75%, 59%)" class="animate-pulse" />
                <circle cx="85" cy="180" r="2.5" fill="hsl(243, 75%, 59%)" />
                <text x="95" y="183" font-size="7.5" font-weight="extrabold" fill="#475569" class="dark:fill-slate-400 group-hover:fill-indigo-500">Bangalore (83%)</text>
              </g>
            </svg>
          </div>
          <p class="text-[9.5px] text-slate-500 italic text-center">Color intensities reflect EBITDA operational profitability index</p>
        </div>

        <!-- Portfolio Occupancy performance list -->
        <div class="xl:col-span-2 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Property Portfolio Grid</h4>
          
          <div class="glass-card p-5 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase font-bold text-[10px]">
                    <th class="py-2.5">Property Hub</th>
                    <th class="py-2.5">Type</th>
                    <th class="py-2.5">Beds Capacity</th>
                    <th class="py-2.5">Occupancy Rate</th>
                    <th class="py-2.5 text-right">Monthly Revenue</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                  @for (p of properties(); track p.id) {
                    <tr>
                      <td class="py-3.5 font-bold text-slate-850 dark:text-white">{{ p.name }}</td>
                      <td class="py-3.5">{{ p.type }} · {{ p.gender }}</td>
                      <td class="py-3.5 font-semibold">{{ p.totalBeds }} Beds</td>
                      <td class="py-3.5">
                        <div class="flex items-center gap-2">
                          <div class="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0">
                            <div class="bg-indigo-500 h-full" [style.width.%]="(p.occupiedBeds / p.totalBeds) * 100"></div>
                          </div>
                          <span class="font-extrabold text-[10.5px] text-slate-700 dark:text-slate-350">
                            {{ ((p.occupiedBeds / p.totalBeds) * 100) | number:'1.0-0' }}%
                          </span>
                        </div>
                      </td>
                      <td class="py-3.5 text-right font-extrabold text-slate-800 dark:text-white">₹{{ p.monthlyRevenue | number:'1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
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
export class EnterpriseDashboard implements OnInit {
  private crudService = inject(CrudService);

  properties = signal<PGProperty[]>([]);

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    const list = this.crudService.getAll<PGProperty>(StorageKeys.PROPERTIES);
    this.properties.set(list.slice(0, 4));
  }
}
