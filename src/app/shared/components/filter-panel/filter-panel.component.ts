import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface FilterOption { key: string; label: string; type: 'select' | 'range' | 'toggle'; options?: string[]; value?: any; }

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="glass-card overflow-hidden transition-all" [class]="isOpen() ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 !border-0 !p-0'">
      <div class="p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-filter text-indigo-500"></i> Filters
          </h4>
          <button pButton label="Clear All" icon="pi pi-times" class="p-button-sm p-button-text text-slate-400" (click)="clearFilters()"></button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (filter of filters(); track filter.key) {
            <div>
              <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{{ filter.label }}</label>
              @if (filter.type === 'select' && filter.options) {
                <select class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/30"
                  [(ngModel)]="filter.value" (ngModelChange)="emitFilters()">
                  <option value="">All</option>
                  @for (opt of filter.options; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
              }
              @if (filter.type === 'range') {
                <div class="flex items-center gap-2">
                  <input pInputText type="number" placeholder="Min" class="w-full rounded-lg text-sm" [(ngModel)]="filter.value.min" (ngModelChange)="emitFilters()" />
                  <span class="text-slate-400">-</span>
                  <input pInputText type="number" placeholder="Max" class="w-full rounded-lg text-sm" [(ngModel)]="filter.value.max" (ngModelChange)="emitFilters()" />
                </div>
              }
            </div>
          }
        </div>

        <!-- Active Filters -->
        @if (activeFilterCount() > 0) {
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span class="text-xs text-slate-400">Active:</span>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              {{ activeFilterCount() }} filter(s)
            </span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; } .max-h-0 { max-height: 0; overflow: hidden; padding: 0 !important; margin: 0 !important; border-width: 0 !important; }`]
})
export class FilterPanelComponent {
  filters = input<FilterOption[]>([]);
  isOpen = input(false);
  filterChange = output<Record<string, any>>();

  activeFilterCount = signal(0);

  emitFilters() {
    const result: Record<string, any> = {};
    let count = 0;
    for (const f of this.filters()) {
      if (f.value && f.value !== '' && !(f.type === 'range' && !f.value.min && !f.value.max)) {
        result[f.key] = f.value;
        count++;
      }
    }
    this.activeFilterCount.set(count);
    this.filterChange.emit(result);
  }

  clearFilters() {
    for (const f of this.filters()) {
      if (f.type === 'range') f.value = { min: null, max: null };
      else f.value = '';
    }
    this.activeFilterCount.set(0);
    this.filterChange.emit({});
  }
}
