import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, Avatar, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Settings" subtitle="Manage your profile, PG branding, notifications, and subscription"></app-page-header>

      <!-- Section 1: Profile Settings -->
      <div class="glass-card p-6 rounded-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-user text-indigo-500"></i> Profile Settings
          </h3>
          <button pButton [label]="editMode() ? 'Cancel' : 'Edit'" [icon]="editMode() ? 'pi pi-times' : 'pi pi-pencil'"
            class="p-button-sm p-button-text rounded-xl text-indigo-500 dark:text-indigo-400 font-semibold"
            (click)="editMode.set(!editMode())"></button>
        </div>

        <div class="flex flex-col sm:flex-row gap-8">
          <!-- Avatar Column -->
          <div class="flex flex-col items-center gap-3 shrink-0">
            <app-avatar [name]="profileName()" size="xl" />
            <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ profileName() }}</p>
            <span class="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              {{ profileRole() }}
            </span>
          </div>

          <!-- Fields -->
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
              <input pInputText [value]="profileName()" [readonly]="!editMode()"
                class="w-full rounded-xl bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
              <input pInputText [value]="profileEmail()" [readonly]="!editMode()"
                class="w-full rounded-xl bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Phone</label>
              <input pInputText [value]="profilePhone()" [readonly]="!editMode()"
                class="w-full rounded-xl bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</label>
              <input pInputText [value]="profileRole()" readonly
                class="w-full rounded-xl bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
            </div>
          </div>
        </div>

        @if (editMode()) {
          <div class="flex justify-end mt-6">
            <button pButton label="Save Changes" icon="pi pi-check"
              class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90"
              (click)="saveProfile()"></button>
          </div>
        }
      </div>

      <!-- Section 2: PG Branding -->
      <div class="glass-card p-6 rounded-2xl">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
          <i class="pi pi-palette text-violet-500"></i> PG Branding
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization Name</label>
            <input pInputText [value]="orgName()" (input)="orgName.set($any($event.target).value)"
              class="w-full rounded-xl bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tagline</label>
            <input pInputText [value]="orgTagline()" (input)="orgTagline.set($any($event.target).value)"
              class="w-full rounded-xl bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white" />
          </div>
        </div>

        <div class="mb-6">
          <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Color Theme</label>
          <div class="flex gap-4">
            @for (theme of colorThemes; track theme.name) {
              <button class="group flex flex-col items-center gap-2 cursor-pointer" (click)="selectedTheme.set(theme.name)">
                <div class="w-12 h-12 rounded-full border-4 transition-all duration-200 shadow-md hover:scale-110"
                     [class]="selectedTheme() === theme.name ? theme.borderActive : 'border-transparent'"
                     [style.background]="theme.gradient">
                  @if (selectedTheme() === theme.name) {
                    <div class="w-full h-full flex items-center justify-center">
                      <i class="pi pi-check text-white text-sm drop-shadow"></i>
                    </div>
                  }
                </div>
                <span class="text-[11px] font-semibold" [class]="selectedTheme() === theme.name ? 'text-slate-800 dark:text-white' : 'text-slate-400'">{{ theme.name }}</span>
              </button>
            }
          </div>
        </div>

        <div class="mb-6">
          <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 block">Logo</label>
          <div class="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-all">
            <i class="pi pi-cloud-upload text-2xl text-slate-400 dark:text-slate-500"></i>
            <p class="text-xs text-slate-400 dark:text-slate-500">Click to upload logo (PNG, JPG — max 2MB)</p>
          </div>
        </div>

        <div class="flex justify-end">
          <button pButton label="Save Branding" icon="pi pi-save"
            class="p-button-sm rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 border-none text-white hover:opacity-90"
            (click)="saveBranding()"></button>
        </div>
      </div>

      <!-- Section 3: Notification Preferences -->
      <div class="glass-card p-6 rounded-2xl">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
          <i class="pi pi-bell text-amber-500"></i> Notification Preferences
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          @for (pref of notificationPrefs; track pref.key) {
            <label class="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-900/30 cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-all group">
              <div class="relative w-11 h-6 shrink-0">
                <input type="checkbox" [checked]="pref.enabled" (change)="pref.enabled = !pref.enabled"
                  class="sr-only peer" />
                <div class="w-full h-full bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 transition-all duration-200"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 peer-checked:translate-x-5"></div>
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ pref.label }}</p>
                <p class="text-[10px] text-slate-400 dark:text-slate-500">{{ pref.description }}</p>
              </div>
            </label>
          }
        </div>

        <div class="flex justify-end">
          <button pButton label="Save Preferences" icon="pi pi-check"
            class="p-button-sm rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 border-none text-white hover:opacity-90"
            (click)="saveNotifications()"></button>
        </div>
      </div>

      <!-- Section 4: Subscription & Billing -->
      <div class="glass-card p-6 rounded-2xl">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
          <i class="pi pi-credit-card text-emerald-500"></i> Subscription & Billing
        </h3>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Current Plan -->
          <div class="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
            <div class="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
            <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full"></div>
            <div class="relative z-10">
              <div class="flex items-center gap-2 mb-4">
                <span class="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Current Plan</span>
                <span class="text-xs font-bold uppercase tracking-wider bg-emerald-400/30 px-3 py-1 rounded-full">Active</span>
              </div>
              <h4 class="text-3xl font-black mb-1">Pro</h4>
              <p class="text-xl font-bold text-white/90 mb-4">₹2,499<span class="text-sm font-normal text-white/60">/month</span></p>
              <div class="flex items-center gap-2 text-sm text-white/70">
                <i class="pi pi-calendar text-xs"></i>
                <span>Next billing: July 13, 2026</span>
              </div>
            </div>
          </div>

          <!-- Features -->
          <div class="space-y-3">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Plan Features</p>
            @for (feature of planFeatures; track feature) {
              <div class="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <div class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
                  <i class="pi pi-check text-emerald-600 dark:text-emerald-400 text-[10px]"></i>
                </div>
                <span>{{ feature }}</span>
              </div>
            }
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button pButton label="Upgrade to Enterprise" icon="pi pi-arrow-up-right"
            class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white hover:opacity-90"
            (click)="upgradeAlert()"></button>
          <button pButton label="View Billing History" icon="pi pi-history"
            class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-600 dark:text-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            (click)="billingAlert()"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  editMode = signal(false);
  profileName = signal('LiveSpace Owner');
  profileEmail = signal('owner@livespace.in');
  profilePhone = signal('+91 98765 43210');
  profileRole = signal('Owner');

  orgName = signal('LiveSpace Pro');
  orgTagline = signal('Premium Co-Living Management');
  selectedTheme = signal('Indigo');

  colorThemes = [
    { name: 'Indigo', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderActive: 'border-indigo-400 dark:border-indigo-500' },
    { name: 'Emerald', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)', borderActive: 'border-emerald-400 dark:border-emerald-500' },
    { name: 'Rose', gradient: 'linear-gradient(135deg, #f43f5e, #ec4899)', borderActive: 'border-rose-400 dark:border-rose-500' }
  ];

  notificationPrefs = [
    { key: 'email', label: 'Email Notifications', description: 'Receive updates via email', enabled: true },
    { key: 'sms', label: 'SMS Notifications', description: 'Get SMS alerts on your phone', enabled: true },
    { key: 'payment', label: 'Payment Alerts', description: 'Rent and payment notifications', enabled: true },
    { key: 'maintenance', label: 'Maintenance Alerts', description: 'Ticket creation and updates', enabled: true },
    { key: 'tenant', label: 'New Tenant Alerts', description: 'Check-in and onboarding updates', enabled: true },
    { key: 'reports', label: 'Monthly Reports', description: 'Auto-generated monthly summaries', enabled: true }
  ];

  planFeatures = [
    'Unlimited Properties & Rooms',
    'Advanced Financial Analytics',
    'AI-Powered Occupancy Insights',
    'Automated Rent Collection',
    'Maintenance Ticket System',
    'Multi-role Access Control',
    'Priority Email & Chat Support',
    'Custom Reports & Exports'
  ];

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileName.set(user.name || 'LiveSpace Owner');
      this.profileEmail.set(user.email || 'owner@livespace.in');
      this.profilePhone.set((user as any).phone || '+91 98765 43210');
      this.profileRole.set(user.role || 'Owner');
    }
    
    // Load current color theme from service
    this.selectedTheme.set(this.themeService.currentColorTheme());
  }

  saveProfile() {
    alert('Profile updated successfully!');
    this.editMode.set(false);
  }

  saveBranding() {
    // Apply selected theme
    this.themeService.setColorTheme(this.selectedTheme());
    alert('Branding settings saved successfully!');
  }

  saveNotifications() {
    alert('Notification preferences saved successfully!');
  }

  upgradeAlert() {
    alert('Upgrade to Enterprise — feature coming soon!');
  }

  billingAlert() {
    alert('View Billing History — feature coming soon!');
  }
}
