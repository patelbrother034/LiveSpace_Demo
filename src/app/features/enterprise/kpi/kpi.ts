import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface KpiWidget { id: string; title: string; value: string; icon: string; color: string; category: string; active: boolean; }

@Component({
  selector: 'app-enterprise-kpi',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="KPI Dashboard Builder" subtitle="Customize your dashboard with the KPIs that matter most">
        <button pButton label="Save Layout" icon="pi pi-save" class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white" (click)="saveLayout()"></button>
      </app-page-header>

      <!-- Active Dashboard Preview -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-th-large mr-2 text-indigo-500"></i>Your Dashboard ({{ activeCount() }} KPIs)</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (w of activeWidgets(); track w.id) {
            <div class="p-4 rounded-xl text-white text-center relative group transition-all hover:scale-[1.02]" [style.background]="w.color">
              <button class="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none" (click)="toggleWidget(w.id)">✕</button>
              <i [class]="w.icon + ' text-lg mb-1 block text-white/70'"></i>
              <p class="text-xl font-extrabold">{{ w.value }}</p>
              <p class="text-[10px] text-white/80 font-bold uppercase mt-0.5">{{ w.title }}</p>
            </div>
          } @empty {
            <div class="col-span-full p-8 text-center text-slate-400 italic border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              <i class="pi pi-plus-circle text-2xl mb-2 block"></i>Select KPIs from below to build your dashboard
            </div>
          }
        </div>
      </div>

      <!-- Available Widgets -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-list mr-2 text-slate-400"></i>Available KPI Widgets</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (w of widgets(); track w.id) {
            <div class="p-4 rounded-xl border-2 text-center cursor-pointer transition-all hover:shadow-md"
              [class]="w.active ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'"
              (click)="toggleWidget(w.id)">
              <i [class]="w.icon + ' text-lg mb-1 block'" [style.color]="w.active ? '#6366f1' : '#94a3b8'"></i>
              <p class="text-sm font-bold text-slate-800 dark:text-white">{{ w.value }}</p>
              <p class="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{{ w.title }}</p>
              <span class="text-[8px] font-bold uppercase mt-1 block" [class]="w.active ? 'text-indigo-600' : 'text-slate-400'">{{ w.active ? '✓ Added' : '+ Add' }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `, styles: [``]
})
export class EnterpriseKpi {
  widgets = signal<KpiWidget[]>([
    { id: 'k1', title: 'Occupancy Rate', value: '87%', icon: 'pi pi-home', color: 'linear-gradient(135deg, #6366f1, #4f46e5)', category: 'Operations', active: true },
    { id: 'k2', title: 'Revenue MTD', value: '₹18.5L', icon: 'pi pi-dollar', color: 'linear-gradient(135deg, #10b981, #059669)', category: 'Financial', active: true },
    { id: 'k3', title: 'Collection Rate', value: '94%', icon: 'pi pi-wallet', color: 'linear-gradient(135deg, #f59e0b, #d97706)', category: 'Financial', active: true },
    { id: 'k4', title: 'Avg Rent', value: '₹8,200', icon: 'pi pi-tag', color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', category: 'Financial', active: false },
    { id: 'k5', title: 'Vacancy Count', value: '18', icon: 'pi pi-inbox', color: 'linear-gradient(135deg, #ef4444, #dc2626)', category: 'Operations', active: true },
    { id: 'k6', title: 'Open Tickets', value: '7', icon: 'pi pi-wrench', color: 'linear-gradient(135deg, #ec4899, #db2777)', category: 'Maintenance', active: false },
    { id: 'k7', title: 'Satisfaction', value: '4.2★', icon: 'pi pi-star', color: 'linear-gradient(135deg, #14b8a6, #0d9488)', category: 'Quality', active: true },
    { id: 'k8', title: 'Churn Rate', value: '3.2%', icon: 'pi pi-sign-out', color: 'linear-gradient(135deg, #f97316, #ea580c)', category: 'Operations', active: false },
    { id: 'k9', title: 'NOI', value: '₹6.8L', icon: 'pi pi-chart-line', color: 'linear-gradient(135deg, #22c55e, #16a34a)', category: 'Financial', active: false },
    { id: 'k10', title: 'RevPAB', value: '₹7,800', icon: 'pi pi-chart-bar', color: 'linear-gradient(135deg, #3b82f6, #2563eb)', category: 'Financial', active: false },
    { id: 'k11', title: 'OpEx Ratio', value: '42%', icon: 'pi pi-percentage', color: 'linear-gradient(135deg, #a855f7, #9333ea)', category: 'Financial', active: false },
    { id: 'k12', title: 'Staff Ratio', value: '1:12', icon: 'pi pi-users', color: 'linear-gradient(135deg, #64748b, #475569)', category: 'Operations', active: false },
  ]);
  activeWidgets = computed(() => this.widgets().filter(w => w.active));
  activeCount = computed(() => this.activeWidgets().length);
  toggleWidget(id: string) { this.widgets.update(list => list.map(w => w.id === id ? { ...w, active: !w.active } : w)); }
  saveLayout() { alert('Dashboard layout saved! ' + this.activeCount() + ' KPIs active.'); }
}
