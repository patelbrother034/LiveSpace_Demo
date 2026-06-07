import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { ButtonModule } from 'primeng/button';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  level: string; // INFO, WARN, ERROR
  ipAddress: string;
}

interface FeatureFlags {
  aiInsights: boolean;
  smartLock: boolean;
  onlinePayments: boolean;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Audit Trail & Feature Toggles" subtitle="Monitor platform system security, audit logs, and toggle global feature flags" />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <!-- Left: Searchable System Audit Trail -->
        <div class="xl:col-span-2 glass-card p-6 space-y-4">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">System Audit Trail</h4>
            
            <div class="flex items-center gap-2">
              <input type="text" [(ngModel)]="searchQuery" placeholder="Search logs..."
                class="p-1 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs w-40 focus:ring-1 focus:ring-indigo-500">
              
              <select [(ngModel)]="levelFilter"
                class="p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
                <option value="All">All Levels</option>
                <option value="INFO">INFO Only</option>
                <option value="WARN">WARN Only</option>
                <option value="ERROR">ERROR Only</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto max-h-[460px] overflow-y-auto">
            <table class="w-full text-xs text-left">
              <thead>
                <tr class="text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase font-bold text-[10px]">
                  <th class="py-2.5">Timestamp</th>
                  <th class="py-2.5">Level</th>
                  <th class="py-2.5">User</th>
                  <th class="py-2.5">Action Log</th>
                  <th class="py-2.5 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                @for (log of filteredLogs(); track log.id) {
                  <tr>
                    <td class="py-3.5 text-slate-400">{{ log.timestamp | date:'shortTime' }}</td>
                    <td class="py-3.5">
                      <span class="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase"
                        [class]="log.level === 'INFO' ? 'bg-indigo-100 text-indigo-700' : 
                                 log.level === 'WARN' ? 'bg-amber-100 text-amber-700' : 
                                 'bg-red-100 text-red-700'">
                        {{ log.level }}
                      </span>
                    </td>
                    <td class="py-3.5 font-semibold text-slate-800 dark:text-slate-350">{{ log.user }}</td>
                    <td class="py-3.5 text-slate-600 dark:text-slate-400 font-medium">"{{ log.action }}"</td>
                    <td class="py-3.5 text-right font-mono text-slate-400">{{ log.ipAddress }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="py-6 text-center text-slate-400 italic">No audit records match filters.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Global SaaS Feature Flags -->
        <div class="xl:col-span-1 space-y-6">
          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Global Feature Flags</h4>
            <p class="text-[9.5px] text-slate-500 leading-relaxed">Toggle SaaS platform level features on/off instantly. Toggles update lsp_feature_flags in local storage.</p>
            
            <div class="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              
              <!-- AI Insights toggle -->
              <div class="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs">
                <div>
                  <h5 class="font-bold text-slate-700 dark:text-slate-300">AI Intelligence Insights</h5>
                  <p class="text-[9px] text-slate-400">Enables dynamic yield suggestions on dashboards.</p>
                </div>
                <input type="checkbox" [(ngModel)]="aiInsights" (change)="saveFlags()" class="h-4.5 w-4.5 rounded text-indigo-600">
              </div>

              <!-- Smart Lock integration toggle -->
              <div class="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs">
                <div>
                  <h5 class="font-bold text-slate-700 dark:text-slate-300">Smart Lock Integrations</h5>
                  <p class="text-[9px] text-slate-400">Activates mobile check-in gate locks scanners.</p>
                </div>
                <input type="checkbox" [(ngModel)]="smartLock" (change)="saveFlags()" class="h-4.5 w-4.5 rounded text-indigo-600">
              </div>

              <!-- Online payments billing gateway -->
              <div class="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs">
                <div>
                  <h5 class="font-bold text-slate-700 dark:text-slate-300">Online Payments Gateway</h5>
                  <p class="text-[9px] text-slate-400">Routes simulated UPI / card payments directly.</p>
                </div>
                <input type="checkbox" [(ngModel)]="onlinePayments" (change)="saveFlags()" class="h-4.5 w-4.5 rounded text-indigo-600">
              </div>

            </div>
          </div>
        </div>

      </div>
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
export class AdminUsers implements OnInit {
  // Audit logs lists
  logs = signal<AuditLog[]>([]);

  // Feature Flags Model
  aiInsights = true;
  smartLock = false;
  onlinePayments = true;

  // Audit Filter fields
  searchQuery = '';
  levelFilter = 'All';

  filteredLogs = computed(() => {
    let result = this.logs();
    
    // search filter
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(l => l.user.toLowerCase().includes(query) || l.action.toLowerCase().includes(query));
    }

    // level filter
    const level = this.levelFilter;
    if (level !== 'All') {
      result = result.filter(l => l.level === level);
    }

    return result;
  });

  ngOnInit() {
    this.loadLogs();
    this.loadFlags();
  }

  loadLogs() {
    const list = localStorage.getItem('lsp_saas_audit_logs');
    if (list) {
      this.logs.set(JSON.parse(list));
    } else {
      const seed: AuditLog[] = [
        { id: 'log-1', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), user: 'admin@demo.com', action: 'Global feature flag toggled: smartLock set to true', level: 'INFO', ipAddress: '192.168.1.1' },
        { id: 'log-2', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), user: 'owner@demo.com', action: 'Property addition: Royal Heights Noida updated successfully', level: 'INFO', ipAddress: '103.88.24.11' },
        { id: 'log-3', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), user: 'warden@demo.com', action: 'Evacuation protocol triggered: EVACUATION SIREN ON', level: 'WARN', ipAddress: '192.168.1.5' },
        { id: 'log-4', timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), user: 'system_node_01', action: 'Failed backup database synchronizer heartbeat ping response latency > 3s', level: 'ERROR', ipAddress: '127.0.0.1' }
      ];
      localStorage.setItem('lsp_saas_audit_logs', JSON.stringify(seed));
      this.logs.set(seed);
    }
  }

  loadFlags() {
    const flags = localStorage.getItem('lsp_feature_flags');
    if (flags) {
      const parsed: FeatureFlags = JSON.parse(flags);
      this.aiInsights = parsed.aiInsights;
      this.smartLock = parsed.smartLock;
      this.onlinePayments = parsed.onlinePayments;
    }
  }

  saveFlags() {
    const config: FeatureFlags = {
      aiInsights: this.aiInsights,
      smartLock: this.smartLock,
      onlinePayments: this.onlinePayments
    };
    localStorage.setItem('lsp_feature_flags', JSON.stringify(config));
    
    // Log action to audit logs
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      user: 'admin@demo.com',
      action: `Feature flags updated: AI: ${this.aiInsights}, SmartLock: ${this.smartLock}, OnlinePayments: ${this.onlinePayments}`,
      level: 'INFO',
      ipAddress: '192.168.1.1'
    };

    const currentLogs = this.logs();
    currentLogs.unshift(newLog);
    localStorage.setItem('lsp_saas_audit_logs', JSON.stringify(currentLogs));
    this.logs.set(currentLogs);
  }
}
