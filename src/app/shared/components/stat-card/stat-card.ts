import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  imports: [],
  template: `
    <div class="glass-card p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" [class]="iconBgClass()">
          <i [class]="'pi ' + icon() + ' text-white text-xl'"></i>
        </div>
        @if (trend()) {
          <div class="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full"
               [class]="trend()! > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'">
            <i [class]="trend()! > 0 ? 'pi pi-arrow-up text-xs' : 'pi pi-arrow-down text-xs'"></i>
            {{ trend()! > 0 ? '+' : '' }}{{ trend() }}%
          </div>
        }
      </div>
      <div class="space-y-1">
        <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ value() }}</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ label() }}</p>
      </div>
      @if (trendLabel()) {
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">{{ trendLabel() }}</p>
      }
    </div>
  `,
  styles: ``
})
export class StatCard {
  icon = input<string>('pi-chart-bar');
  label = input<string>('');
  value = input<string | number>('0');
  trend = input<number | null>(null);
  trendLabel = input<string>('');
  color = input<'primary' | 'success' | 'warning' | 'danger' | 'info'>('primary');

  iconBgClass = computed(() => {
    const map: Record<string, string> = {
      primary: 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30',
      success: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
      warning: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30',
      danger: 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30',
      info: 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/30',
    };
    return map[this.color()] || map['primary'];
  });
}
