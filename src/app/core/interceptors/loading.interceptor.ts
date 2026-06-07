import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeRequests = signal(0);
  isLoading = signal(false);

  show(): void {
    this.activeRequests.update(v => v + 1);
    this.isLoading.set(true);
  }

  hide(): void {
    this.activeRequests.update(v => Math.max(0, v - 1));
    if (this.activeRequests() === 0) {
      this.isLoading.set(false);
    }
  }
}

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  
  // Skip loading indicator for background/silent requests if necessary
  if (req.headers.has('X-Skip-Loading')) {
    return next(req);
  }

  loading.show();
  return next(req).pipe(
    finalize(() => {
      loading.hide();
    })
  );
};
