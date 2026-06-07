import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface TenantAttendance {
  id: string; name: string; room: string; bed: string; floor: number; status: string;
}

@Component({
  selector: 'app-caretaker-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Attendance" subtitle="Mark daily tenant attendance">
        <button pButton label="Mark All Present" icon="pi pi-check-circle" class="p-button-sm rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-none text-white" (click)="markAllPresent()"></button>
      </app-page-header>

      <div class="glass-card p-4 flex items-center gap-4">
        <i class="pi pi-calendar text-indigo-500"></i>
        <span class="font-bold text-slate-800 dark:text-white">{{ today }}</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase">Total</p>
          <p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{{ tenants().length }}</p>
        </div>
        <div class="glass-card p-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase">Present</p>
          <p class="text-xl font-extrabold text-emerald-600 mt-1">{{ presentCount() }}</p>
        </div>
        <div class="glass-card p-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase">Absent</p>
          <p class="text-xl font-extrabold text-red-500 mt-1">{{ absentCount() }}</p>
        </div>
        <div class="glass-card p-4 text-center">
          <p class="text-[10px] font-bold text-slate-400 uppercase">On Leave</p>
          <p class="text-xl font-extrabold text-amber-600 mt-1">{{ leaveCount() }}</p>
        </div>
      </div>

      <!-- Floor-wise Summary -->
      <div class="glass-card p-5 space-y-3">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Floor-wise Summary</h4>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          @for (f of floorSummary(); track f.floor) {
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Floor {{ f.floor }}</p>
              <p class="text-sm font-bold text-slate-800 dark:text-white">{{ f.present }}/{{ f.total }}</p>
              <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div class="h-full rounded-full bg-emerald-500 transition-all" [style.width.%]="f.total ? (f.present/f.total)*100 : 0"></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Tenant List -->
      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700">
                <th class="p-4 text-left font-semibold text-slate-500 text-xs uppercase">Tenant</th>
                <th class="p-4 text-left font-semibold text-slate-500 text-xs uppercase">Room</th>
                <th class="p-4 text-left font-semibold text-slate-500 text-xs uppercase">Floor</th>
                <th class="p-4 text-left font-semibold text-slate-500 text-xs uppercase">Status</th>
                <th class="p-4 text-center font-semibold text-slate-500 text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (t of tenants(); track t.id) {
                <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td class="p-4 font-bold text-slate-800 dark:text-white">{{ t.name }}</td>
                  <td class="p-4 text-slate-600 dark:text-slate-400">{{ t.room }} ({{ t.bed }})</td>
                  <td class="p-4 text-slate-600 dark:text-slate-400">{{ t.floor }}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                      [class]="t.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : t.status === 'Leave' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                      {{ t.status }}
                    </span>
                  </td>
                  <td class="p-4 text-center">
                    <div class="flex justify-center gap-1">
                      <button pButton icon="pi pi-check" class="p-button-rounded p-button-sm" [class]="t.status === 'Present' ? 'bg-emerald-500 border-emerald-500 text-white' : 'p-button-outlined'" (click)="setStatus(t.id, 'Present')"></button>
                      <button pButton icon="pi pi-times" class="p-button-rounded p-button-sm" [class]="t.status === 'Absent' ? 'bg-red-500 border-red-500 text-white' : 'p-button-outlined'" (click)="setStatus(t.id, 'Absent')"></button>
                      <button pButton icon="pi pi-calendar" class="p-button-rounded p-button-sm" [class]="t.status === 'Leave' ? 'bg-amber-500 border-amber-500 text-white' : 'p-button-outlined'" (click)="setStatus(t.id, 'Leave')"></button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class CaretakerAttendance {
  today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  tenants = signal<TenantAttendance[]>([
    { id: 'a1', name: 'Rahul Sharma', room: 'Room 301', bed: 'A', floor: 3, status: 'Present' },
    { id: 'a2', name: 'Priya Patel', room: 'Room 205', bed: 'B', floor: 2, status: 'Present' },
    { id: 'a3', name: 'Amit Kumar', room: 'Room 102', bed: 'A', floor: 1, status: 'Absent' },
    { id: 'a4', name: 'Sneha Reddy', room: 'Room 403', bed: 'C', floor: 4, status: 'Present' },
    { id: 'a5', name: 'Vikram Singh', room: 'Room 304', bed: 'B', floor: 3, status: 'Leave' },
    { id: 'a6', name: 'Kavita Nair', room: 'Room 105', bed: 'A', floor: 1, status: 'Present' },
    { id: 'a7', name: 'Deepak Verma', room: 'Room 201', bed: 'A', floor: 2, status: 'Present' },
    { id: 'a8', name: 'Ananya Gupta', room: 'Room 302', bed: 'C', floor: 3, status: 'Present' },
    { id: 'a9', name: 'Rohan Das', room: 'Room 404', bed: 'A', floor: 4, status: 'Absent' },
    { id: 'a10', name: 'Meera Joshi', room: 'Room 103', bed: 'B', floor: 1, status: 'Present' },
  ]);

  presentCount = computed(() => this.tenants().filter(t => t.status === 'Present').length);
  absentCount = computed(() => this.tenants().filter(t => t.status === 'Absent').length);
  leaveCount = computed(() => this.tenants().filter(t => t.status === 'Leave').length);

  floorSummary = computed(() => {
    const floors = [1, 2, 3, 4];
    return floors.map(f => {
      const fl = this.tenants().filter(t => t.floor === f);
      return { floor: f, total: fl.length, present: fl.filter(t => t.status === 'Present').length };
    });
  });

  setStatus(id: string, status: string) {
    this.tenants.update(list => list.map(t => t.id === id ? { ...t, status } : t));
  }

  markAllPresent() {
    this.tenants.update(list => list.map(t => ({ ...t, status: 'Present' })));
  }
}
