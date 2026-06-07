import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface AnalyticsTicket {
  id: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  actualCost?: number;
}

@Component({
  selector: 'app-maintenance-analytics',
  standalone: true,
  imports: [CommonModule, PageHeader, StatCard],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Maintenance Analytics" subtitle="Track and analyze maintenance KPIs, resolution speeds, and repair costs across your portfolio">
      </app-page-header>

      <!-- KPI metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Average Resolution Speed" [value]="avgResolutionSpeed() + ' Days'" icon="pi-hourglass" color="info" />
        <app-stat-card label="Total Repair Cost" [value]="'₹' + totalCost().toLocaleString('en-IN')" icon="pi-indian-rupee" color="warning" />
        <app-stat-card label="Critical/High Tickets" [value]="highPriorityCount() + ' Open'" icon="pi-exclamation-triangle" color="danger" />
        <app-stat-card label="Fulfillment Rate" [value]="fulfillmentRate() + '%'" icon="pi-verified" color="success" />
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- CHART 1: TICKETS BY CATEGORY (Donut Chart) -->
        <div class="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Issues by Category</h3>
            
            <div class="flex flex-col sm:flex-row items-center justify-around gap-6">
              <!-- SVG Donut -->
              <div class="relative w-40 h-40">
                <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" class="text-slate-100 dark:text-slate-800" stroke-width="3"></circle>
                  
                  @for (seg of categorySegments(); track seg.category) {
                    <circle cx="18" cy="18" r="15.915" fill="none" 
                            [attr.stroke]="seg.color" 
                            stroke-width="3" 
                            [attr.stroke-dasharray]="seg.dashArray" 
                            [attr.stroke-dashoffset]="seg.dashOffset"
                            class="transition-all duration-1000">
                    </circle>
                  }
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span class="text-2xl font-black text-slate-800 dark:text-white">{{ ticketsCount() }}</span>
                  <span class="text-[9px] uppercase tracking-wider text-slate-400">Total</span>
                </div>
              </div>

              <!-- Legend -->
              <div class="space-y-2.5 flex-1 max-w-[200px]">
                @for (seg of categorySegments(); track seg.category) {
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background-color]="seg.color"></span>
                      <span class="text-slate-600 dark:text-slate-300 truncate">{{ seg.category }}</span>
                    </div>
                    <span class="font-bold text-slate-800 dark:text-white">{{ seg.count }}</span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- CHART 2: TICKETS BY PRIORITY (Horizontal Bar Chart) -->
        <div class="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Issues by Priority</h3>
            
            <div class="space-y-5">
              @for (prio of priorityDistribution(); track prio.priority) {
                <div class="space-y-1.5">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-semibold text-slate-600 dark:text-slate-300">{{ prio.priority }} Priority</span>
                    <span class="font-bold text-slate-800 dark:text-white">{{ prio.count }} ({{ prio.percent }}%)</span>
                  </div>
                  <div class="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-1000"
                         [style.width.%]="prio.percent"
                         [style.background-color]="prio.color">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- CHART 3: REPAIR COST PER CATEGORY (Vertical Columns Chart) -->
        <div class="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Spending per Category (INR)</h3>
            
            <div class="h-56 flex items-end justify-between gap-3 pt-6 border-b border-l border-slate-200 dark:border-slate-800/80 px-4">
              @for (costItem of categoryCosts(); track costItem.category) {
                <div class="flex-1 flex flex-col items-center group relative cursor-pointer">
                  <!-- Tooltip -->
                  <div class="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    ₹{{ costItem.cost }}
                  </div>

                  <!-- Visual Bar -->
                  <div class="w-full sm:w-10 rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-400 group-hover:from-violet-500 group-hover:to-indigo-300 transition-all duration-1000"
                       [style.height.px]="getCostBarHeight(costItem.cost)">
                  </div>
                  
                  <!-- Label -->
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 mt-2 truncate w-full text-center">
                    {{ costItem.category }}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- CHART 4: RESOLUTION TIME TREND (Smooth Line Graph) -->
        <div class="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">Fulfillment Trend (Open vs Resolved)</h3>
            
            <div class="relative w-full h-56 mt-4">
              <!-- SVG Polyline Trend -->
              <svg viewBox="0 0 100 40" class="w-full h-full" preserveAspectRatio="none">
                <!-- Grid Lines -->
                <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" class="text-slate-100 dark:text-slate-900" stroke-width="0.3"></line>
                <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" class="text-slate-100 dark:text-slate-900" stroke-width="0.3"></line>
                <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" class="text-slate-100 dark:text-slate-900" stroke-width="0.3"></line>

                <!-- Gradient below line -->
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"></stop>
                    <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0"></stop>
                  </linearGradient>
                </defs>
                <path d="M 0,40 Q 20,25 40,28 T 80,12 L 100,8 L 100,40 Z" fill="url(#areaGradient)"></path>

                <!-- The Polyline -->
                <path d="M 0,40 Q 20,25 40,28 T 80,12 L 100,8" fill="none" stroke="#6366f1" stroke-width="1" class="transition-all duration-1000"></path>

                <!-- Hotspots -->
                <circle cx="20" cy="27" r="1.2" fill="#4f46e5" stroke="white" stroke-width="0.4"></circle>
                <circle cx="50" cy="22" r="1.2" fill="#4f46e5" stroke="white" stroke-width="0.4"></circle>
                <circle cx="80" cy="12" r="1.2" fill="#4f46e5" stroke="white" stroke-width="0.4"></circle>
                <circle cx="100" cy="8" r="1.2" fill="#4f46e5" stroke="white" stroke-width="0.4"></circle>
              </svg>

              <!-- Axes Labels -->
              <div class="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-slate-400 px-2">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4 (Current)</span>
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
export class MaintenanceAnalytics implements OnInit {
  private crudService = inject(CrudService);

  tickets = signal<AnalyticsTicket[]>([]);

  // Computed metrics
  ticketsCount = computed(() => this.tickets().length);
  
  avgResolutionSpeed = computed(() => {
    const resolved = this.tickets().filter(t => t.status === 'Resolved' || t.status === 'Closed');
    if (resolved.length === 0) return 2.4; // Default baseline

    let totalDays = 0;
    resolved.forEach(t => {
      const created = new Date(t.createdAt).getTime();
      const resolvedDate = t.resolvedAt ? new Date(t.resolvedAt).getTime() : new Date().getTime();
      const diffDays = (resolvedDate - created) / (1000 * 60 * 60 * 24);
      totalDays += Math.max(0.5, diffDays);
    });

    return Number((totalDays / resolved.length).toFixed(1));
  });

  totalCost = computed(() => {
    return this.tickets().reduce((sum, t) => sum + (t.actualCost || 0), 0);
  });

  highPriorityCount = computed(() => {
    return this.tickets().filter(t => 
      (t.priority === 'High' || t.priority === 'Critical') && 
      (t.status === 'Open' || t.status === 'Assigned' || t.status === 'InProgress')
    ).length;
  });

  fulfillmentRate = computed(() => {
    const total = this.ticketsCount();
    if (total === 0) return 100;
    const resolved = this.tickets().filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
    return Math.round((resolved / total) * 100);
  });

  // Categories segments computed list
  categorySegments = computed(() => {
    const categories = ['Plumbing', 'Electrical', 'AC/Heating', 'Furniture', 'Cleaning', 'WiFi/IT', 'Other'];
    const colors = ['#6366f1', '#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#64748b'];
    
    let totalCount = 0;
    const counts = categories.map((cat, i) => {
      const count = this.tickets().filter(t => t.category === cat).length;
      totalCount += count;
      return { category: cat, count, color: colors[i], percent: 0, dashArray: '0 100', dashOffset: '0' };
    });

    if (totalCount === 0) {
      // Return a balanced default for mock/aesthetic when no tickets raised
      return categories.map((cat, i) => ({
        category: cat, count: 0, color: colors[i], percent: 14.2, dashArray: '14.2 100', dashOffset: `${i * 14.2}`
      }));
    }

    let accumulatedOffset = 0;
    return counts.map(item => {
      const percent = Math.round((item.count / totalCount) * 100);
      const dashArray = `${percent} ${100 - percent}`;
      const dashOffset = `${100 - accumulatedOffset}`;
      accumulatedOffset += percent;

      return {
        ...item,
        percent,
        dashArray,
        dashOffset
      };
    });
  });

  // Priority percentages computed
  priorityDistribution = computed(() => {
    const priorities = [
      { priority: 'Critical', color: '#ef4444' },
      { priority: 'High', color: '#f97316' },
      { priority: 'Medium', color: '#f59e0b' },
      { priority: 'Low', color: '#64748b' }
    ];

    const total = this.ticketsCount();
    return priorities.map(item => {
      const count = this.tickets().filter(t => t.priority === item.priority).length;
      const percent = total ? Math.round((count / total) * 100) : 0;
      return { ...item, count, percent };
    });
  });

  // Cost Per Category computed list
  categoryCosts = computed(() => {
    const categories = ['Plumbing', 'Electrical', 'AC/Heating', 'Furniture', 'Cleaning', 'WiFi/IT'];
    return categories.map(cat => {
      const cost = this.tickets().filter(t => t.category === cat).reduce((sum, t) => sum + (t.actualCost || 0), 0);
      return { category: cat, cost };
    });
  });

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    const list = this.crudService.getAll<AnalyticsTicket>(StorageKeys.TICKETS);
    this.tickets.set(list);
  }

  getCostBarHeight(cost: number): number {
    const maxCost = Math.max(500, ...this.categoryCosts().map(c => c.cost));
    return Math.max(5, Math.round((cost / maxCost) * 180));
  }
}
