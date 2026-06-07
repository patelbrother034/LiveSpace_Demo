import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterLink],
  template: `
    <div class="glass-card p-8 shadow-xl backdrop-blur-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
          <i class="pi pi-lock text-white text-3xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">Forgot Password</h1>
        <p class="text-slate-500 dark:text-slate-400">Recover access to your LiveSpace Pro workspace</p>
      </div>

      @if (step() === 'email') {
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enter Registered Email</label>
            <input type="email" pInputText class="w-full" [(ngModel)]="email" placeholder="owner@demo.com" />
          </div>

          <p-button label="Send OTP" styleClass="w-full mt-4" [loading]="loading()" (onClick)="sendOtp()"></p-button>
        </div>
      } @else if (step() === 'otp') {
        <div class="space-y-6">
          <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-sm text-emerald-600 dark:text-emerald-400">
            A 6-digit OTP has been sent to <strong>{{ email }}</strong>. (Use code: <strong>123456</strong>)
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enter 6-Digit OTP</label>
            <input type="text" pInputText class="w-full text-center text-xl font-bold tracking-widest" maxLength="6" [(ngModel)]="otpCode" placeholder="0 0 0 0 0 0" />
          </div>

          <p-button label="Verify OTP" styleClass="w-full mt-4" [loading]="loading()" (onClick)="verifyOtp()"></p-button>
          
          <div class="text-center">
            <button class="text-sm font-semibold text-primary-500 hover:text-primary-600" (click)="sendOtp()">Resend OTP</button>
          </div>
        </div>
      } @else if (step() === 'reset') {
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
            <p-password [feedback]="true" styleClass="w-full" inputStyleClass="w-full" [(ngModel)]="newPassword" placeholder="Enter new password"></p-password>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
            <p-password [feedback]="false" styleClass="w-full" inputStyleClass="w-full" [(ngModel)]="confirmPassword" placeholder="Confirm new password"></p-password>
          </div>

          <p-button label="Reset Password" styleClass="w-full mt-4" [loading]="loading()" (onClick)="resetPassword()"></p-button>
        </div>
      } @else if (step() === 'success') {
        <div class="text-center space-y-6">
          <div class="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full mx-auto flex items-center justify-center">
            <i class="pi pi-check text-2xl"></i>
          </div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Password Reset Successfully</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Your workspace password has been updated. You can now log in with your new credentials.</p>
          
          <p-button label="Back to Login" [routerLink]="['/auth/login']" styleClass="w-full mt-4"></p-button>
        </div>
      }

      @if (step() !== 'success') {
        <div class="mt-6 text-center">
          <a [routerLink]="['/auth/login']" class="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <i class="pi pi-arrow-left text-xs mr-2"></i> Back to login
          </a>
        </div>
      }
    </div>
  `,
  styles: ``
})
export class ForgotPasswordComponent {
  email = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';
  
  step = signal<'email' | 'otp' | 'reset' | 'success'>('email');
  loading = signal(false);

  private toast = inject(ToastService);

  sendOtp() {
    if (!this.email || !this.email.includes('@')) {
      this.toast.error('Validation Error', 'Please enter a valid email address.');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.step.set('otp');
      this.toast.success('OTP Sent', 'Simulated 6-digit OTP code sent.');
    }, 800);
  }

  verifyOtp() {
    if (this.otpCode !== '123456') {
      this.toast.error('Invalid OTP', 'The code you entered is invalid. Try 123456.');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.step.set('reset');
      this.toast.success('Verification Success', 'OTP verified successfully.');
    }, 600);
  }

  resetPassword() {
    if (!this.newPassword || this.newPassword.length < 4) {
      this.toast.error('Validation Error', 'Password must be at least 4 characters long.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toast.error('Validation Error', 'Passwords do not match.');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.step.set('success');
      this.toast.success('Success', 'Your password has been reset successfully.');
    }, 1000);
  }
}
