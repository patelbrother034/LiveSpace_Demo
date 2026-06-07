import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface TenantDue {
  id: string; name: string; room: string; bed: string; monthlyRent: number; dueAmount: number; phone: string;
}
interface Collection {
  id: string; tenantName: string; room: string; amount: number; mode: string; time: string; reference: string;
}

@Component({
  selector: 'app-caretaker-rent-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Quick Rent Collection" subtitle="Collect rent payments from tenants on the spot" />

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase">Collected Today</p>
          <p class="text-xl font-extrabold text-emerald-600 mt-1">₹{{ todayTotal() | number:'1.0-0' }}</p>
        </div>
        <div class="glass-card p-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase">Pending Dues</p>
          <p class="text-xl font-extrabold text-red-500 mt-1">₹{{ pendingTotal() | number:'1.0-0' }}</p>
        </div>
        <div class="glass-card p-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase">Tenants Paid</p>
          <p class="text-xl font-extrabold text-indigo-600 mt-1">{{ collections().length }}</p>
        </div>
        <div class="glass-card p-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase">Target</p>
          <p class="text-xl font-extrabold text-purple-600 mt-1">{{ targetProgress() }}%</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tenant Search & Pay -->
        <div class="space-y-4">
          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-search mr-2 text-indigo-500"></i>Find Tenant</h4>
            <div class="relative">
              <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input pInputText placeholder="Search by name or room..." class="w-full !pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60"
                [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
            </div>
          </div>

          @for (t of filteredTenants(); track t.id) {
            <div class="glass-card p-5 space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer"
              [class.ring-2]="selectedTenant()?.id === t.id" [class.ring-indigo-500]="selectedTenant()?.id === t.id"
              (click)="selectTenant(t)">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-slate-800 dark:text-white">{{ t.name }}</h4>
                  <p class="text-xs text-slate-500">{{ t.room }} · Bed {{ t.bed }}</p>
                </div>
                <span class="text-lg font-extrabold" [class]="t.dueAmount > 0 ? 'text-red-500' : 'text-emerald-500'">₹{{ t.dueAmount | number:'1.0-0' }}</span>
              </div>
              @if (selectedTenant()?.id === t.id) {
                <div class="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                      <input pInputText type="number" class="w-full rounded-lg text-sm" [(ngModel)]="payAmount" />
                    </div>
                    <div>
                      <label class="text-[10px] font-bold text-slate-400 uppercase">Mode</label>
                      <select class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" [(ngModel)]="payMode">
                        <option>UPI</option><option>Cash</option><option>Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  <button pButton label="Collect ₹{{payAmount}}" icon="pi pi-check" class="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white" (click)="collectRent(t)"></button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Recent Collections -->
        <div class="glass-card p-5 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-history mr-2 text-emerald-500"></i>Today's Collections</h4>
          <div class="space-y-3 max-h-[500px] overflow-y-auto">
            @for (c of collections(); track c.id) {
              <div class="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-xs space-y-1">
                <div class="flex justify-between"><span class="font-bold text-slate-800 dark:text-white">{{ c.tenantName }}</span><span class="font-extrabold text-emerald-600">₹{{ c.amount | number:'1.0-0' }}</span></div>
                <div class="flex justify-between text-slate-400"><span>{{ c.room }} · {{ c.mode }}</span><span>{{ c.time }}</span></div>
              </div>
            } @empty {
              <p class="text-center text-xs text-slate-400 italic py-8">No collections yet today</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class CaretakerRentEntry {
  searchQuery = signal('');
  selectedTenant = signal<TenantDue | null>(null);
  payAmount = 0;
  payMode = 'UPI';

  tenants = signal<TenantDue[]>([
    { id: 't1', name: 'Rahul Sharma', room: 'Room 301', bed: 'A', monthlyRent: 8500, dueAmount: 8500, phone: '9876543210' },
    { id: 't2', name: 'Priya Patel', room: 'Room 205', bed: 'B', monthlyRent: 7500, dueAmount: 7500, phone: '9876543211' },
    { id: 't3', name: 'Amit Kumar', room: 'Room 102', bed: 'A', monthlyRent: 10000, dueAmount: 10000, phone: '9876543212' },
    { id: 't4', name: 'Sneha Reddy', room: 'Room 403', bed: 'C', monthlyRent: 6500, dueAmount: 0, phone: '9876543213' },
    { id: 't5', name: 'Vikram Singh', room: 'Room 304', bed: 'B', monthlyRent: 8500, dueAmount: 17000, phone: '9876543214' },
  ]);

  collections = signal<Collection[]>([
    { id: 'c1', tenantName: 'Deepak Verma', room: 'Room 201', amount: 8500, mode: 'UPI', time: '10:30 AM', reference: 'UPI98732' },
    { id: 'c2', tenantName: 'Kavita Nair', room: 'Room 105', amount: 7500, mode: 'Cash', time: '11:15 AM', reference: 'CASH001' },
    { id: 'c3', tenantName: 'Rohan Das', room: 'Room 302', amount: 10000, mode: 'Bank Transfer', time: '12:00 PM', reference: 'NEFT452' },
  ]);

  filteredTenants = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const list = this.tenants().filter(t => t.dueAmount > 0);
    if (!q) return list;
    return list.filter(t => t.name.toLowerCase().includes(q) || t.room.toLowerCase().includes(q));
  });

  todayTotal = computed(() => this.collections().reduce((s, c) => s + c.amount, 0));
  pendingTotal = computed(() => this.tenants().reduce((s, t) => s + t.dueAmount, 0));
  targetProgress = computed(() => { const target = 150000; return Math.min(100, Math.round((this.todayTotal() / target) * 100)); });

  selectTenant(t: TenantDue) { this.selectedTenant.set(t); this.payAmount = t.dueAmount; }

  collectRent(t: TenantDue) {
    this.collections.update(list => [{ id: 'c' + Date.now(), tenantName: t.name, room: t.room, amount: this.payAmount, mode: this.payMode, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), reference: this.payMode.substring(0, 3).toUpperCase() + Date.now().toString().slice(-5) }, ...list]);
    this.tenants.update(list => list.map(x => x.id === t.id ? { ...x, dueAmount: Math.max(0, x.dueAmount - this.payAmount) } : x));
    this.selectedTenant.set(null);
  }
}
