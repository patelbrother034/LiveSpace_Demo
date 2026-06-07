import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface Feature { id: string; name: string; description: string; enabled: boolean; category: string; }

@Component({
  selector: 'app-admin-feature-flags',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Feature Flags" subtitle="Toggle platform features per organization">
        <div class="flex gap-2">
          <button pButton label="Enable All" icon="pi pi-check" class="p-button-sm rounded-xl bg-emerald-500 border-emerald-500 text-white" (click)="setAll(true)"></button>
          <button pButton label="Disable All" icon="pi pi-times" class="p-button-sm rounded-xl p-button-outlined" (click)="setAll(false)"></button>
        </div>
      </app-page-header>

      <!-- Org Selector -->
      <div class="glass-card p-4 flex items-center gap-4">
        <label class="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Organization:</label>
        <select class="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold" [(ngModel)]="selectedOrg">
          <option>Sunrise PG Network</option><option>Green Valley Hostels</option><option>Metro Living Spaces</option><option>StudyNest PG</option>
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        @for (f of features(); track f.id) {
          <div class="glass-card p-5 space-y-3 transition-all" [class]="f.enabled ? 'border-emerald-200 dark:border-emerald-800/50' : ''">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-bold text-sm text-slate-800 dark:text-white">{{ f.name }}</h4>
                <span class="text-[9px] font-bold text-slate-400 uppercase">{{ f.category }}</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [checked]="f.enabled" (change)="toggleFeature(f.id)" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            <p class="text-[11px] text-slate-500 leading-relaxed">{{ f.description }}</p>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" [class]="f.enabled ? 'bg-emerald-500' : 'bg-slate-300'"></span>
              <span class="text-[10px] font-bold uppercase" [class]="f.enabled ? 'text-emerald-600' : 'text-slate-400'">{{ f.enabled ? 'Enabled' : 'Disabled' }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `, styles: [``]
})
export class AdminFeatureFlags {
  selectedOrg = 'Sunrise PG Network';
  features = signal<Feature[]>([
    { id: 'ff1', name: 'AI Hub', description: 'AI-powered roommate matching, forecasting, and insights', enabled: true, category: 'AI' },
    { id: 'ff2', name: 'GST Module', description: 'GST compliance, filing, and transaction tracking', enabled: true, category: 'Finance' },
    { id: 'ff3', name: 'Franchise Mode', description: 'Franchise management and compliance monitoring', enabled: false, category: 'Enterprise' },
    { id: 'ff4', name: 'White-Label', description: 'Custom branding, colors, logo, and domain', enabled: false, category: 'Enterprise' },
    { id: 'ff5', name: 'Multi-Property', description: 'Manage multiple properties from one account', enabled: true, category: 'Core' },
    { id: 'ff6', name: 'API Access', description: 'REST API access for third-party integrations', enabled: false, category: 'Developer' },
    { id: 'ff7', name: 'Custom Reports', description: 'Custom report builder with drag-and-drop', enabled: true, category: 'Analytics' },
    { id: 'ff8', name: 'Mobile App', description: 'Native mobile app for caretakers and wardens', enabled: true, category: 'Platform' },
  ]);
  toggleFeature(id: string) { this.features.update(list => list.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)); }
  setAll(enabled: boolean) { this.features.update(list => list.map(f => ({ ...f, enabled }))); }
}
