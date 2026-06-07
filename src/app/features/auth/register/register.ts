import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

interface SubscriptionPlanCard {
  id: string;
  name: 'Starter' | 'Growth' | 'Enterprise';
  price: number;
  maxProperties: string;
  maxBeds: string;
  features: string[];
  gradient: string;
  badge?: string;
}

@Component({
  selector: 'app-register',
  imports: [ButtonModule, InputTextModule, PasswordModule, FormsModule, RouterLink],
  template: `
    <div class="glass-card p-8 shadow-2xl w-full max-w-2xl mx-auto backdrop-blur-md transition-all duration-300">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
          <i class="pi pi-briefcase text-white text-3xl"></i>
        </div>
        <h1 class="text-3xl font-extrabold bg-gradient-to-r from-primary-500 to-indigo-600 bg-clip-text text-transparent mb-2">
          Register Your Space
        </h1>
        <p class="text-slate-500 dark:text-slate-400">
          Set up your co-living organization and launch LiveSpace Pro
        </p>
      </div>

      <!-- Stepper Header -->
      <div class="flex items-center justify-center gap-4 mb-8">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                [class]="step() === 'details' ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">1</span>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Details</span>
        </div>
        <div class="w-12 h-[2px] bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                [class]="step() === 'plan' ? 'bg-primary-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'">2</span>
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">Choose Plan</span>
        </div>
      </div>

      @if (step() === 'details') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Organization Name</label>
            <input type="text" pInputText class="w-full" [(ngModel)]="orgName" placeholder="e.g. Sunrise CoLiving" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Administrator Name</label>
            <input type="text" pInputText class="w-full" [(ngModel)]="adminName" placeholder="e.g. Nikunj Bavishiya" />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contact Phone</label>
            <input type="text" pInputText class="w-full" [(ngModel)]="phone" placeholder="e.g. +91 98765 43210" />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <input type="email" pInputText class="w-full" [(ngModel)]="email" placeholder="e.g. admin@sunrise.com" />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <p-password [feedback]="true" styleClass="w-full" inputStyleClass="w-full" [(ngModel)]="password" placeholder="Create robust password"></p-password>
          </div>

          <div class="md:col-span-2 mt-4">
            <p-button label="Continue to Plans" styleClass="w-full" (onClick)="goToPlans()"></p-button>
          </div>
        </div>
      } @else if (step() === 'plan') {
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (plan of plans; track plan.id) {
              <div 
                (click)="selectedPlanId = plan.id"
                class="relative rounded-2xl border-2 p-5 cursor-pointer flex flex-col justify-between transition-all duration-300"
                [class]="selectedPlanId === plan.id ? 'border-primary-500 bg-primary-500/5 shadow-md shadow-primary-500/10' : 'border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 hover:border-slate-300'"
              >
                @if (plan.badge) {
                  <span class="absolute -top-3 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-indigo-600 shadow">
                    {{ plan.badge }}
                  </span>
                }
                
                <div>
                  <h3 class="font-bold text-slate-800 dark:text-white text-base">{{ plan.name }}</h3>
                  <div class="my-3">
                    <span class="text-2xl font-black text-slate-800 dark:text-white">₹{{ plan.price }}</span>
                    <span class="text-xs text-slate-400">/mo</span>
                  </div>
                  
                  <ul class="space-y-2 text-xs text-slate-500 dark:text-slate-400 mt-4 border-t border-slate-200/30 dark:border-slate-800/30 pt-4">
                    <li><i class="pi pi-check text-emerald-500 mr-2"></i>{{ plan.maxProperties }} Properties</li>
                    <li><i class="pi pi-check text-emerald-500 mr-2"></i>{{ plan.maxBeds }} Max Beds</li>
                    @for (feat of plan.features; track feat) {
                      <li><i class="pi pi-check text-emerald-500 mr-2"></i>{{ feat }}</li>
                    }
                  </ul>
                </div>
              </div>
            }
          </div>

          <div class="flex gap-4 mt-6">
            <p-button label="Back" severity="secondary" styleClass="w-full" (onClick)="step.set('details')"></p-button>
            <p-button label="Complete Registration" [loading]="loading()" styleClass="w-full" (onClick)="register()"></p-button>
          </div>
        </div>
      }

      <div class="mt-6 text-center">
        <span class="text-sm text-slate-500 dark:text-slate-400">Already have an account? </span>
        <a [routerLink]="['/auth/login']" class="text-sm font-semibold text-primary-600 hover:text-primary-500">Sign In</a>
      </div>
    </div>
  `,
  styles: ``
})
export class RegisterComponent {
  orgName = '';
  adminName = '';
  phone = '';
  email = '';
  password = '';
  selectedPlanId = 'plan-starter';

  step = signal<'details' | 'plan'>('details');
  loading = signal(false);

  private toast = inject(ToastService);
  private crud = inject(CrudService);
  private router = inject(Router);

  plans: SubscriptionPlanCard[] = [
    {
      id: 'plan-starter',
      name: 'Starter',
      price: 999,
      maxProperties: 'Up to 2',
      maxBeds: '50',
      features: ['Basic Seeding', 'Ticket Boards', 'Standard Invoicing'],
      gradient: 'from-indigo-500/10 to-indigo-600/10'
    },
    {
      id: 'plan-growth',
      name: 'Growth',
      price: 2499,
      maxProperties: 'Up to 10',
      maxBeds: '300',
      features: ['WhatsApp Alerts', 'KYC Verification', 'Staff Payroll'],
      gradient: 'from-purple-500/10 to-pink-600/10',
      badge: 'Popular'
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      price: 5999,
      maxProperties: 'Unlimited',
      maxBeds: 'Unlimited',
      features: ['AI Occupancy Predict', 'Smart Lock Integrations', 'Multi-Brand Admin'],
      gradient: 'from-amber-500/10 to-orange-600/10'
    }
  ];

  goToPlans() {
    if (!this.orgName || !this.adminName || !this.email || !this.password) {
      this.toast.error('Validation Error', 'Please complete all required fields.');
      return;
    }
    this.step.set('plan');
  }

  register() {
    this.loading.set(true);
    setTimeout(() => {
      try {
        const newOrg = {
          name: this.orgName,
          legalName: this.orgName + ' Pvt Ltd',
          contactPerson: this.adminName,
          phone: this.phone,
          email: this.email,
          subscriptionId: 'sub-' + this.selectedPlanId,
          status: 'Active',
          createdAt: new Date().toISOString(),
          settings: { allowLateFee: true, taxRate: 18 }
        };

        const org = this.crud.create<any>(StorageKeys.ORGANIZATIONS, newOrg);
        
        // Auto register admin user in db
        const newUser = {
          orgId: org.id,
          email: this.email,
          role: 'Owner',
          name: this.adminName,
          avatar: null,
          propertyAccess: []
        };
        this.crud.create<any>(StorageKeys.USERS, newUser);

        this.toast.success('Registration Complete', `Welcome ${this.adminName}! Organization registered successfully.`);
        this.router.navigate(['/auth/login']);
      } catch (err: any) {
        this.toast.error('Registration Failed', err.message || 'An error occurred.');
      } finally {
        this.loading.set(false);
      }
    }, 1500);
  }
}
