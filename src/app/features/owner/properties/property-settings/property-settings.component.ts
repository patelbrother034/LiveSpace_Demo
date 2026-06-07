import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-property-settings',
  standalone: true,
  imports: [FormsModule, PageHeader, ButtonModule, InputTextModule, ToggleSwitch, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Property Settings" subtitle="Manage amenities, rules, and pricing for this property">
        <button pButton label="Save Changes" icon="pi pi-check" class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white" (click)="saveSettings()"></button>
      </app-page-header>

      <!-- Amenities Management -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-star text-amber-500 mr-2"></i>Amenities</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          @for (amenity of amenities(); track amenity.name) {
            <div class="p-3 rounded-xl border-2 cursor-pointer transition-all text-center"
              [class]="amenity.enabled ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/30'"
              (click)="toggleAmenity(amenity.name)">
              <i [class]="amenity.icon" class="text-xl mb-2" [class.text-indigo-600]="amenity.enabled" [class.text-slate-400]="!amenity.enabled"></i>
              <p class="text-xs font-semibold" [class]="amenity.enabled ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500'">{{ amenity.name }}</p>
            </div>
          }
        </div>
      </div>

      <!-- Pricing Configuration -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-indian-rupee text-emerald-500 mr-2"></i>Room Pricing</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (price of pricing(); track price.type) {
            <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ price.type }} Room</p>
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400">₹</span>
                <input pInputText type="number" class="w-full rounded-lg text-sm" [(ngModel)]="price.baseRent" />
              </div>
              <p class="text-[10px] text-slate-400">per bed / month</p>
            </div>
          }
        </div>
      </div>

      <!-- House Rules -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-book text-blue-500 mr-2"></i>House Rules</h3>
        <div class="space-y-3">
          @for (rule of rules(); track rule.label) {
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30">
              <div class="flex items-center gap-3">
                <i [class]="rule.icon + ' text-slate-500'"></i>
                <div>
                  <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ rule.label }}</p>
                  <p class="text-xs text-slate-400">{{ rule.description }}</p>
                </div>
              </div>
              <p-toggleSwitch [(ngModel)]="rule.enabled" />
            </div>
          }
        </div>
      </div>

      <!-- Operational Settings -->
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white"><i class="pi pi-cog text-slate-500 mr-2"></i>Operational Settings</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Check-in Time</label>
            <input pInputText class="w-full rounded-lg" [(ngModel)]="settings.checkInTime" />
          </div>
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Check-out Time</label>
            <input pInputText class="w-full rounded-lg" [(ngModel)]="settings.checkOutTime" />
          </div>
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Security Deposit (months)</label>
            <input pInputText type="number" class="w-full rounded-lg" [(ngModel)]="settings.depositMonths" />
          </div>
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notice Period (days)</label>
            <input pInputText type="number" class="w-full rounded-lg" [(ngModel)]="settings.noticePeriodDays" />
          </div>
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Late Fee (%)</label>
            <input pInputText type="number" class="w-full rounded-lg" [(ngModel)]="settings.lateFeePercent" />
          </div>
          <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grace Period (days)</label>
            <input pInputText type="number" class="w-full rounded-lg" [(ngModel)]="settings.gracePeriodDays" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`]
})
export class PropertySettingsComponent {
  amenities = signal([
    { name: 'WiFi', icon: 'pi pi-wifi', enabled: true },
    { name: 'AC', icon: 'pi pi-sun', enabled: true },
    { name: 'Food', icon: 'pi pi-shopping-bag', enabled: true },
    { name: 'Laundry', icon: 'pi pi-sync', enabled: true },
    { name: 'Parking', icon: 'pi pi-car', enabled: true },
    { name: 'Gym', icon: 'pi pi-heart', enabled: false },
    { name: 'CCTV', icon: 'pi pi-video', enabled: true },
    { name: 'Power Backup', icon: 'pi pi-bolt', enabled: true },
    { name: 'Water Purifier', icon: 'pi pi-filter', enabled: true },
    { name: 'TV Lounge', icon: 'pi pi-desktop', enabled: false },
    { name: 'Library', icon: 'pi pi-book', enabled: false },
    { name: 'Coworking', icon: 'pi pi-briefcase', enabled: false },
  ]);

  pricing = signal([
    { type: 'Single', baseRent: 15000 },
    { type: 'Double', baseRent: 10000 },
    { type: 'Triple', baseRent: 8000 },
    { type: 'Dormitory', baseRent: 5000 },
  ]);

  rules = signal([
    { label: 'No Smoking', icon: 'pi pi-ban', description: 'Smoking prohibited inside premises', enabled: true },
    { label: 'No Alcohol', icon: 'pi pi-ban', description: 'Alcohol not allowed inside rooms', enabled: true },
    { label: 'Visitor Hours', icon: 'pi pi-clock', description: 'Visitors allowed 10 AM - 8 PM only', enabled: true },
    { label: 'Gate Closure', icon: 'pi pi-lock', description: 'Main gate locked after 11 PM', enabled: true },
    { label: 'Pets Allowed', icon: 'pi pi-heart', description: 'Small pets allowed with deposit', enabled: false },
    { label: 'Cooking Allowed', icon: 'pi pi-sun', description: 'Personal cooking in designated area', enabled: false },
  ]);

  settings = { checkInTime: '12:00 PM', checkOutTime: '11:00 AM', depositMonths: 2, noticePeriodDays: 30, lateFeePercent: 5, gracePeriodDays: 5 };

  toggleAmenity(name: string) { this.amenities.update(list => list.map(a => a.name === name ? { ...a, enabled: !a.enabled } : a)); }
  saveSettings() { /* Save to LocalStorage */ }
}
