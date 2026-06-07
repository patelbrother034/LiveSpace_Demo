import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[animateOnScroll]',
  standalone: true
})
export class AnimateOnScrollDirective implements OnInit {
  private el = inject(ElementRef);

  @Input() animationClass = 'fade-in-up';
  @Input() threshold = 0.1;

  ngOnInit(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    // Set initial transparent/hidden states
    this.el.nativeElement.style.opacity = '0';
    this.el.nativeElement.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.el.nativeElement.style.opacity = '1';
            this.el.nativeElement.classList.add(this.animationClass);
            observer.unobserve(this.el.nativeElement); // Trigger once only
          }
        });
      },
      { threshold: this.threshold }
    );

    observer.observe(this.el.nativeElement);
  }
}
