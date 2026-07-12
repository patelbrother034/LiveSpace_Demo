import { Component, signal, HostListener, effect, ElementRef, viewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface SearchResult {
  id: string;
  type: 'Tenant' | 'Property' | 'Invoice' | 'Ticket';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative">
      <div 
        (click)="openSearch()"
        class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 gap-3 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-700 cursor-pointer shadow-sm w-56 md:w-72"
      >
        <svg class="flex-shrink-0 text-indigo-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <span class="text-sm text-slate-400 dark:text-slate-400 flex-1 text-left select-none">
          Search LiveSpace...
        </span>
        <kbd class="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-[9px] font-mono text-slate-400 dark:text-slate-400 flex-shrink-0">
          Ctrl K
        </kbd>
      </div>

      <!-- Ctrl+K Search Modal -->
      @if (isOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto">
          <!-- Backdrop (Dark Overlay to cover background) -->
          <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" (click)="closeSearch()"></div>
          
          <!-- Modal Position Wrapper -->
          <div class="flex min-h-screen items-start justify-center pt-[15vh] px-4">
            <!-- Modal Card (Solid Background to prevent overlapping text) -->
            <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up z-10">
              <div class="flex items-center border-b border-slate-200 dark:border-slate-800 p-4 gap-3">
                <i class="pi pi-search text-slate-400 text-lg"></i>
                <input 
                  #searchInput
                  type="text"
                  [(ngModel)]="query"
                  (ngModelChange)="onSearch()"
                  placeholder="Search tenants, properties, invoices, tickets..."
                  class="bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 flex-1 text-base focus:ring-0" 
                />
                <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono">
                  ESC
                </span>
              </div>

              <!-- Results / Quick Actions -->
              <div class="max-h-[50vh] overflow-y-auto p-4">
                @if (results().length > 0) {
                  <div class="space-y-1">
                    <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">
                      Matching Results
                    </h4>
                    @for (res of results(); track res.id) {
                      <div (click)="navigate(res.route)" class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                        <div class="flex items-center gap-3">
                          <div class="w-9 h-9 rounded-lg flex items-center justify-center text-white" [class]="res.color">
                            <i class="pi {{ res.icon }} text-sm"></i>
                          </div>
                          <div>
                            <p class="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">
                              {{ res.title }}
                            </p>
                            <p class="text-xs text-slate-500 dark:text-slate-400">
                              {{ res.subtitle }}
                            </p>
                          </div>
                        </div>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {{ res.type }}
                        </span>
                      </div>
                    }
                  </div>
                } @else if (query()) {
                  <div class="text-center py-10 text-slate-500 dark:text-slate-400">
                    <i class="pi pi-search text-3xl mb-2 text-slate-300 dark:text-slate-700"></i>
                    <p class="text-sm">No results found for "{{ query() }}"</p>
                  </div>
                } @else {
                  <!-- Quick Actions Suggestions -->
                  <div>
                    <h4 class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
                      Quick Actions
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button (click)="handleQuickAction('add-tenant')" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-500/10 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all text-left text-sm group">
                        <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <i class="pi pi-plus"></i>
                        </div>
                        <div>
                          <p class="font-semibold text-xs">Add Tenant</p>
                          <p class="text-[10px] text-slate-400">Onboard a new resident</p>
                        </div>
                      </button>
                      <button (click)="handleQuickAction('record-payment')" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500/10 dark:hover:bg-slate-700 hover:text-emerald-500 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all text-left text-sm group">
                        <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <i class="pi pi-indian-rupee"></i>
                        </div>
                        <div>
                          <p class="font-semibold text-xs">Record Payment</p>
                          <p class="text-[10px] text-slate-400">Log rent or utility receipt</p>
                        </div>
                      </button>
                      <button (click)="handleQuickAction('new-ticket')" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-500/10 dark:hover:bg-slate-700 hover:text-amber-500 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all text-left text-sm group">
                        <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <i class="pi pi-ticket"></i>
                        </div>
                        <div>
                          <p class="font-semibold text-xs">New Ticket</p>
                          <p class="text-[10px] text-slate-400">Log maintenance request</p>
                        </div>
                      </button>
                      <button (click)="handleQuickAction('print-report')" class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-cyan-500/10 dark:hover:bg-slate-700 hover:text-cyan-500 dark:hover:text-white text-slate-700 dark:text-slate-300 transition-all text-left text-sm group">
                        <div class="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <i class="pi pi-file"></i>
                        </div>
                        <div>
                          <p class="font-semibold text-xs">Print Report</p>
                          <p class="text-[10px] text-slate-400">Export active occupancy</p>
                        </div>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
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
      animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class SearchBar {
  query = signal('');
  isOpen = signal(false);
  results = signal<SearchResult[]>([]);
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  mockData: SearchResult[] = [
    { id: '1', type: 'Tenant', title: 'Nikunj Bavishiya', subtitle: 'Room 204B, Royal Heights PG', icon: 'pi-user', color: 'bg-indigo-500', route: '/owner/tenants' },
    { id: '2', type: 'Tenant', title: 'Aditya Patel', subtitle: 'Room 102A, Apex Elite PG', icon: 'pi-user', color: 'bg-indigo-500', route: '/owner/tenants' },
    { id: '3', type: 'Property', title: 'Royal Heights PG', subtitle: 'Sector 62, Noida (45 Beds)', icon: 'pi-building', color: 'bg-purple-500', route: '/owner/properties' },
    { id: '4', type: 'Property', title: 'Apex Elite PG', subtitle: 'HSR Layout, Bangalore (60 Beds)', icon: 'pi-building', color: 'bg-purple-500', route: '/owner/properties' },
    { id: '5', type: 'Invoice', title: 'INV-2026-0045', subtitle: 'Nikunj Bavishiya — Paid ₹12,500', icon: 'pi-file', color: 'bg-emerald-500', route: '/owner/payments' },
    { id: '6', type: 'Ticket', title: 'TKT-9902: AC Water Leakage', subtitle: 'Room 204B — High Priority', icon: 'pi-ticket', color: 'bg-amber-500', route: '/owner/tickets' }
  ];

  private router = inject(Router);
  private authService = inject(AuthService);

  constructor(private el: ElementRef) {
    // Focus search input when modal opens
    effect(() => {
      if (this.isOpen()) {
        setTimeout(() => {
          this.searchInput()?.nativeElement.focus();
        }, 50);
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
    }
    if (event.key === 'Escape' && this.isOpen()) {
      this.closeSearch();
    }
  }

  openSearch() {
    this.isOpen.set(true);
    this.query.set('');
    this.results.set([]);

    // Lift header z-index to overlay on top of all content stacking contexts
    const header = this.el.nativeElement.closest('header');
    if (header) {
      header.classList.add('!z-50');
    }
  }

  closeSearch() {
    this.isOpen.set(false);
    this.query.set('');
    this.results.set([]);

    // Restore header normal z-index position
    const header = this.el.nativeElement.closest('header');
    if (header) {
      header.classList.remove('!z-50');
    }
  }

  onSearch() {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      this.results.set([]);
      return;
    }
    const filtered = this.mockData.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.subtitle.toLowerCase().includes(q) || 
      item.type.toLowerCase().includes(q)
    );
    this.results.set(filtered);
  }

  navigate(route: string) {
    this.closeSearch();
    this.router.navigate([route]);
  }

  handleQuickAction(action: string) {
    const role = this.authService.currentUser()?.role || 'Owner';
    let route = '/owner/dashboard';

    if (action === 'add-tenant') {
      if (role === 'Owner') route = '/owner/tenants';
      else if (role === 'Caretaker') route = '/caretaker/check-in-out';
      else if (role === 'Warden') route = '/warden/attendance';
      else route = '/owner/tenants'; 
    } else if (action === 'record-payment') {
      if (role === 'Owner') route = '/owner/payments';
      else if (role === 'Accountant') route = '/accountant/payments';
      else if (role === 'Tenant') route = '/tenant/payments';
      else if (role === 'Parent') route = '/parent/payments';
      else route = '/owner/payments';
    } else if (action === 'new-ticket') {
      if (role === 'Owner') route = '/owner/maintenance/dashboard';
      else if (role === 'Caretaker') route = '/caretaker/tickets';
      else if (role === 'Tenant') route = '/tenant/tickets';
      else route = '/owner/maintenance/dashboard';
    } else if (action === 'print-report') {
      if (role === 'Owner') route = '/owner/reports';
      else if (role === 'Accountant') route = '/accountant/reports';
      else if (role === 'Enterprise') route = '/enterprise/reports';
      else route = '/owner/reports';
    }

    this.navigate(route);
  }
}
