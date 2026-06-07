import { Directive, ElementRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';

@Directive({
  selector: '[appSkeleton]',
  standalone: true
})
export class SkeletonDirective implements OnChanges {
  private el = inject(ElementRef);

  @Input() appSkeleton = false;
  @Input() skeletonClass = 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded';

  private originalClasses: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appSkeleton']) {
      const loading = changes['appSkeleton'].currentValue;
      const native = this.el.nativeElement;

      if (loading) {
        // Capture original classes once
        if (this.originalClasses.length === 0) {
          this.originalClasses = Array.from(native.classList);
        }
        
        // Remove styling class to prevent overlap and insert skeleton classes
        native.className = '';
        const skeletonList = this.skeletonClass.split(' ');
        skeletonList.forEach(cls => native.classList.add(cls));
        native.style.pointerEvents = 'none';
        
        // Block text rendering
        native.style.color = 'transparent';
      } else {
        // Restore original styles
        native.className = '';
        this.originalClasses.forEach(cls => native.classList.add(cls));
        native.style.pointerEvents = '';
        native.style.color = '';
      }
    }
  }
}
