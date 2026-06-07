import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface Franchise { id: string; name: string; location: string; properties: number; compliance: number; agreement: string; revenueShare: number; }

@Component({
  selector: 'app-enterprise-franchises',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Franchise Management" subtitle="Monitor franchise compliance and performance" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Total Franchises</p><p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{{ franchises().length }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Active Agreements</p><p class="text-xl font-extrabold text-emerald-600 mt-1">5</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Avg Compliance</p><p class="text-xl font-extrabold text-indigo-600 mt-1">82%</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Revenue Share</p><p class="text-xl font-extrabold text-purple-600 mt-1">₹4.2L</p></div>
      </div>
      <div class="glass-card overflow-hidden"><div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
            <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Franchise</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Location</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Properties</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Compliance</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Agreement</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Revenue Share</th>
          </tr></thead>
          <tbody>
            @for (f of franchises(); track f.id) {
              <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="p-3 font-bold text-slate-800 dark:text-white">{{ f.name }}</td>
                <td class="p-3 text-slate-500">{{ f.location }}</td>
                <td class="p-3 font-bold">{{ f.properties }}</td>
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full rounded-full" [class]="f.compliance >= 80 ? 'bg-emerald-500' : f.compliance >= 50 ? 'bg-amber-500' : 'bg-red-500'" [style.width.%]="f.compliance"></div></div>
                    <span class="text-xs font-bold">{{ f.compliance }}%</span>
                  </div>
                </td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="f.agreement === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">{{ f.agreement }}</span></td>
                <td class="p-3 font-bold text-indigo-600">₹{{ f.revenueShare | number:'1.0-0' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div></div>
    </div>
  `, styles: [``]
})
export class EnterpriseFranchises {
  franchises = signal<Franchise[]>([
    { id: 'f1', name: 'LiveSpace Noida', location: 'Noida Sector 62', properties: 4, compliance: 92, agreement: 'Active', revenueShare: 125000 },
    { id: 'f2', name: 'LiveSpace Pune', location: 'Pune Hinjewadi', properties: 3, compliance: 88, agreement: 'Active', revenueShare: 95000 },
    { id: 'f3', name: 'LiveSpace Bangalore', location: 'Bangalore Koramangala', properties: 5, compliance: 78, agreement: 'Active', revenueShare: 145000 },
    { id: 'f4', name: 'LiveSpace Hyderabad', location: 'Hyderabad Madhapur', properties: 2, compliance: 65, agreement: 'Renewal Due', revenueShare: 68000 },
    { id: 'f5', name: 'LiveSpace Chennai', location: 'Chennai OMR', properties: 3, compliance: 85, agreement: 'Active', revenueShare: 88000 },
  ]);
}
