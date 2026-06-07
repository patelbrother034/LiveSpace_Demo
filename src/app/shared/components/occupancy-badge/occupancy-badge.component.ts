import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-occupancy-badge',
  standalone: true,
  template: `
    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" [class]="badgeClass()">
      <div class="relative w-4 h-4">
        <svg class="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" [attr.stroke-opacity]="0.2" />
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="dashOffset()"
            stroke-linecap="round" class="transition-all duration-700" />
        </svg>
      </div>
      {{ percent() }}%
      @if (showLabel()) {
        <span class="font-normal opacity-70">{{ label() }}</span>
      }
    </div>
  `,
  styles: [`:host { display: inline-flex; }`]
})
export class OccupancyBadgeComponent {
  occupied = input(0);
  total = input(0);
  label = input('occupancy');
  showLabel = input(true);

  circumference = 2 * Math.PI * 6; // ~37.7

  percent = computed(() => {
    const t = this.total();
    return t ? Math.round((this.occupied() / t) * 100) : 0;
  });

  dashOffset = computed(() => {
    const p = this.percent();
    return this.circumference - (this.circumference * p) / 100;
  });

  badgeClass = computed(() => {
    const p = this.percent();
    if (p >= 85) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (p >= 60) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    if (p >= 40) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  });
}
