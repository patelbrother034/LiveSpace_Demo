import { Component, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

interface BedItem { id: string; label: string; status: string; tenantName?: string; }

@Component({
  selector: 'app-bed-grid',
  standalone: true,
  imports: [TooltipModule],
  template: `
    <div class="grid gap-2" [class]="gridClass()">
      @for (bed of beds(); track bed.id) {
        <div class="aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all text-center p-1"
          [class]="getStatusClass(bed.status)"
          [pTooltip]="bed.tenantName || bed.status" tooltipPosition="top"
          (click)="onBedClick.emit(bed)">
          <i [class]="getIcon(bed.status)" class="text-sm mb-0.5"></i>
          <span class="text-[9px] font-bold leading-tight">{{ bed.label }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class BedGridComponent {
  beds = input<BedItem[]>([]);
  columns = input(6);
  onBedClick = new (class extends EventTarget { emit(bed: BedItem) { this.dispatchEvent(new CustomEvent('click', { detail: bed })); } });

  gridClass(): string {
    const cols = this.columns();
    return `grid-cols-${cols}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Occupied': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case 'Vacant': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'Reserved': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'Notice': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'Maintenance': return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      default: return 'bg-slate-50 text-slate-400 border border-slate-200';
    }
  }

  getIcon(status: string): string {
    switch (status) {
      case 'Occupied': return 'pi pi-user';
      case 'Vacant': return 'pi pi-minus';
      case 'Reserved': return 'pi pi-bookmark';
      case 'Notice': return 'pi pi-exclamation-triangle';
      case 'Maintenance': return 'pi pi-wrench';
      default: return 'pi pi-circle';
    }
  }
}
