import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-platform-analytics',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Platform Analytics" subtitle="User engagement, feature usage, and growth metrics" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Daily Active Users</p><p class="text-xl font-extrabold text-indigo-600 mt-1">342</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Feature Adoption</p><p class="text-xl font-extrabold text-emerald-600 mt-1">78%</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">API Calls (24h)</p><p class="text-xl font-extrabold text-blue-600 mt-1">12.4K</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Error Rate</p><p class="text-xl font-extrabold text-red-500 mt-1">0.3%</p></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Feature Usage -->
        <div class="glass-card p-5 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Top Features by Usage</h4>
          <div class="space-y-3">
            @for (f of featureUsage; track f.name) {
              <div class="space-y-1">
                <div class="flex justify-between text-xs"><span class="font-bold text-slate-700 dark:text-slate-300">{{ f.name }}</span><span class="font-bold text-indigo-600">{{ f.usage }}%</span></div>
                <div class="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all" [style.width.%]="f.usage" [style.background]="f.color"></div></div>
              </div>
            }
          </div>
        </div>

        <!-- User Growth -->
        <div class="glass-card p-5 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">User Growth Trend</h4>
          <svg viewBox="0 0 600 160" class="w-full h-32">
            <defs><linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,140 L100,125 L200,108 L300,95 L400,72 L500,55 L600,38 L600,160 L0,160Z" fill="url(#growthGrad)" />
            <polyline points="0,140 100,125 200,108 300,95 400,72 500,55 600,38" fill="none" stroke="#10b981" stroke-width="2.5" />
          </svg>
          <div class="flex justify-between text-[10px] text-slate-400 font-bold"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></div>
        </div>

        <!-- Geographic Distribution -->
        <div class="glass-card p-5 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Top Cities</h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            @for (city of topCities; track city.name) {
              <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                <p class="text-lg font-extrabold text-slate-800 dark:text-white">{{ city.users }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase">{{ city.name }}</p>
                <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden"><div class="h-full rounded-full bg-indigo-500" [style.width.%]="(city.users / 120) * 100"></div></div>
              </div>
            }
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass-card p-5 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recent Platform Activity</h4>
          <div class="space-y-2 max-h-[300px] overflow-y-auto">
            @for (a of recentActivity; track a.time) {
              <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 flex items-center gap-3 text-xs">
                <span class="w-2 h-2 rounded-full flex-shrink-0" [class]="a.type === 'signup' ? 'bg-emerald-500' : a.type === 'login' ? 'bg-blue-500' : a.type === 'feature' ? 'bg-purple-500' : 'bg-amber-500'"></span>
                <span class="flex-1 text-slate-700 dark:text-slate-300">{{ a.message }}</span>
                <span class="text-slate-400 whitespace-nowrap">{{ a.time }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `, styles: [``]
})
export class AdminPlatformAnalytics {
  featureUsage = [
    { name: 'Dashboard', usage: 95, color: '#6366f1' },
    { name: 'Rent Collection', usage: 88, color: '#10b981' },
    { name: 'Tenant Management', usage: 82, color: '#f59e0b' },
    { name: 'Visual Bed Layout', usage: 76, color: '#ef4444' },
    { name: 'Maintenance', usage: 68, color: '#8b5cf6' },
    { name: 'AI Hub', usage: 45, color: '#ec4899' },
    { name: 'Reports', usage: 42, color: '#14b8a6' },
    { name: 'Communication', usage: 38, color: '#3b82f6' },
  ];
  topCities = [
    { name: 'Bangalore', users: 120 }, { name: 'Mumbai', users: 95 }, { name: 'Delhi NCR', users: 88 },
    { name: 'Pune', users: 62 }, { name: 'Hyderabad', users: 48 }, { name: 'Chennai', users: 35 },
  ];
  recentActivity = [
    { type: 'signup', message: 'New organization "NestAway Plus" registered', time: '2 min ago' },
    { type: 'login', message: 'Bulk login from Sunrise PG (12 users)', time: '8 min ago' },
    { type: 'feature', message: 'AI Hub accessed by Metro Living admin', time: '15 min ago' },
    { type: 'upgrade', message: 'StudyNest upgraded from Starter to Growth', time: '32 min ago' },
    { type: 'login', message: 'First-time login: caretaker@greenvally.com', time: '1 hr ago' },
    { type: 'feature', message: 'Visual Bed Layout used by 5 organizations', time: '1.5 hrs ago' },
    { type: 'signup', message: 'New trial started: "HostelHub Kolkata"', time: '2 hrs ago' },
    { type: 'upgrade', message: 'CampusStay requested Enterprise demo', time: '3 hrs ago' },
    { type: 'feature', message: 'White-Label configured by Metro Living', time: '4 hrs ago' },
    { type: 'login', message: 'Parent portal accessed: 28 sessions today', time: '5 hrs ago' },
  ];
}
