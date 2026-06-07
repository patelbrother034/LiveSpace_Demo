import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [],
  template: `
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="text-slate-500 dark:text-slate-400 mt-1">{{ subtitle() }}</p>
          }
        </div>
        <div class="flex items-center gap-3">
          <ng-content></ng-content>
        </div>
      </div>
      <div class="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
    </div>
  `,
  styles: ``
})
export class PageHeader {
  title = input.required<string>();
  subtitle = input<string>('');
}
