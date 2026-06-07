import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-avatar',
  imports: [],
  template: `
    <div class="relative inline-flex">
      @if (imageUrl()) {
        <img [src]="imageUrl()" [alt]="name()" class="rounded-full object-cover" [class]="sizeClass()" />
      } @else {
        <div class="rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-indigo-500 to-purple-600" [class]="sizeClass()">
          {{ initials() }}
        </div>
      }
      @if (online()) {
        <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
      }
    </div>
  `,
  styles: ``
})
export class Avatar {
  name = input<string>('');
  imageUrl = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  online = input<boolean>(false);

  initials = computed(() => {
    const parts = this.name().trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.[0]?.toUpperCase() || '?';
  });

  sizeClass = computed(() => {
    const map: Record<string, string> = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-14 h-14 text-base',
      xl: 'w-20 h-20 text-xl',
    };
    return map[this.size()];
  });
}
