import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[currencyFormat]',
  standalone: true
})
export class CurrencyFormatDirective {
  private el = inject(ElementRef);

  @HostListener('focus')
  onFocus() {
    const value = this.el.nativeElement.value || '';
    // Strip ₹ symbol and commas on focus for raw numeric input editing
    this.el.nativeElement.value = value.replace(/[₹,\s]/g, '');
  }

  @HostListener('blur')
  onBlur() {
    const value = this.el.nativeElement.value || '';
    this.el.nativeElement.value = this.format(value);
  }

  private format(val: string): string {
    if (!val) return '';
    const numeric = parseFloat(val.replace(/[^\d.]/g, ''));
    if (isNaN(numeric)) return '';
    
    // Format to Indian system (₹ XX,XX,XXX.XX)
    return '₹ ' + numeric.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    });
  }
}
