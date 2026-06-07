import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface Region { id: string; name: string; properties: number; beds: number; occupancy: number; revenue: number; growth: number; }

@Component({
  selector: 'app-enterprise-regions',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Regional Analytics" subtitle="Performance breakdown across geographic regions" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total Regions</p><p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{{ regions().length }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Best Region</p><p class="text-xl font-extrabold text-emerald-600 mt-1">NCR</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Lowest Occupancy</p><p class="text-xl font-extrabold text-amber-600 mt-1">East</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total Properties</p><p class="text-xl font-extrabold text-indigo-600 mt-1">42</p></div>
      </div>

      <!-- Region Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        @for (r of regions(); track r.id) {
          <div class="glass-card p-5 space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
            <div class="flex justify-between items-center">
              <h4 class="font-bold text-lg text-slate-800 dark:text-white">{{ r.name }}</h4>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold" [class]="r.growth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">{{ r.growth >= 0 ? '+' : '' }}{{ r.growth }}%</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div><span class="text-slate-400">Properties</span><p class="font-bold text-slate-800 dark:text-white text-lg">{{ r.properties }}</p></div>
              <div><span class="text-slate-400">Total Beds</span><p class="font-bold text-slate-800 dark:text-white text-lg">{{ r.beds }}</p></div>
              <div><span class="text-slate-400">Occupancy</span>
                <div class="flex items-center gap-2 mt-1"><div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full rounded-full" [class]="r.occupancy >= 80 ? 'bg-emerald-500' : r.occupancy >= 60 ? 'bg-amber-500' : 'bg-red-500'" [style.width.%]="r.occupancy"></div></div><span class="font-bold">{{ r.occupancy }}%</span></div>
              </div>
              <div><span class="text-slate-400">Revenue/mo</span><p class="font-bold text-indigo-600 text-lg">₹{{ r.revenue | number:'1.0-0' }}</p></div>
            </div>
          </div>
        }
      </div>
    </div>
  `, styles: [``]
})
export class EnterpriseRegions {
  regions = signal<Region[]>([
    { id: 'r1', name: 'NCR (Delhi/Noida/Gurgaon)', properties: 12, beds: 840, occupancy: 92, revenue: 3780000, growth: 8.5 },
    { id: 'r2', name: 'South India', properties: 8, beds: 560, occupancy: 88, revenue: 2520000, growth: 12.3 },
    { id: 'r3', name: 'West India', properties: 7, beds: 490, occupancy: 85, revenue: 2205000, growth: 5.2 },
    { id: 'r4', name: 'East India', properties: 4, beds: 280, occupancy: 68, revenue: 980000, growth: -2.1 },
    { id: 'r5', name: 'Central India', properties: 5, beds: 350, occupancy: 76, revenue: 1400000, growth: 3.8 },
    { id: 'r6', name: 'North India (excl NCR)', properties: 6, beds: 420, occupancy: 82, revenue: 1680000, growth: 6.7 },
  ]);
}
