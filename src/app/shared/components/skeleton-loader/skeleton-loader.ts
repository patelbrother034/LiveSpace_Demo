import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  imports: [],
  template: `
    @for (item of items(); track $index) {
      @switch (variant()) {
        @case ('card') {
          <div class="glass-card p-5 animate-pulse">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700"></div>
              <div class="w-16 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div class="space-y-2">
              <div class="h-6 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
              <div class="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
          </div>
        }
        @case ('table-row') {
          <div class="flex items-center gap-4 p-4 animate-pulse">
            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
              <div class="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div class="w-20 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
          </div>
        }
        @case ('avatar') {
          <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        }
        @default {
          <div class="space-y-2 animate-pulse p-2">
            <div class="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
          </div>
        }
      }
    }
  `,
  styles: ``
})
export class SkeletonLoader {
  variant = input<'card' | 'table-row' | 'text' | 'avatar'>('text');
  count = input<number>(3);

  items = computed(() => Array.from({ length: this.count() }));
}
