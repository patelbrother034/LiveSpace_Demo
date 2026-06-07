import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface ReportType { id: string; title: string; description: string; icon: string; color: string; lastGenerated: string; }
interface GeneratedReport { id: string; name: string; generatedBy: string; date: string; format: string; }

@Component({
  selector: 'app-enterprise-reports',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Enterprise Reports" subtitle="Generate comprehensive reports across your portfolio" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        @for (r of reportTypes; track r.id) {
          <div class="glass-card p-5 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group cursor-pointer">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white" [style.background]="r.color"><i [class]="r.icon"></i></div>
            <h4 class="font-bold text-sm text-slate-800 dark:text-white group-hover:text-indigo-600">{{ r.title }}</h4>
            <p class="text-[10px] text-slate-500 leading-relaxed">{{ r.description }}</p>
            <div class="text-[9px] text-slate-400">Last: {{ r.lastGenerated }}</div>
            <button pButton label="Generate" icon="pi pi-download" class="p-button-sm rounded-lg bg-indigo-600 border-indigo-600 text-white w-full text-xs" (click)="generate(r)"></button>
          </div>
        }
      </div>
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-history mr-2 text-slate-400"></i>Recently Generated</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left"><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Report</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">By</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Date</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Format</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Action</th></tr></thead>
            <tbody>
              @for (g of generated(); track g.id) {
                <tr class="border-b border-slate-100 dark:border-slate-800"><td class="p-3 font-bold text-slate-800 dark:text-white">{{ g.name }}</td><td class="p-3 text-slate-500">{{ g.generatedBy }}</td><td class="p-3 text-slate-500">{{ g.date }}</td><td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase">{{ g.format }}</span></td><td class="p-3"><button pButton icon="pi pi-download" class="p-button-sm p-button-text p-button-rounded"></button></td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `, styles: [``]
})
export class EnterpriseReports {
  reportTypes: ReportType[] = [
    { id: 'er1', title: 'Portfolio Performance', description: 'Revenue, occupancy, and growth across all properties', icon: 'pi pi-chart-line', color: 'linear-gradient(135deg, #6366f1, #4f46e5)', lastGenerated: 'Jun 1, 2026' },
    { id: 'er2', title: 'Regional Comparison', description: 'Side-by-side regional performance metrics', icon: 'pi pi-map', color: 'linear-gradient(135deg, #10b981, #059669)', lastGenerated: 'May 28, 2026' },
    { id: 'er3', title: 'Franchise Compliance', description: 'Compliance scores and agreement statuses', icon: 'pi pi-check-square', color: 'linear-gradient(135deg, #f59e0b, #d97706)', lastGenerated: 'May 25, 2026' },
    { id: 'er4', title: 'Revenue Intelligence', description: 'Revenue trends, forecasts, and optimization', icon: 'pi pi-dollar', color: 'linear-gradient(135deg, #ef4444, #dc2626)', lastGenerated: 'Jun 2, 2026' },
    { id: 'er5', title: 'Occupancy Forecast', description: '90-day occupancy predictions per property', icon: 'pi pi-chart-bar', color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', lastGenerated: 'May 30, 2026' },
    { id: 'er6', title: 'Maintenance Cost', description: 'Maintenance expenditure analysis by category', icon: 'pi pi-wrench', color: 'linear-gradient(135deg, #ec4899, #db2777)', lastGenerated: 'May 22, 2026' },
    { id: 'er7', title: 'Staff Efficiency', description: 'Staff performance and workload metrics', icon: 'pi pi-users', color: 'linear-gradient(135deg, #14b8a6, #0d9488)', lastGenerated: 'May 20, 2026' },
    { id: 'er8', title: 'Custom Report Builder', description: 'Build custom reports with your selected metrics', icon: 'pi pi-cog', color: 'linear-gradient(135deg, #64748b, #475569)', lastGenerated: 'Never' },
  ];
  generated = signal<GeneratedReport[]>([
    { id: 'g1', name: 'Portfolio Performance — May 2026', generatedBy: 'Enterprise Admin', date: 'Jun 1, 2026', format: 'PDF' },
    { id: 'g2', name: 'Revenue Intelligence — Q1 2026', generatedBy: 'Enterprise Admin', date: 'Jun 2, 2026', format: 'Excel' },
    { id: 'g3', name: 'Regional Comparison — May 2026', generatedBy: 'Enterprise Admin', date: 'May 28, 2026', format: 'PDF' },
    { id: 'g4', name: 'Franchise Compliance — Q1 2026', generatedBy: 'Enterprise Admin', date: 'May 25, 2026', format: 'PDF' },
  ]);
  generate(r: ReportType) { this.generated.update(l => [{ id: 'g' + Date.now(), name: r.title + ' — Jun 2026', generatedBy: 'Enterprise Admin', date: 'Jun 3, 2026', format: 'PDF' }, ...l]); }
}
