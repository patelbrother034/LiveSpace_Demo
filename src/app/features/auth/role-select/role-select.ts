import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/enums/user-role.enum';
import { ButtonModule } from 'primeng/button';

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: string;
  colorClass: string;
  bgGradient: string;
  route: string;
}

@Component({
  selector: 'app-role-select',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="glass-card p-8 shadow-2xl w-full max-w-4xl mx-auto backdrop-blur-md transition-all duration-300">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent mb-2">
          Select Your Workspace
        </h1>
        <p class="text-slate-500 dark:text-slate-400">
          Choose a role to access your personalized LiveSpace Pro dashboard
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        @for (opt of roleOptions; track opt.role) {
          <div 
            (click)="selectRole(opt)"
            class="group relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <!-- Ambient hover glow -->
            <div class="absolute inset-0 -z-10 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" [class]="opt.bgGradient"></div>
            
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-110 transition-transform duration-300" [class]="opt.colorClass">
                  <i class="pi {{ opt.icon }} text-xl"></i>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {{ opt.role }}
                </span>
              </div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                {{ opt.title }}
              </h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                {{ opt.description }}
              </p>
            </div>

            <div class="flex items-center text-sm font-semibold text-primary-500 group-hover:translate-x-1 transition-transform">
              Enter Dashboard <i class="pi pi-arrow-right ml-2 text-xs"></i>
            </div>
          </div>
        }
      </div>

      <div class="text-center pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <button 
          pButton 
          label="Back to Sign In" 
          icon="pi pi-arrow-left" 
          class="p-button-text p-button-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" 
          (click)="backToLogin()"
        ></button>
      </div>
    </div>
  `,
  styles: []
})
export class RoleSelect {
  private router = inject(Router);
  private auth = inject(AuthService);

  roleOptions: RoleOption[] = [
    {
      role: UserRole.Owner,
      title: 'Property Owner',
      description: 'Manage properties, buildings, view unified financial graphs, and analyze performance.',
      icon: 'pi-chart-bar',
      colorClass: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      bgGradient: 'from-indigo-500/20 to-purple-600/20',
      route: '/owner/dashboard'
    },
    {
      role: UserRole.Warden,
      title: 'Hostel Warden',
      description: 'Track student attendance, allocate rooms, handle daily gate passes, and enforce discipline.',
      icon: 'pi-users',
      colorClass: 'bg-gradient-to-br from-amber-500 to-orange-600',
      bgGradient: 'from-amber-500/20 to-orange-600/20',
      route: '/warden/dashboard'
    },
    {
      role: UserRole.Caretaker,
      title: 'Property Caretaker',
      description: 'Monitor building maintenance, update utility status, and resolve tenant support tickets.',
      icon: 'pi-wrench',
      colorClass: 'bg-gradient-to-br from-cyan-500 to-teal-600',
      bgGradient: 'from-cyan-500/20 to-teal-600/20',
      route: '/caretaker/dashboard'
    },
    {
      role: UserRole.Accountant,
      title: 'Financial Accountant',
      description: 'Record rent receipts, issue tax invoices, process expenses, and audit financial ledgers.',
      icon: 'pi-money-bill',
      colorClass: 'bg-gradient-to-br from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-500/20 to-green-600/20',
      route: '/accountant/dashboard'
    },
    {
      role: UserRole.Tenant,
      title: 'Resident Tenant',
      description: 'Pay monthly dues, log complaints, request visitor passes, and access property alerts.',
      icon: 'pi-home',
      colorClass: 'bg-gradient-to-br from-pink-500 to-rose-600',
      bgGradient: 'from-pink-500/20 to-rose-600/20',
      route: '/tenant/dashboard'
    },
    {
      role: UserRole.Parent,
      title: 'Guardian Parent',
      description: 'View ward billing details, pay security deposit dues, and approve gate passes.',
      icon: 'pi-shield',
      colorClass: 'bg-gradient-to-br from-blue-500 to-sky-600',
      bgGradient: 'from-blue-500/20 to-sky-600/20',
      route: '/parent/dashboard'
    }
  ];

  selectRole(option: RoleOption) {
    // Mock user matching this role for demo purposes
    const dummyUser = {
      id: `user-${option.role.toLowerCase()}-001`,
      email: `${option.role.toLowerCase()}@demo.com`,
      role: option.role,
      name: `Demo ${option.title}`
    };
    
    this.auth.currentUser.set(dummyUser as any);
    sessionStorage.setItem('lsp_session_user', JSON.stringify(dummyUser));
    
    // Navigate to their respective feature dashboard
    this.router.navigate([option.route]);
  }

  backToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
