import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail?: string;
  life?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(message: Omit<ToastMessage, 'id'>): void {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const toast: ToastMessage = {
      ...message,
      id,
      life: message.life || 3000
    };

    this.toasts.update(current => [...current, toast]);

    setTimeout(() => {
      this.clear(id);
    }, toast.life);
  }

  success(summary: string, detail?: string): void {
    this.show({ severity: 'success', summary, detail });
  }

  info(summary: string, detail?: string): void {
    this.show({ severity: 'info', summary, detail });
  }

  warn(summary: string, detail?: string): void {
    this.show({ severity: 'warn', summary, detail });
  }

  error(summary: string, detail?: string): void {
    this.show({ severity: 'error', summary, detail });
  }

  clear(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
