import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  imports: [],
  template: `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" [class]="badgeClass()">
      <span class="w-1.5 h-1.5 rounded-full" [class]="dotClass()"></span>
      {{ status() }}
    </span>
  `,
  styles: ``
})
export class StatusBadge {
  status = input<string>('');

  badgeClass = computed(() => {
    const s = this.status().toLowerCase();
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      occupied: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      vacant: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      reserved: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      maintenance: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
      paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      pending: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      overdue: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      partial: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      open: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      closed: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400',
      resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      blocked: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      notice: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return map[s] || 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400';
  });

  dotClass = computed(() => {
    const s = this.status().toLowerCase();
    const map: Record<string, string> = {
      active: 'bg-emerald-500', occupied: 'bg-amber-500', vacant: 'bg-blue-500',
      reserved: 'bg-purple-500', maintenance: 'bg-slate-400', paid: 'bg-emerald-500',
      pending: 'bg-yellow-500', overdue: 'bg-red-500', partial: 'bg-orange-500',
      open: 'bg-blue-500', closed: 'bg-slate-400', resolved: 'bg-emerald-500',
      blocked: 'bg-red-500', notice: 'bg-amber-500',
    };
    return map[s] || 'bg-slate-400';
  });
}
