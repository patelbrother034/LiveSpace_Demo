import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

interface Visitor {
  id: string; name: string; phone: string; purpose: string; visitingTenant: string; room: string; idProof: string; checkIn: string; checkOut: string; status: string;
}

@Component({
  selector: 'app-warden-visitors',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, DialogModule, InputTextModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Visitor Management" subtitle="Track and manage all visitors entering the premises">
        <button pButton label="Check-In Visitor" icon="pi pi-user-plus" class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white" (click)="showCheckIn.set(true)"></button>
      </app-page-header>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Today</p><p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{{ allVisitors().length }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Inside Now</p><p class="text-xl font-extrabold text-emerald-600 mt-1">{{ activeVisitors().length }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Avg Duration</p><p class="text-xl font-extrabold text-indigo-600 mt-1">42 min</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Pending Checkout</p><p class="text-xl font-extrabold text-amber-600 mt-1">{{ activeVisitors().length }}</p></div>
      </div>

      <!-- Active Visitors -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-users mr-2 text-emerald-500"></i>Currently Inside</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left">
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Purpose</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Visiting</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Room</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Check-In</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr></thead>
            <tbody>
              @for (v of activeVisitors(); track v.id) {
                <tr class="border-b border-slate-100 dark:border-slate-800">
                  <td class="p-3 font-bold text-slate-800 dark:text-white">{{ v.name }}</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 uppercase">{{ v.purpose }}</span></td>
                  <td class="p-3 text-slate-600 dark:text-slate-400">{{ v.visitingTenant }}</td>
                  <td class="p-3 text-slate-600 dark:text-slate-400">{{ v.room }}</td>
                  <td class="p-3 text-slate-500">{{ v.checkIn }}</td>
                  <td class="p-3"><button pButton label="Check-Out" icon="pi pi-sign-out" class="p-button-sm p-button-outlined rounded-lg" (click)="checkOutVisitor(v.id)"></button></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="p-8 text-center text-slate-400 italic">No visitors currently inside</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Completed Visits -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-history mr-2 text-slate-400"></i>Completed Visits Today</h4>
        <div class="space-y-2">
          @for (v of completedVisitors(); track v.id) {
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center text-xs">
              <div><span class="font-bold text-slate-700 dark:text-slate-300">{{ v.name }}</span> · {{ v.purpose }} · {{ v.visitingTenant }}</div>
              <div class="text-slate-400">{{ v.checkIn }} → {{ v.checkOut }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Check-In Dialog -->
      <p-dialog [(visible)]="showCheckIn" header="Visitor Check-In" [modal]="true" [style]="{width: '480px'}" styleClass="rounded-2xl">
        <div class="space-y-4 pt-2">
          <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Visitor Name</label><input pInputText class="w-full rounded-lg" [(ngModel)]="newVisitor.name" /></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Phone</label><input pInputText class="w-full rounded-lg" [(ngModel)]="newVisitor.phone" /></div>
            <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Purpose</label>
              <select class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" [(ngModel)]="newVisitor.purpose">
                <option>Personal</option><option>Delivery</option><option>Medical</option><option>Official</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">Visiting Tenant</label><input pInputText class="w-full rounded-lg" [(ngModel)]="newVisitor.visitingTenant" /></div>
            <div><label class="block text-xs font-bold text-slate-500 mb-1 uppercase">ID Proof</label>
              <select class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" [(ngModel)]="newVisitor.idProof">
                <option>Aadhaar</option><option>Driving License</option><option>PAN Card</option><option>Passport</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button pButton label="Cancel" class="p-button-text p-button-sm" (click)="showCheckIn.set(false)"></button>
            <button pButton label="Check-In" icon="pi pi-check" class="p-button-sm rounded-lg bg-indigo-600 border-indigo-600" (click)="checkInVisitor()"></button>
          </div>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [``]
})
export class WardenVisitors {
  showCheckIn = signal(false);
  newVisitor = { name: '', phone: '', purpose: 'Personal', visitingTenant: '', idProof: 'Aadhaar' };

  allVisitors = signal<Visitor[]>([
    { id: 'v1', name: 'Rajesh Gupta', phone: '9876543210', purpose: 'Personal', visitingTenant: 'Rahul Sharma', room: '301', idProof: 'Aadhaar', checkIn: '10:30 AM', checkOut: '', status: 'Inside' },
    { id: 'v2', name: 'Delivery Boy (Swiggy)', phone: '9812345678', purpose: 'Delivery', visitingTenant: 'Priya Patel', room: '205', idProof: 'Driving License', checkIn: '11:15 AM', checkOut: '', status: 'Inside' },
    { id: 'v3', name: 'Dr. Anjali Mehta', phone: '9898765432', purpose: 'Medical', visitingTenant: 'Amit Kumar', room: '102', idProof: 'PAN Card', checkIn: '09:00 AM', checkOut: '', status: 'Inside' },
    { id: 'v4', name: 'Sunita Sharma', phone: '9876541234', purpose: 'Personal', visitingTenant: 'Rahul Sharma', room: '301', idProof: 'Aadhaar', checkIn: '08:30 AM', checkOut: '09:45 AM', status: 'Left' },
    { id: 'v5', name: 'Courier (BlueDart)', phone: '1800123456', purpose: 'Delivery', visitingTenant: 'Deepak Verma', room: '201', idProof: 'Driving License', checkIn: '09:30 AM', checkOut: '09:35 AM', status: 'Left' },
    { id: 'v6', name: 'Plumber (Maintenance)', phone: '9871234560', purpose: 'Official', visitingTenant: 'Warden Office', room: 'N/A', idProof: 'Aadhaar', checkIn: '08:00 AM', checkOut: '10:00 AM', status: 'Left' },
  ]);

  activeVisitors = computed(() => this.allVisitors().filter(v => v.status === 'Inside'));
  completedVisitors = computed(() => this.allVisitors().filter(v => v.status === 'Left'));

  checkInVisitor() {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    this.allVisitors.update(list => [{ id: 'v' + Date.now(), ...this.newVisitor, room: '—', checkIn: now, checkOut: '', status: 'Inside' }, ...list]);
    this.newVisitor = { name: '', phone: '', purpose: 'Personal', visitingTenant: '', idProof: 'Aadhaar' };
    this.showCheckIn.set(false);
  }

  checkOutVisitor(id: string) {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    this.allVisitors.update(list => list.map(v => v.id === id ? { ...v, checkOut: now, status: 'Left' } : v));
  }
}
