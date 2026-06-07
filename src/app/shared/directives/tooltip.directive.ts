import { Directive, ElementRef, Input, HostListener, OnDestroy, inject } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  private el = inject(ElementRef);

  @Input('appTooltip') tooltipText = '';

  private tooltipEl: HTMLDivElement | null = null;

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.tooltipText) return;
    this.createTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.removeTooltip();
  }

  private createTooltip() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'fixed z-[9999] px-2.5 py-1 text-xs font-semibold text-white bg-slate-900/90 dark:bg-slate-800/95 rounded-lg shadow-md border border-slate-700/30 backdrop-blur pointer-events-none transition-all duration-200';
    this.tooltipEl.textContent = this.tooltipText;
    document.body.appendChild(this.tooltipEl);

    // Calculate position
    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipEl.getBoundingClientRect();

    const top = hostRect.top - tooltipRect.height - 8;
    const left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;

    this.tooltipEl.style.top = `${top}px`;
    this.tooltipEl.style.left = `${left}px`;
  }

  private removeTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
  }

  ngOnDestroy() {
    this.removeTooltip();
  }
}
