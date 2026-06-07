import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface AuditLog { id: string; timestamp: string; user: string; action: string; resource: string; ip: string; severity: string; }

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Audit Logs" subtitle="Searchable audit trail of all platform activity" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Events Today</p><p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{{ logs().length }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Critical</p><p class="text-xl font-extrabold text-red-500 mt-1">{{ criticalCount() }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Users Active</p><p class="text-xl font-extrabold text-emerald-600 mt-1">8</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">System Events</p><p class="text-xl font-extrabold text-blue-600 mt-1">{{ systemCount() }}</p></div>
      </div>
      <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-[200px]"><i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i><input pInputText placeholder="Search logs..." class="w-full !pl-9 rounded-xl text-sm" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" /></div>
        <select class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" [ngModel]="filterSeverity()" (ngModelChange)="filterSeverity.set($event)">
          <option value="">All Severity</option><option>Info</option><option>Warning</option><option>Critical</option>
        </select>
      </div>
      <div class="glass-card overflow-hidden"><div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
            <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Timestamp</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">User</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Action</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Resource</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">IP</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Severity</th>
          </tr></thead>
          <tbody>
            @for (l of filtered(); track l.id) {
              <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="p-3 font-mono text-xs text-slate-500">{{ l.timestamp }}</td>
                <td class="p-3 font-medium text-slate-800 dark:text-white">{{ l.user }}</td>
                <td class="p-3 text-slate-700 dark:text-slate-300">{{ l.action }}</td>
                <td class="p-3 font-mono text-xs text-slate-500">{{ l.resource }}</td>
                <td class="p-3 font-mono text-xs text-slate-400">{{ l.ip }}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="l.severity === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : l.severity === 'Warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'">{{ l.severity }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div></div>
    </div>
  `, styles: [``]
})
export class AdminAuditLogs {
  searchQuery = signal(''); filterSeverity = signal('');
  logs = signal<AuditLog[]>([
    { id: 'al1', timestamp: '2026-06-03 15:32:10', user: 'admin@livespace.com', action: 'Organization created', resource: 'org/studynest-pg', ip: '192.168.1.42', severity: 'Info' },
    { id: 'al2', timestamp: '2026-06-03 15:28:45', user: 'system', action: 'Subscription upgraded', resource: 'sub/green-valley', ip: 'system', severity: 'Info' },
    { id: 'al3', timestamp: '2026-06-03 14:55:22', user: 'owner@sunrise.com', action: 'Failed login attempt (3rd)', resource: 'auth/login', ip: '103.42.156.78', severity: 'Warning' },
    { id: 'al4', timestamp: '2026-06-03 14:42:18', user: 'system', action: 'API rate limit exceeded', resource: 'api/v1/tenants', ip: '45.33.22.11', severity: 'Critical' },
    { id: 'al5', timestamp: '2026-06-03 14:30:00', user: 'admin@livespace.com', action: 'Feature flag toggled', resource: 'flags/ai-hub', ip: '192.168.1.42', severity: 'Info' },
    { id: 'al6', timestamp: '2026-06-03 13:15:33', user: 'system', action: 'Database backup completed', resource: 'sys/backup', ip: 'system', severity: 'Info' },
    { id: 'al7', timestamp: '2026-06-03 12:45:10', user: 'enterprise@metro.com', action: 'Bulk data export', resource: 'data/export', ip: '203.45.67.89', severity: 'Warning' },
    { id: 'al8', timestamp: '2026-06-03 12:02:55', user: 'system', action: 'SSL certificate renewal failed', resource: 'sys/ssl', ip: 'system', severity: 'Critical' },
    { id: 'al9', timestamp: '2026-06-03 11:30:00', user: 'admin@livespace.com', action: 'User role changed', resource: 'user/deepak-verma', ip: '192.168.1.42', severity: 'Warning' },
    { id: 'al10', timestamp: '2026-06-03 10:15:22', user: 'system', action: 'Scheduled maintenance started', resource: 'sys/maintenance', ip: 'system', severity: 'Info' },
    { id: 'al11', timestamp: '2026-06-03 09:00:00', user: 'system', action: 'Daily analytics aggregation', resource: 'analytics/daily', ip: 'system', severity: 'Info' },
    { id: 'al12', timestamp: '2026-06-03 08:30:15', user: 'owner@sunrise.com', action: 'Password changed', resource: 'auth/password', ip: '103.42.156.78', severity: 'Info' },
  ]);
  criticalCount = computed(() => this.logs().filter(l => l.severity === 'Critical').length);
  systemCount = computed(() => this.logs().filter(l => l.user === 'system').length);
  filtered = computed(() => {
    let list = this.logs(); const q = this.searchQuery().toLowerCase(); const s = this.filterSeverity();
    if (q) list = list.filter(l => l.action.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q));
    if (s) list = list.filter(l => l.severity === s);
    return list;
  });
}
