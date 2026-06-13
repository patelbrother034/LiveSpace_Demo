import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { ButtonModule } from 'primeng/button';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeader, StatCard, StatusBadge, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Greeting Header -->
      <app-page-header [title]="'Welcome back, ' + tenantName()" subtitle="Your co-living dashboard — stay on top of rent, tickets, and more.">
        <button pButton label="Pay Rent" icon="pi pi-indian-rupee" routerLink="/tenant/payments"
          class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white hover:opacity-90"></button>
      </app-page-header>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Rent Due" [value]="rentDue()" icon="pi-indian-rupee" [color]="dueColor()" />
        <app-stat-card label="Days Stayed" [value]="daysStayed() + ' days'" icon="pi-calendar" color="info" />
        <app-stat-card label="My Room" [value]="myRoom()" icon="pi-home" color="primary" />
        <app-stat-card label="Open Tickets" [value]="openTicketCount() + ' active'" icon="pi-ticket" color="warning" />
      </div>

      <!-- Quick Actions -->
      <div>
        <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          @for (action of quickActions; track action.label) {
            <a [routerLink]="action.route"
               class="glass-card p-5 flex flex-col items-center gap-3 cursor-pointer hover:scale-[1.03] hover:shadow-lg transition-all duration-200 text-center group rounded-2xl">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110"
                   [class]="action.bgClass">
                <i [class]="'pi ' + action.icon + ' ' + action.colorClass"></i>
              </div>
              <span class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ action.label }}</span>
            </a>
          }
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Recent Transactions -->
        <div class="lg:col-span-2 glass-card p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">Recent Payments</h3>
            <a routerLink="/tenant/payments" class="text-xs font-bold text-emerald-500 hover:text-emerald-600 flex items-center gap-1">
              View All <i class="pi pi-arrow-right text-[10px]"></i>
            </a>
          </div>
          @if (recentTx().length === 0) {
            <div class="flex flex-col items-center py-8 text-center">
              <i class="pi pi-wallet text-3xl text-slate-300 dark:text-slate-600 mb-3"></i>
              <p class="text-sm text-slate-400">No payment records yet</p>
            </div>
          } @else {
            <div class="space-y-3">
              @for (tx of recentTx(); track tx.id) {
                <div class="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center"
                         [class]="tx.type === 'EXPENSE' || tx.type === 'REFUND' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500'">
                      <i [class]="tx.type === 'RENT' ? 'pi pi-home' : 'pi pi-wallet'"></i>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ tx.type }}</p>
                      <p class="text-[11px] text-slate-400">{{ tx.paymentDate || tx.createdAt }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-bold" [class]="tx.type === 'EXPENSE' || tx.type === 'REFUND' ? 'text-rose-500' : 'text-emerald-600'">
                      ₹{{ tx.amount | number }}
                    </p>
                    <app-status-badge [status]="tx.status" />
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Right Column: Tickets + Announcement -->
        <div class="space-y-6">
          <!-- Active Tickets -->
          <div class="glass-card p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-800 dark:text-white">My Tickets</h3>
              <a routerLink="/tenant/tickets" class="text-[11px] font-bold text-indigo-500 hover:text-indigo-600">View All</a>
            </div>
            @if (activeTickets().length === 0) {
              <div class="flex flex-col items-center py-6 text-center">
                <i class="pi pi-check-circle text-2xl text-emerald-400 mb-2"></i>
                <p class="text-xs text-slate-400">No open tickets</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (ticket of activeTickets(); track ticket.id) {
                  <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/30">
                    <div class="flex items-start justify-between gap-2">
                      <p class="text-xs font-semibold text-slate-800 dark:text-white">{{ ticket.title }}</p>
                      <app-status-badge [status]="ticket.status" />
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1">{{ ticket.createdAt }}</p>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Latest Announcement -->
          <div class="glass-card p-6">
            <h3 class="font-bold text-slate-800 dark:text-white mb-3">
              <i class="pi pi-megaphone text-indigo-500 mr-2"></i>Latest Notice
            </h3>
            @if (latestAnnouncement()) {
              <div class="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <p class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{{ latestAnnouncement().title }}</p>
                <p class="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5 leading-relaxed">{{ latestAnnouncement().message }}</p>
                <p class="text-[10px] text-slate-400 mt-2">{{ latestAnnouncement().createdAt }}</p>
              </div>
            } @else {
              <p class="text-xs text-slate-400 text-center py-4">No announcements</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class Dashboard implements OnInit {
  private crudService = inject(CrudService);

  tenantName = signal('Tenant');
  rentDue = signal('₹0');
  dueColor = signal<'success' | 'warning' | 'danger'>('success');
  daysStayed = signal(0);
  myRoom = signal('—');
  openTicketCount = signal(0);
  recentTx = signal<any[]>([]);
  activeTickets = signal<any[]>([]);
  latestAnnouncement = signal<any>(null);

  quickActions = [
    { label: 'Pay Rent', icon: 'pi-indian-rupee', route: '/tenant/payments', colorClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Raise Ticket', icon: 'pi-ticket', route: '/tenant/tickets', colorClass: 'text-amber-600 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Gate Pass', icon: 'pi-id-card', route: '/tenant/gate-pass', colorClass: 'text-indigo-600 dark:text-indigo-400', bgClass: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'My Room', icon: 'pi-home', route: '/tenant/room', colorClass: 'text-violet-600 dark:text-violet-400', bgClass: 'bg-violet-50 dark:bg-violet-950/30' },
  ];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const me = tenants.find((t: any) => t.status === 'Active') || tenants[0];
    if (!me) return;

    this.tenantName.set(me.fullName || `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'Tenant');

    const dues = me.pendingDues || 0;
    this.rentDue.set(dues > 0 ? `₹${dues.toLocaleString()}` : '₹0 — Paid');
    this.dueColor.set(dues === 0 ? 'success' : dues > me.monthlyRent ? 'danger' : 'warning');

    if (me.checkInDate) {
      const diffMs = Date.now() - new Date(me.checkInDate).getTime();
      this.daysStayed.set(Math.max(0, Math.floor(diffMs / 86400000)));
    }

    const rooms = this.crudService.getAll<any>(StorageKeys.ROOMS);
    const room = rooms.find((r: any) => r.id === me.roomId);
    this.myRoom.set(room ? `Room ${room.roomNumber}` : '—');

    // Recent transactions
    const txs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS)
      .filter((tx: any) => tx.tenantId === me.id)
      .sort((a: any, b: any) => (b.paymentDate || b.createdAt || '').localeCompare(a.paymentDate || a.createdAt || ''))
      .slice(0, 3);
    this.recentTx.set(txs);

    // Tickets
    const tickets = this.crudService.getAll<any>(StorageKeys.TICKETS)
      .filter((t: any) => t.tenantId === me.id && (t.status === 'Open' || t.status === 'In Progress'))
      .slice(0, 3);
    this.openTicketCount.set(tickets.length);
    this.activeTickets.set(tickets);

    // Latest announcement
    const announcements = this.crudService.getAll<any>(StorageKeys.ANNOUNCEMENTS)
      .sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (announcements.length > 0) {
      this.latestAnnouncement.set(announcements[0]);
    }
  }
}
