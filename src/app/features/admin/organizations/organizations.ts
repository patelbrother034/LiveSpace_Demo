import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface Organization {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  subscriptionPlan: string;
  activeProperties: number;
  billingStatus: string;
}

@Component({
  selector: 'app-admin-organizations',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, DialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="SaaS Clients & Impersonation" subtitle="Inspect registered enterprise client accounts, manage structures, and impersonate owners" />

      <!-- Organizations Directory -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Organizations Directory</h4>
          <button pButton label="Provision New Org" icon="pi pi-plus" (click)="openProvisionDialog()"
            class="p-button-sm rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600 shadow-md">
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase font-bold text-[10px]">
                <th class="py-2.5">Organization</th>
                <th class="py-2.5">Owner details</th>
                <th class="py-2.5">SaaS Plan</th>
                <th class="py-2.5">Active Hubs</th>
                <th class="py-2.5">Billing Status</th>
                <th class="py-2.5 text-right font-bold">Administrative Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
              @for (org of organizations(); track org.id) {
                <tr>
                  <td class="py-3.5 font-bold text-slate-850 dark:text-white">{{ org.name }}</td>
                  <td class="py-3.5">
                    <p class="font-semibold text-slate-700 dark:text-slate-350">{{ org.ownerName }}</p>
                    <p class="text-[9.5px] text-slate-400 mt-0.5">{{ org.ownerEmail }}</p>
                  </td>
                  <td class="py-3.5 font-bold text-indigo-500">{{ org.subscriptionPlan }}</td>
                  <td class="py-3.5 font-semibold">{{ org.activeProperties }} Properties</td>
                  <td class="py-3.5">
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                      {{ org.billingStatus }}
                    </span>
                  </td>
                  <td class="py-3.5 text-right flex justify-end gap-2">
                    <button pButton label="Impersonate" icon="pi pi-user-plus" (click)="impersonateOwner(org)"
                      class="p-button-xs rounded-lg px-2.5 py-1 text-[10px] bg-amber-500 border-none text-white hover:bg-amber-600 shadow-sm shadow-amber-500/10">
                    </button>
                    <button pButton icon="pi pi-trash" (click)="deleteOrg(org.id)"
                      class="p-button-xs p-button-outlined rounded-lg text-red-500 border-slate-200 hover:bg-red-50 p-1"></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Provision Org Modal Dialog -->
      <p-dialog [(visible)]="provisionDialog" header="Provision New Enterprise Organization"
        [modal]="true" [style]="{width: '420px'}" styleClass="rounded-2xl dark:bg-slate-900">
        <div class="space-y-4 p-2 text-xs">
          
          <div class="space-y-1">
            <label class="font-bold text-slate-500 uppercase text-[9px]">Organization Name</label>
            <input type="text" [(ngModel)]="newOrgName" placeholder="e.g. Co-Living Nest"
              class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-500 uppercase text-[9px]">Owner Name</label>
            <input type="text" [(ngModel)]="newOrgOwner" placeholder="Full name of primary owner"
              class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-500 uppercase text-[9px]">Owner Email Address</label>
            <input type="email" [(ngModel)]="newOrgEmail" placeholder="owner@demo.com"
              class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-500 uppercase text-[9px]">Select Subscription Tier</label>
            <select [(ngModel)]="newOrgPlan"
              class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
              <option value="Starter">Starter Plan</option>
              <option value="Growth">Growth Plan</option>
              <option value="Enterprise">Enterprise Elite</option>
            </select>
          </div>

          <div class="flex gap-3 justify-end pt-3">
            <button pButton label="Cancel" class="p-button-text p-button-sm text-slate-500" (click)="provisionDialog = false"></button>
            <button pButton label="Provision Org" class="p-button-sm rounded-xl bg-indigo-500 border-none text-white" (click)="saveProvisionOrg()"></button>
          </div>

        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class AdminOrganizations implements OnInit {
  private router = inject(Router);
  private crudService = inject(CrudService);
  private authService = inject(AuthService);

  organizations = signal<Organization[]>([]);

  // Form Inputs
  provisionDialog = false;
  newOrgName = '';
  newOrgOwner = '';
  newOrgEmail = '';
  newOrgPlan = 'Starter';

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    const list = localStorage.getItem('lsp_saas_organizations');
    if (list) {
      this.organizations.set(JSON.parse(list));
    } else {
      const seed: Organization[] = [
        { id: 'org-1', name: 'LiveSpace Pro Premium', ownerName: 'Nikunj Bavishiya', ownerEmail: 'owner@demo.com', subscriptionPlan: 'Enterprise', activeProperties: 4, billingStatus: 'Paid' },
        { id: 'org-2', name: 'Apex Elite Holdings', ownerName: 'Vikram Singh', ownerEmail: 'enterprise@demo.com', subscriptionPlan: 'Growth', activeProperties: 2, billingStatus: 'Paid' }
      ];
      localStorage.setItem('lsp_saas_organizations', JSON.stringify(seed));
      this.organizations.set(seed);
    }
  }

  openProvisionDialog() {
    this.newOrgName = '';
    this.newOrgOwner = '';
    this.newOrgEmail = '';
    this.newOrgPlan = 'Starter';
    this.provisionDialog = true;
  }

  saveProvisionOrg() {
    if (!this.newOrgName || !this.newOrgOwner || !this.newOrgEmail) return;

    const newOrg: Organization = {
      id: 'org-' + Math.random().toString(36).substring(7),
      name: this.newOrgName,
      ownerName: this.newOrgOwner,
      ownerEmail: this.newOrgEmail,
      subscriptionPlan: this.newOrgPlan,
      activeProperties: 0,
      billingStatus: 'Paid'
    };

    const current = this.organizations();
    current.push(newOrg);
    localStorage.setItem('lsp_saas_organizations', JSON.stringify(current));
    this.organizations.set([...current]);

    this.provisionDialog = false;
    alert('Enterprise tenant provisioned successfully on global cloud nodes!');
  }

  deleteOrg(id: string) {
    if (!confirm('Are you sure you want to terminate this tenant organization contract? This cannot be undone.')) return;
    const current = this.organizations().filter(o => o.id !== id);
    localStorage.setItem('lsp_saas_organizations', JSON.stringify(current));
    this.organizations.set(current);
    alert('Organization terminated successfully.');
  }

  impersonateOwner(org: Organization) {
    // 1. Swaps active session details inside AuthService
    const success = this.authService.login(org.ownerEmail);
    if (success) {
      alert(`Administrative Access: Logging in as Owner '${org.ownerName}' of ${org.name}. Swapping UI viewport...`);
      // 2. Redirects directly to `/owner/dashboard`
      this.router.navigate(['/owner/dashboard']);
    } else {
      alert('Impersonation failed: Primary owner credentials mapping not found in user database.');
    }
  }
}
