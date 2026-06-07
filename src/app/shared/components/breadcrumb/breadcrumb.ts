import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav class="flex items-center gap-2 text-sm">
      <a routerLink="/" class="text-slate-400 hover:text-indigo-500 transition-colors">
        <i class="pi pi-home text-xs"></i>
      </a>
      @for (item of items(); track $index) {
        <i class="pi pi-chevron-right text-[10px] text-slate-300 dark:text-slate-600"></i>
        @if ($last) {
          <span class="text-slate-700 dark:text-slate-300 font-medium">{{ item.label }}</span>
        } @else {
          <a [routerLink]="item.routerLink" class="text-slate-400 hover:text-indigo-500 transition-colors">{{ item.label }}</a>
        }
      }
    </nav>
  `,
  styles: ``
})
export class Breadcrumb {
  items = input<{ label: string; routerLink?: string }[]>([]);
}
