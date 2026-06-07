import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface Property { id: string; name: string; occupancy: number; revenue: number; avgRent: number; maintenanceCost: number; satisfaction: number; collectionRate: number; }

@Component({
  selector: 'app-enterprise-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Property Comparison" subtitle="Side-by-side analysis of property performance" />

      <!-- Property Selectors -->
      <div class="glass-card p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Property A</label>
            <select class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold" [(ngModel)]="selectedA" (ngModelChange)="updateComparison()">
              @for (p of properties; track p.id) { <option [value]="p.id">{{ p.name }}</option> }
            </select>
          </div>
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Property B</label>
            <select class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold" [(ngModel)]="selectedB" (ngModelChange)="updateComparison()">
              @for (p of properties; track p.id) { <option [value]="p.id">{{ p.name }}</option> }
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Comparison Table -->
        <div class="glass-card overflow-hidden">
          <div class="p-4 border-b border-slate-200 dark:border-slate-700"><h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Metrics Comparison</h4></div>
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Metric</th><th class="p-3 text-xs font-semibold text-indigo-600 uppercase">{{ propA().name }}</th><th class="p-3 text-xs font-semibold text-purple-600 uppercase">{{ propB().name }}</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Winner</th>
            </tr></thead>
            <tbody>
              @for (m of metrics(); track m.label) {
                <tr class="border-b border-slate-100 dark:border-slate-800">
                  <td class="p-3 font-medium text-slate-700 dark:text-slate-300">{{ m.label }}</td>
                  <td class="p-3 font-bold" [class]="m.winnerA ? 'text-emerald-600' : ''">{{ m.valueA }}</td>
                  <td class="p-3 font-bold" [class]="!m.winnerA ? 'text-emerald-600' : ''">{{ m.valueB }}</td>
                  <td class="p-3"><span class="text-xs font-bold" [class]="m.winnerA ? 'text-indigo-600' : 'text-purple-600'">{{ m.winnerA ? 'A' : 'B' }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Radar Chart (SVG) -->
        <div class="glass-card p-5 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Performance Radar</h4>
          <div class="flex justify-center">
            <svg viewBox="0 0 300 300" class="w-64 h-64">
              <!-- Grid -->
              @for (i of [1,2,3,4,5]; track i) {
                <polygon [attr.points]="getHexPoints(150, 150, i * 25)" fill="none" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="0.5" />
              }
              <!-- Axes -->
              @for (a of axisPoints; track a.label) {
                <line x1="150" y1="150" [attr.x2]="a.x" [attr.y2]="a.y" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="0.5" />
                <text [attr.x]="a.lx" [attr.y]="a.ly" text-anchor="middle" class="text-[8px] fill-slate-500 font-bold">{{ a.label }}</text>
              }
              <!-- Property A -->
              <polygon [attr.points]="radarPointsA()" fill="rgba(99,102,241,0.15)" stroke="#6366f1" stroke-width="2" />
              <!-- Property B -->
              <polygon [attr.points]="radarPointsB()" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="2" />
            </svg>
          </div>
          <div class="flex justify-center gap-6 text-xs">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-indigo-500"></span> {{ propA().name }}</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-purple-500"></span> {{ propB().name }}</span>
          </div>
        </div>
      </div>
    </div>
  `, styles: [``]
})
export class EnterpriseComparison {
  selectedA = 'p1'; selectedB = 'p2';
  properties: Property[] = [
    { id: 'p1', name: 'Sunrise PG', occupancy: 92, revenue: 385000, avgRent: 8500, maintenanceCost: 28000, satisfaction: 88, collectionRate: 95 },
    { id: 'p2', name: 'Green Valley PG', occupancy: 85, revenue: 320000, avgRent: 7500, maintenanceCost: 22000, satisfaction: 82, collectionRate: 90 },
    { id: 'p3', name: 'Metro Living', occupancy: 78, revenue: 450000, avgRent: 12000, maintenanceCost: 35000, satisfaction: 90, collectionRate: 92 },
    { id: 'p4', name: 'StudyNest PG', occupancy: 96, revenue: 280000, avgRent: 6500, maintenanceCost: 18000, satisfaction: 85, collectionRate: 97 },
  ];
  propA = computed(() => this.properties.find(p => p.id === this.selectedA)!);
  propB = computed(() => this.properties.find(p => p.id === this.selectedB)!);
  metrics = computed(() => {
    const a = this.propA(); const b = this.propB();
    return [
      { label: 'Occupancy', valueA: a.occupancy + '%', valueB: b.occupancy + '%', winnerA: a.occupancy >= b.occupancy },
      { label: 'Revenue', valueA: '₹' + a.revenue.toLocaleString(), valueB: '₹' + b.revenue.toLocaleString(), winnerA: a.revenue >= b.revenue },
      { label: 'Avg Rent', valueA: '₹' + a.avgRent.toLocaleString(), valueB: '₹' + b.avgRent.toLocaleString(), winnerA: a.avgRent >= b.avgRent },
      { label: 'Maintenance Cost', valueA: '₹' + a.maintenanceCost.toLocaleString(), valueB: '₹' + b.maintenanceCost.toLocaleString(), winnerA: a.maintenanceCost <= b.maintenanceCost },
      { label: 'Satisfaction', valueA: a.satisfaction + '%', valueB: b.satisfaction + '%', winnerA: a.satisfaction >= b.satisfaction },
      { label: 'Collection Rate', valueA: a.collectionRate + '%', valueB: b.collectionRate + '%', winnerA: a.collectionRate >= b.collectionRate },
    ];
  });
  axisPoints = [
    { label: 'Occupancy', x: 150, y: 25, lx: 150, ly: 15 },
    { label: 'Revenue', x: 258, y: 87, lx: 275, ly: 85 },
    { label: 'Avg Rent', x: 258, y: 212, lx: 275, ly: 220 },
    { label: 'Maint Cost', x: 150, y: 275, lx: 150, ly: 292 },
    { label: 'Satisfaction', x: 42, y: 212, lx: 22, ly: 220 },
    { label: 'Collection', x: 42, y: 87, lx: 22, ly: 85 },
  ];
  getHexPoints(cx: number, cy: number, r: number): string {
    return [0,1,2,3,4,5].map(i => { const a = (Math.PI/3)*i - Math.PI/2; return `${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`; }).join(' ');
  }
  getRadarPoints(p: Property): string {
    const vals = [p.occupancy, p.revenue/5000, p.avgRent/150, 100-p.maintenanceCost/500, p.satisfaction, p.collectionRate];
    return vals.map((v,i) => { const a = (Math.PI/3)*i - Math.PI/2; const r = (v/100)*125; return `${150+r*Math.cos(a)},${150+r*Math.sin(a)}`; }).join(' ');
  }
  radarPointsA = computed(() => this.getRadarPoints(this.propA()));
  radarPointsB = computed(() => this.getRadarPoints(this.propB()));
  updateComparison() {}
}
