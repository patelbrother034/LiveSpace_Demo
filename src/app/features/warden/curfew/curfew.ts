import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface CurfewViolation {
  id: string; name: string; room: string; lastSeen: string; duration: string; parentNotified: boolean; date: string; timeIn: string; minutesLate: number; actionTaken: string;
}

@Component({
  selector: 'app-warden-curfew',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Curfew Monitor" subtitle="Track curfew compliance and manage violations" />

      <!-- Configuration -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-cog mr-2 text-slate-400"></i>Curfew Configuration</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <label class="text-[10px] font-bold text-slate-400 uppercase">Curfew Time</label>
            <p class="text-lg font-extrabold text-red-600 mt-1">{{ curfewTime }}</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <label class="text-[10px] font-bold text-slate-400 uppercase">Grace Period</label>
            <p class="text-lg font-extrabold text-amber-600 mt-1">{{ gracePeriod }} minutes</p>
          </div>
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <div><label class="text-[10px] font-bold text-slate-400 uppercase">Auto-Notify Parents</label><p class="text-sm font-bold text-slate-800 dark:text-white mt-1">{{ autoNotify ? 'Enabled' : 'Disabled' }}</p></div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [(ngModel)]="autoNotify" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Curfew Time</p><p class="text-xl font-extrabold text-red-600 mt-1">{{ curfewTime }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Violations Today</p><p class="text-xl font-extrabold text-amber-600 mt-1">{{ currentViolations().length }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">This Week</p><p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{{ historyViolations().length }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Repeat Offenders</p><p class="text-xl font-extrabold text-red-500 mt-1">2</p></div>
      </div>

      <!-- Currently Out -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-exclamation-triangle mr-2 text-red-500"></i>Still Out After Curfew</h4>
        @if (currentViolations().length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left">
                <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Room</th>
                <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Last Seen</th>
                <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Duration</th>
                <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Parent Notified</th>
                <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr></thead>
              <tbody>
                @for (v of currentViolations(); track v.id) {
                  <tr class="border-b border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/10">
                    <td class="p-3 font-bold text-slate-800 dark:text-white">{{ v.name }}</td>
                    <td class="p-3">{{ v.room }}</td>
                    <td class="p-3 text-slate-500">{{ v.lastSeen }}</td>
                    <td class="p-3 font-bold text-red-600">{{ v.duration }}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold" [class]="v.parentNotified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">{{ v.parentNotified ? 'Yes' : 'No' }}</span></td>
                    <td class="p-3"><button pButton label="Notify Parent" icon="pi pi-phone" class="p-button-sm p-button-outlined p-button-danger rounded-lg" (click)="notifyParent(v.id)" [disabled]="v.parentNotified"></button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="p-8 text-center text-emerald-500"><i class="pi pi-check-circle text-3xl mb-2"></i><p class="text-sm font-bold">All residents are inside. No violations.</p></div>
        }
      </div>

      <!-- History -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-history mr-2 text-slate-400"></i>Violation History</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left">
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Tenant</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Time In</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Minutes Late</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr></thead>
            <tbody>
              @for (v of historyViolations(); track v.id) {
                <tr class="border-b border-slate-100 dark:border-slate-800">
                  <td class="p-3 text-slate-500">{{ v.date }}</td>
                  <td class="p-3 font-bold text-slate-800 dark:text-white">{{ v.name }}</td>
                  <td class="p-3">{{ v.timeIn }}</td>
                  <td class="p-3 font-bold" [class]="v.minutesLate > 30 ? 'text-red-600' : 'text-amber-600'">+{{ v.minutesLate }} min</td>
                  <td class="p-3 text-xs text-slate-500">{{ v.actionTaken }}</td>
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
export class WardenCurfew {
  curfewTime = '11:00 PM';
  gracePeriod = 15;
  autoNotify = true;

  currentViolations = signal<CurfewViolation[]>([
    { id: 'cv1', name: 'Vikram Singh', room: '304', lastSeen: 'Gate Exit 10:45 PM', duration: '35 min', parentNotified: false, date: '', timeIn: '', minutesLate: 0, actionTaken: '' },
    { id: 'cv2', name: 'Rohan Das', room: '404', lastSeen: 'Gate Exit 9:30 PM', duration: '1h 50min', parentNotified: true, date: '', timeIn: '', minutesLate: 0, actionTaken: '' },
    { id: 'cv3', name: 'Karthik Iyer', room: '203', lastSeen: 'Gate Exit 10:55 PM', duration: '25 min', parentNotified: false, date: '', timeIn: '', minutesLate: 0, actionTaken: '' },
  ]);

  historyViolations = signal<CurfewViolation[]>([
    { id: 'hv1', name: 'Vikram Singh', room: '304', lastSeen: '', duration: '', parentNotified: true, date: 'Jun 2', timeIn: '11:42 PM', minutesLate: 42, actionTaken: 'Warning issued, parent notified' },
    { id: 'hv2', name: 'Rohan Das', room: '404', lastSeen: '', duration: '', parentNotified: true, date: 'Jun 1', timeIn: '12:15 AM', minutesLate: 75, actionTaken: 'Written warning, parent called' },
    { id: 'hv3', name: 'Amit Kumar', room: '102', lastSeen: '', duration: '', parentNotified: false, date: 'May 30', timeIn: '11:18 PM', minutesLate: 18, actionTaken: 'Verbal warning' },
    { id: 'hv4', name: 'Vikram Singh', room: '304', lastSeen: '', duration: '', parentNotified: true, date: 'May 28', timeIn: '11:55 PM', minutesLate: 55, actionTaken: 'Warning + parent notified' },
    { id: 'hv5', name: 'Sneha Reddy', room: '403', lastSeen: '', duration: '', parentNotified: false, date: 'May 25', timeIn: '11:12 PM', minutesLate: 12, actionTaken: 'Within grace period - noted' },
    { id: 'hv6', name: 'Deepak Verma', room: '201', lastSeen: '', duration: '', parentNotified: false, date: 'May 22', timeIn: '11:20 PM', minutesLate: 20, actionTaken: 'Verbal warning' },
  ]);

  notifyParent(id: string) {
    this.currentViolations.update(list => list.map(v => v.id === id ? { ...v, parentNotified: true } : v));
  }
}
