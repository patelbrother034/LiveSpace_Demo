import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  template: `
    <button (click)="theme.toggleTheme()"
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
      @if (theme.currentTheme() === 'light') {
        <i class="pi pi-moon text-lg transition-transform duration-500 hover:rotate-12"></i>
      } @else {
        <i class="pi pi-sun text-lg transition-transform duration-500 hover:rotate-45"></i>
      }
    </button>
  `,
  styles: ``
})
export class ThemeToggle {
  theme = inject(ThemeService);
}
