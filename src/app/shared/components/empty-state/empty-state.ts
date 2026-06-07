import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  imports: [ButtonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
        <i [class]="'pi ' + icon() + ' text-3xl text-slate-400 dark:text-slate-500'"></i>
      </div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{{ title() }}</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{{ message() }}</p>
      @if (actionLabel()) {
        <p-button [label]="actionLabel()" icon="pi pi-plus" (onClick)="actionClick.emit()" severity="primary" [rounded]="true"></p-button>
      }
    </div>
  `,
  styles: ``
})
export class EmptyState {
  icon = input<string>('pi-inbox');
  title = input<string>('No data found');
  message = input<string>('There is nothing to display here yet.');
  actionLabel = input<string>('');
  actionClick = output<void>();
}
