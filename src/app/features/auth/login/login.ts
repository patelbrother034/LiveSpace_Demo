import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ButtonModule, InputTextModule, CheckboxModule, PasswordModule, FormsModule, RouterLink],
  template: `
    <div class="glass-card p-8 shadow-xl">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
          <i class="pi pi-building text-white text-3xl"></i>
        </div>
        <h1 class="text-3xl font-bold text-slate-800 dark:text-white mb-2">LiveSpace Pro</h1>
        <p class="text-slate-500 dark:text-slate-400">Sign in to manage your properties</p>
      </div>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
          <input type="email" pInputText class="w-full" [(ngModel)]="email" placeholder="owner@demo.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
          <p-password [feedback]="false" styleClass="w-full" inputStyleClass="w-full" [(ngModel)]="password"></p-password>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <p-checkbox [binary]="true" inputId="remember"></p-checkbox>
            <label for="remember" class="ml-2 text-sm text-slate-600 dark:text-slate-400">Remember me</label>
          </div>
          <a [routerLink]="['/auth/forgot-password']" class="text-sm font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
        </div>

        <p-button label="Sign In" styleClass="w-full mt-4" (onClick)="login()"></p-button>
        
        <div class="mt-4 text-center flex flex-col gap-2">
          <p-button label="Quick Bypass (Demo)" severity="secondary" variant="text" size="small" (onClick)="bypassLogin()"></p-button>
          
          <div class="text-sm text-slate-500 mt-2">
            New co-living organization? 
            <a [routerLink]="['/auth/register']" class="font-semibold text-primary-600 hover:text-primary-500">Register Space</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class LoginComponent {
  email = 'owner@demo.com';
  password = 'demo';
  
  private router = inject(Router);
  private auth = inject(AuthService);

  login() {
    this.bypassLogin();
  }

  bypassLogin() {
    // Force a dummy user session to bypass the guard for demo
    const dummyUser = { id: 'user-owner-001', email: 'owner@demo.com', role: 'Owner', name: 'Nikunj Bavishiya' };
    this.auth.currentUser.set(dummyUser as any);
    sessionStorage.setItem('lsp_session_user', JSON.stringify(dummyUser));
    
    // Navigate to the owner dashboard
    this.router.navigate(['/owner/dashboard']);
  }
}
