import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaymentModalService {
  isOpen = signal(false);
  private _tenants: any[] = [];
  private _submitFn: ((data: any) => void) | null = null;

  get tenants(): any[] { return this._tenants; }

  open(tenants: any[], submitFn: (data: any) => void) {
    this._tenants = tenants;
    this._submitFn = submitFn;
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  submit(data: any) {
    this._submitFn?.(data);
    this.close();
  }
}
