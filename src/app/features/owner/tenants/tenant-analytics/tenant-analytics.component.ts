import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-tenant-analytics',
  standalone: true,
  imports: [CommonModule, PageHeader, StatCard],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Resident Analytics" subtitle="Deep insights into tenant demographics, lease tenures, and payment patterns"></app-page-header>

      <!-- KPI summary stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Active Residents" [value]="stats().activeCount + ' residents'" icon="pi-users" color="primary" [trend]="stats().activePercent" trendLabel="occupancy rate" />
        <app-stat-card label="Pending KYC Compliance" [value]="stats().pendingKycCount + ' cases'" icon="pi-verified" color="warning" [trend]="-12" trendLabel="from last week" />
        <app-stat-card label="Average Stay Duration" [value]="stats().avgTenure + ' months'" icon="pi-clock" color="success" [trend]="5" trendLabel="retention growth" />
        <app-stat-card label="Departure Notice Active" [value]="stats().noticeCount + ' notice'" icon="pi-bell" color="danger" [trend]="stats().noticePercent" trendLabel="churn rate" />
      </div>

      <!-- Analytics breakdown cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Demographics split (Student vs Professional) -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-briefcase text-indigo-500"></i> Resident Occupation Profile
          </h3>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-slate-500">Working Professionals</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ stats().proPercent }}% ({{ stats().proCount }})</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" [style.width.%]="stats().proPercent"></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-slate-500">College Students</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ stats().studentPercent }}% ({{ stats().studentCount }})</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" [style.width.%]="stats().studentPercent"></div>
              </div>
            </div>
          </div>
          <div class="p-3 rounded-lg bg-indigo-50/50 border text-[10px] text-indigo-700 leading-relaxed">
            Professionals represent the largest stay cohort, with an average retention that is 4.2 months longer than student lease terms.
          </div>
        </div>

        <!-- Gender Demographics -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-users text-indigo-500"></i> Gender Diversity Allocation
          </h3>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-slate-500">Male Allocation</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ stats().malePercent }}% ({{ stats().maleCount }})</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full" [style.width.%]="stats().malePercent"></div>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-slate-500">Female Allocation</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ stats().femalePercent }}% ({{ stats().femaleCount }})</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div class="h-full bg-pink-500 rounded-full" [style.width.%]="stats().femalePercent"></div>
              </div>
            </div>
          </div>
          <div class="p-3 rounded-lg bg-emerald-50/50 border text-[10px] text-emerald-700 leading-relaxed">
            Co-living gender diversification is actively tracked to coordinate building wing allocations.
          </div>
        </div>

        <!-- Stay Tenure Cohorts -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-history text-indigo-500"></i> Lease Tenure Cohorts
          </h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Short term (&lt; 3 Months)</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-rose-500" style="width: 15%"></div>
                </div>
                <span class="font-bold text-slate-700">15%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Mid term (3 – 6 Months)</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500" style="width: 35%"></div>
                </div>
                <span class="font-bold text-slate-700">35%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Long term (6 – 12 Months)</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-indigo-500" style="width: 42%"></div>
                </div>
                <span class="font-bold text-slate-700">42%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Enterprise stay (1 Year +)</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500" style="width: 8%"></div>
                </div>
                <span class="font-bold text-slate-700">8%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Discipline split -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-credit-card text-indigo-500"></i> Collection Discipline Stats
          </h3>
          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Rent Settled On-Time (By 5th)</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-emerald-500" style="width: 82%"></div>
                </div>
                <span class="font-bold text-slate-700">82%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Partial Settlements / Pending</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-amber-500" style="width: 12%"></div>
                </div>
                <span class="font-bold text-slate-700">12%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-400">Overdue Rent Balances</span>
              <div class="flex items-center gap-2">
                <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-red-500" style="width: 6%"></div>
                </div>
                <span class="font-bold text-slate-700">6%</span>
              </div>
            </div>
          </div>
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
export class TenantAnalyticsComponent implements OnInit {
  private crudService = inject(CrudService);

  stats = signal<any>({
    activeCount: 0,
    activePercent: 0,
    pendingKycCount: 0,
    avgTenure: 8.5,
    noticeCount: 0,
    noticePercent: 0,
    proCount: 0,
    proPercent: 0,
    studentCount: 0,
    studentPercent: 0,
    maleCount: 0,
    malePercent: 0,
    femaleCount: 0,
    femalePercent: 0
  });

  ngOnInit() {
    this.calculateStats();
  }

  calculateStats() {
    const rawTenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const beds = this.crudService.getAll<any>(StorageKeys.BEDS);

    const totalBeds = beds.length || 1;
    const activeTenants = rawTenants.filter((t: any) => t.status === 'Active' || t.status === 'Notice');
    const noticeTenants = rawTenants.filter((t: any) => t.status === 'Notice');
    const pendingKyc = rawTenants.filter((t: any) => t.kycStatus === 'Submitted' || t.kycStatus === 'Pending');

    const totalActiveCount = activeTenants.length;
    const activePercent = Math.round((totalActiveCount / totalBeds) * 100);
    const noticeCount = noticeTenants.length;
    const noticePercent = totalActiveCount ? Math.round((noticeCount / totalActiveCount) * 100) : 0;

    // Professionals vs Students
    const pros = activeTenants.filter((t: any) => t.occupation === 'Professional');
    const proCount = pros.length;
    const proPercent = totalActiveCount ? Math.round((proCount / totalActiveCount) * 100) : 0;
    const studentCount = totalActiveCount - proCount;
    const studentPercent = 100 - proPercent;

    // Gender breakdown
    const males = activeTenants.filter((t: any) => t.gender === 'Male');
    const maleCount = males.length;
    const malePercent = totalActiveCount ? Math.round((maleCount / totalActiveCount) * 100) : 0;
    const femaleCount = totalActiveCount - maleCount;
    const femalePercent = 100 - malePercent;

    this.stats.set({
      activeCount: totalActiveCount,
      activePercent,
      pendingKycCount: pendingKyc.length,
      avgTenure: 8.5, // Standard simulated default
      noticeCount,
      noticePercent,
      proCount,
      proPercent,
      studentCount,
      studentPercent,
      maleCount,
      malePercent,
      femaleCount,
      femalePercent
    });
  }
}
