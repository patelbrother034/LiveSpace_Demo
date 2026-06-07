import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ButtonModule } from 'primeng/button';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-gate-pass',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatusBadge, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Gate Pass" subtitle="Request and manage your gate passes">
        <button pButton label="Apply for Pass" icon="pi pi-plus" (click)="showModal.set(true)"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90"></button>
      </app-page-header>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        @for (stat of stats(); track stat.label) {
          <div class="glass-card p-4 text-center">
            <p class="text-2xl font-bold" [class]="stat.colorClass">{{ stat.count }}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ stat.label }}</p>
          </div>
        }
      </div>

      <!-- Gate Passes Table -->
      <div class="glass-card p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-id-card text-indigo-500"></i> My Gate Passes
          </h3>
          <span class="text-xs text-slate-400">{{ gatePasses().length }} passes</span>
        </div>

        @if (gatePasses().length === 0) {
          <div class="flex flex-col items-center py-12 text-center">
            <i class="pi pi-id-card text-4xl text-slate-300 dark:text-slate-600 mb-3"></i>
            <p class="text-sm text-slate-400">No gate passes yet</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700">
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Type</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Destination</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Requested</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3 pr-4">Return Time</th>
                  <th class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                @for (pass of gatePasses(); track pass.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="py-3.5 pr-4">
                      <span class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-white">
                        <i [class]="getTypeIcon(pass.type) + ' text-indigo-500 text-xs'"></i>
                        {{ pass.type }}
                      </span>
                    </td>
                    <td class="py-3.5 pr-4 text-sm text-slate-700 dark:text-slate-300">{{ pass.destination || '—' }}</td>
                    <td class="py-3.5 pr-4 text-sm text-slate-500 dark:text-slate-400">{{ pass.requestedAt || pass.createdAt || '—' }}</td>
                    <td class="py-3.5 pr-4 text-sm text-slate-500 dark:text-slate-400">{{ pass.returnTime || pass.expectedReturn || '—' }}</td>
                    <td class="py-3.5"><app-status-badge [status]="pass.status" /></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Apply Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" (click)="showModal.set(false)">
          <div class="glass-card p-8 max-w-md w-full" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-bold text-slate-800 dark:text-white">Apply for Gate Pass</h3>
              <button pButton icon="pi pi-times" (click)="showModal.set(false)"
                class="p-button-text p-button-rounded p-button-secondary"></button>
            </div>

            <div class="space-y-5">
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Type</label>
                <select [(ngModel)]="newPass.type"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all">
                  <option value="Day Out">Day Out</option>
                  <option value="Overnight">Overnight</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Destination</label>
                <input type="text" [(ngModel)]="newPass.destination" placeholder="Where are you going?"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expected Return</label>
                <input type="date" [(ngModel)]="newPass.returnTime"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reason</label>
                <input type="text" [(ngModel)]="newPass.reason" placeholder="Reason for the pass"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all" />
              </div>

              <button pButton label="Submit Request" icon="pi pi-check" (click)="submitPass()"
                class="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90 mt-2"></button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class GatePassComponent implements OnInit {
  private crudService = inject(CrudService);

  gatePasses = signal<any[]>([]);
  showModal = signal(false);
  stats = signal<{ label: string; count: number; colorClass: string }[]>([]);
  tenantId = '';
  propertyId = '';

  newPass = { type: 'Day Out', destination: '', returnTime: '', reason: '' };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const me = tenants.find((t: any) => t.status === 'Active') || tenants[0];
    if (!me) return;

    this.tenantId = me.id;
    this.propertyId = me.propertyId;

    const passes = this.crudService.getAll<any>(StorageKeys.GATE_PASSES)
      .filter((gp: any) => gp.tenantId === me.id)
      .sort((a: any, b: any) => (b.requestedAt || b.createdAt || '').localeCompare(a.requestedAt || a.createdAt || ''));
    this.gatePasses.set(passes);

    this.stats.set([
      { label: 'Total', count: passes.length, colorClass: 'text-slate-800 dark:text-white' },
      { label: 'Pending', count: passes.filter((p: any) => p.status === 'Pending').length, colorClass: 'text-amber-500' },
      { label: 'Approved', count: passes.filter((p: any) => p.status === 'Approved').length, colorClass: 'text-emerald-500' },
      { label: 'Rejected', count: passes.filter((p: any) => p.status === 'Rejected').length, colorClass: 'text-red-500' },
    ]);
  }

  submitPass() {
    if (!this.newPass.destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    const pass = {
      id: 'gp-' + Date.now(),
      tenantId: this.tenantId,
      propertyId: this.propertyId,
      type: this.newPass.type,
      destination: this.newPass.destination,
      returnTime: this.newPass.returnTime,
      reason: this.newPass.reason,
      status: 'Pending',
      requestedAt: new Date().toISOString().split('T')[0]
    };

    this.crudService.create(StorageKeys.GATE_PASSES, pass as any);
    this.newPass = { type: 'Day Out', destination: '', returnTime: '', reason: '' };
    this.showModal.set(false);
    this.loadData();
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      'Day Out': 'pi pi-sun',
      'Overnight': 'pi pi-moon',
      'Emergency': 'pi pi-exclamation-triangle',
    };
    return map[type] || 'pi pi-id-card';
  }
}
