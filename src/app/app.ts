import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly toastService = inject(ToastService);

  constructor() {
    // Globally override native window.alert with a premium theme-adaptive toast alert
    window.alert = (message: any) => {
      const msgStr = String(message);
      const lower = msgStr.toLowerCase();
      
      let severity: 'success' | 'info' | 'warn' | 'error' = 'info';
      let summary = 'Notification';
      
      if (
        lower.includes('success') ||
        lower.includes('successfully') ||
        lower.includes('done') ||
        lower.includes('renewed') ||
        lower.includes('settled') ||
        lower.includes('dispatched') ||
        lower.includes('logged')
      ) {
        severity = 'success';
        summary = 'Success';
      } else if (
        lower.includes('error') ||
        lower.includes('invalid') ||
        lower.includes('failed') ||
        lower.includes('exceeded')
      ) {
        severity = 'error';
        summary = 'Error';
      } else if (
        lower.includes('please') ||
        lower.includes('warning') ||
        lower.includes('mandatory') ||
        lower.includes('select') ||
        lower.includes('overdue')
      ) {
        severity = 'warn';
        summary = 'Warning';
      }
      
      this.toastService.show({
        severity,
        summary,
        detail: msgStr,
        life: 5000
      });
    };
  }
}
