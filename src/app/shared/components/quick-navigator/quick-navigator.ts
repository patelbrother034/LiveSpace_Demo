import { Component, signal, computed, inject, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface RouteItem {
  role: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-quick-navigator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating FAB Button -->
    <div class="fixed bottom-6 right-6 z-[9999]">
      <button 
        (click)="toggleOpen()"
        class="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 hover:rotate-12 transition-all duration-300 relative group"
        title="Quick Navigation & Role Switcher"
      >
        <i class="pi pi-compass text-2xl" [class.rotate-180]="isOpen()"></i>
        <span class="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Quick Navigation
        </span>
      </button>

      <!-- Overlay Switcher Panel -->
      @if (isOpen()) {
        <div class="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[-1]" (click)="close()"></div>
        
        <div 
          class="absolute bottom-18 right-0 w-[420px] max-w-[calc(100vw-2rem)] max-h-[580px] bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up"
        >
          <!-- Panel Header -->
          <div class="p-4 border-b border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <i class="pi pi-compass text-indigo-500"></i>
              Universal Quick Switcher
            </h3>
            
            <div class="relative">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                placeholder="Search any page (e.g. GST, Tickets, Room)..."
                class="w-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all"
              />
              @if (searchQuery()) {
                <button (click)="searchQuery.set('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <i class="pi pi-times text-xs"></i>
                </button>
              }
            </div>
          </div>

          <!-- Content: Switching & Routes list -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            
            <!-- Tab: Quick Role Switches (Only show when not searching) -->
            @if (!searchQuery()) {
              <div>
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                  Switch Role / Workspace
                </h4>
                <div class="grid grid-cols-2 gap-2">
                  @for (roleOpt of roles; track roleOpt.name) {
                    <button 
                      (click)="switchRole(roleOpt)"
                      class="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all text-left text-xs group"
                      [class.bg-indigo-500\/10]="currentRole() === roleOpt.name"
                      [class.border-indigo-500\/50]="currentRole() === roleOpt.name"
                    >
                      <div class="w-7 h-7 rounded-lg bg-gradient-to-br text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform" [class]="roleOpt.color">
                        <i class="pi {{ roleOpt.icon }} text-[10px]"></i>
                      </div>
                      <div class="min-w-0">
                        <p class="font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                          {{ roleOpt.name }}
                        </p>
                        <p class="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                          {{ roleOpt.label }}
                        </p>
                      </div>
                    </button>
                  }
                </div>
              </div>

              <!-- Active Role Routes -->
              <div>
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                  Go to page ({{ currentRole() }})
                </h4>
                <div class="space-y-1">
                  @for (item of activeRoleRoutes(); track item.route) {
                    <div 
                      (click)="navigate(item)"
                      class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors"
                    >
                      <span class="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                        {{ item.label }}
                      </span>
                      <span class="text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                        {{ item.route }}
                      </span>
                    </div>
                  }
                </div>
              </div>
            } @else {
              <!-- Search Results -->
              <div>
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                  Search Results ({{ filteredRoutes().length }})
                </h4>
                
                @if (filteredRoutes().length > 0) {
                  <div class="space-y-1">
                    @for (item of filteredRoutes(); track item.route) {
                      <div 
                        (click)="navigate(item)"
                        class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors"
                      >
                        <div class="min-w-0">
                          <p class="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                            {{ item.label }}
                          </p>
                          <p class="text-[9px] text-slate-400 dark:text-slate-500">
                            Workspace: {{ item.role }}
                          </p>
                        </div>
                        <span class="text-[9px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md shrink-0">
                          {{ item.route }}
                        </span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8 text-slate-400 dark:text-slate-500">
                    <i class="pi pi-search text-2xl mb-1.5 text-slate-300 dark:text-slate-700"></i>
                    <p class="text-xs">No pages found matching "{{ searchQuery() }}"</p>
                  </div>
                }
              </div>
            }

          </div>

          <!-- Panel Footer -->
          <div class="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
            <span>Active: {{ currentRole() }}</span>
            <span>LiveSpace Pro Navigation Hub</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scale-up {
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class QuickNavigator {
  isOpen = signal(false);
  searchQuery = signal('');

  private auth = inject(AuthService);
  private router = inject(Router);

  currentRole = computed(() => this.auth.currentUser()?.role || 'Owner');

  roles = [
    { name: 'Owner', route: '/owner/dashboard', label: 'Property Owner', icon: 'pi-chart-bar', color: 'from-indigo-500 to-purple-600', email: 'owner@demo.com' },
    { name: 'Tenant', route: '/tenant/dashboard', label: 'Resident Tenant', icon: 'pi-home', color: 'from-pink-500 to-rose-600', email: 'tenant@demo.com' },
    { name: 'Warden', route: '/warden/dashboard', label: 'Hostel Warden', icon: 'pi-users', color: 'from-amber-500 to-orange-600', email: 'warden@demo.com' },
    { name: 'Caretaker', route: '/caretaker/dashboard', label: 'Property Caretaker', icon: 'pi-wrench', color: 'from-cyan-500 to-teal-600', email: 'caretaker@demo.com' },
    { name: 'Accountant', route: '/accountant/dashboard', label: 'Financial Accountant', icon: 'pi-money-bill', color: 'from-emerald-500 to-green-600', email: 'accountant@demo.com' },
    { name: 'Parent', route: '/parent/dashboard', label: 'Guardian Parent', icon: 'pi-shield', color: 'from-blue-500 to-sky-600', email: 'parent@demo.com' },
    { name: 'SuperAdmin', route: '/admin/dashboard', label: 'Platform Admin', icon: 'pi-sliders-h', color: 'from-slate-600 to-slate-800', email: 'admin@demo.com' },
    { name: 'Enterprise', route: '/enterprise/dashboard', label: 'Enterprise Executive', icon: 'pi-globe', color: 'from-violet-500 to-fuchsia-600', email: 'enterprise@demo.com' },
  ];

  // All 56+ catalogued routes in the system
  allRoutes: RouteItem[] = [
    // Owner
    { role: 'Owner', label: 'Owner Dashboard', route: '/owner/dashboard' },
    { role: 'Owner', label: 'Properties list', route: '/owner/properties' },
    { role: 'Owner', label: 'Tenants list', route: '/owner/tenants' },
    { role: 'Owner', label: 'Beds & Rooms configuration', route: '/owner/beds' },
    { role: 'Owner', label: 'Rent Payments & Dues', route: '/owner/payments' },
    { role: 'Owner', label: 'Maintenance Tickets Dashboard', route: '/owner/maintenance/dashboard' },
    { role: 'Owner', label: 'Announcements & Alerts', route: '/owner/communication/announcements' },
    { role: 'Owner', label: 'AI Operations Command Hub', route: '/owner/ai-hub' },
    { role: 'Owner', label: 'Business Reports & Analytics', route: '/owner/reports' },
    { role: 'Owner', label: 'Organization Settings & Profile', route: '/owner/settings' },

    // Tenant
    { role: 'Tenant', label: 'Tenant Dashboard', route: '/tenant/dashboard' },
    { role: 'Tenant', label: 'My Profile & KYC Status', route: '/tenant/profile' },
    { role: 'Tenant', label: 'Rent Invoices & Dues', route: '/tenant/payments' },
    { role: 'Tenant', label: 'My Tickets / Complaints', route: '/tenant/tickets' },
    { role: 'Tenant', label: 'My Roommate & Bed Info', route: '/tenant/room' },
    { role: 'Tenant', label: 'Apply Gate Pass', route: '/tenant/gate-pass' },

    // Warden
    { role: 'Warden', label: 'Warden Dashboard', route: '/warden/dashboard' },
    { role: 'Warden', label: 'Student Daily Attendance', route: '/warden/attendance' },
    { role: 'Warden', label: 'Active Gate Passes list', route: '/warden/gate-pass' },
    { role: 'Warden', label: 'Rooms & Bed allocations', route: '/warden/rooms' },
    { role: 'Warden', label: 'Visitors Log', route: '/warden/visitors' },
    { role: 'Warden', label: 'Emergency Safety Broadcasts', route: '/warden/emergency' },
    { role: 'Warden', label: 'Curfew Violations Tracker', route: '/warden/curfew' },

    // Caretaker
    { role: 'Caretaker', label: 'Caretaker Dashboard', route: '/caretaker/dashboard' },
    { role: 'Caretaker', label: 'Assigned Buildings & Utilities', route: '/caretaker/properties' },
    { role: 'Caretaker', label: 'Resident Check-In/Out processing', route: '/caretaker/check-in-out' },
    { role: 'Caretaker', label: 'Maintenance Job Tickets', route: '/caretaker/tickets' },
    { role: 'Caretaker', label: 'Staff Shift Attendance', route: '/caretaker/attendance' },
    { role: 'Caretaker', label: 'Rent Meter Readings & Utility Bills', route: '/caretaker/rent-entry' },

    // Accountant
    { role: 'Accountant', label: 'Accountant Dashboard', route: '/accountant/dashboard' },
    { role: 'Accountant', label: 'Rent Invoices issued', route: '/accountant/invoices' },
    { role: 'Accountant', label: 'Rent Payments collected', route: '/accountant/payments' },
    { role: 'Accountant', label: 'Organization Expenses log', route: '/accountant/expenses' },
    { role: 'Accountant', label: 'Tax receipts generated', route: '/accountant/receipts' },
    { role: 'Accountant', label: 'Double-Entry Accounting Ledger', route: '/accountant/ledger' },
    { role: 'Accountant', label: 'GST Filings & Returns', route: '/accountant/gst' },
    { role: 'Accountant', label: 'Cash Flow Statements', route: '/accountant/cash-flow' },
    { role: 'Accountant', label: 'Transactions History', route: '/accountant/transactions' },
    { role: 'Accountant', label: 'Financial Balance sheets', route: '/accountant/reports' },

    // Parent
    { role: 'Parent', label: 'Parent Dashboard', route: '/parent/dashboard' },
    { role: 'Parent', label: 'Ward Student Overview', route: '/parent/student-overview' },
    { role: 'Parent', label: 'Ward Billing Payments', route: '/parent/payments' },
    { role: 'Parent', label: 'Submit Safety Concerns', route: '/parent/complaints' },
    { role: 'Parent', label: 'Parent Alerts & Announcements', route: '/parent/announcements' },
    { role: 'Parent', label: 'Parent-Warden chat helpdesk', route: '/parent/communication' },

    // SuperAdmin
    { role: 'SuperAdmin', label: 'SuperAdmin Dashboard', route: '/admin/dashboard' },
    { role: 'SuperAdmin', label: 'SaaS Registered Organizations', route: '/admin/organizations' },
    { role: 'SuperAdmin', label: 'Platform Users list', route: '/admin/users' },
    { role: 'SuperAdmin', label: 'SaaS Plan Subscriptions', route: '/admin/subscriptions' },
    { role: 'SuperAdmin', label: 'Security Audit logs', route: '/admin/audit-logs' },
    { role: 'SuperAdmin', label: 'Global Feature flags toggles', route: '/admin/feature-flags' },
    { role: 'SuperAdmin', label: 'SaaS Platform Analytics', route: '/admin/platform-analytics' },
    { role: 'SuperAdmin', label: 'Organization Support tickets', route: '/admin/support-tickets' },

    // Enterprise
    { role: 'Enterprise', label: 'Enterprise Dashboard', route: '/enterprise/dashboard' },
    { role: 'Enterprise', label: 'Multi-Org Aggregate Analytics', route: '/enterprise/analytics' },
    { role: 'Enterprise', label: 'Enterprise Properties portfolio', route: '/enterprise/properties' },
    { role: 'Enterprise', label: 'Staff rosters management', route: '/enterprise/staff' },
    { role: 'Enterprise', label: 'Regional operations mapping', route: '/enterprise/regions' },
    { role: 'Enterprise', label: 'Franchise outlets list', route: '/enterprise/franchises' },
    { role: 'Enterprise', label: 'Corporate KPI Board', route: '/enterprise/kpi' },
    { role: 'Enterprise', label: 'Brand customization settings', route: '/enterprise/brand' },
    { role: 'Enterprise', label: 'Inter-franchise performance comparisons', route: '/enterprise/comparison' },
    { role: 'Enterprise', label: 'Aggregated custom enterprise reports', route: '/enterprise/reports' },
  ];

  activeRoleRoutes = computed(() => {
    const role = this.currentRole();
    return this.allRoutes.filter(item => item.role === role);
  });

  filteredRoutes = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    return this.allRoutes.filter(item => 
      item.label.toLowerCase().includes(q) || 
      item.route.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q)
    );
  });

  toggleOpen() {
    this.isOpen.update(v => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  switchRole(roleOpt: any) {
    // Force set the mock session user
    const dummyUser = {
      id: `user-${roleOpt.name.toLowerCase()}-001`,
      email: roleOpt.email,
      role: roleOpt.name,
      name: `Demo ${roleOpt.name}`
    };
    this.auth.currentUser.set(dummyUser as any);
    sessionStorage.setItem('lsp_session_user', JSON.stringify(dummyUser));

    // Redirect to the target dashboard
    this.router.navigate([roleOpt.route]);
  }

  navigate(item: RouteItem) {
    // Switch the active user if clicking a page belonging to a different role
    const activeRole = this.currentRole();
    if (item.role !== activeRole) {
      const matchOpt = this.roles.find(opt => opt.name === item.role);
      if (matchOpt) {
        this.switchRole(matchOpt);
      }
    }

    // Now navigate to the target route
    this.router.navigate([item.route]);
    this.close();
  }
}
