import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface EmergencyContact { name: string; number: string; icon: string; }
interface DrillRecord { id: string; date: string; type: string; duration: string; evacuationPct: number; notes: string; }
interface Broadcast { id: string; type: string; message: string; time: string; recipients: number; }

@Component({
  selector: 'app-warden-emergency',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule, DialogModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Emergency Dashboard" subtitle="Manage emergencies, drills, and safety protocols" />

      <!-- Active Alert Banner -->
      @if (activeAlert()) {
        <div class="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between animate-pulse-soft">
          <div class="flex items-center gap-3"><i class="pi pi-exclamation-triangle text-2xl"></i><div><h4 class="font-bold text-lg">{{ activeAlert() }}</h4><p class="text-sm text-white/80">Active emergency — all protocols engaged</p></div></div>
          <button pButton label="Stand Down" icon="pi pi-times" class="p-button-sm rounded-xl bg-white/20 border-white/30 text-white hover:bg-white/30" (click)="activeAlert.set(null)"></button>
        </div>
      }

      <!-- Emergency Action Buttons -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-bolt mr-2 text-red-500"></i>Emergency Actions</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          @for (btn of emergencyButtons; track btn.label) {
            <button class="p-4 rounded-2xl text-center text-white font-bold transition-all hover:scale-105 hover:shadow-xl cursor-pointer border-none"
              [style.background]="btn.gradient" (click)="triggerEmergency(btn.label)">
              <i [class]="btn.icon + ' text-2xl mb-2 block'"></i>
              <span class="text-xs">{{ btn.label }}</span>
            </button>
          }
        </div>
      </div>

      <!-- Emergency Contacts -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-phone mr-2 text-blue-500"></i>Emergency Contacts</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          @for (c of contacts; track c.name) {
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
              <i [class]="c.icon + ' text-lg text-indigo-500'"></i>
              <div><p class="text-xs font-bold text-slate-800 dark:text-white">{{ c.name }}</p><p class="text-[10px] text-slate-500 font-mono">{{ c.number }}</p></div>
            </div>
          }
        </div>
      </div>

      <!-- Drill Log -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-clipboard mr-2 text-amber-500"></i>Emergency Drill Log</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left">
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Duration</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Evacuation %</th>
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Notes</th>
            </tr></thead>
            <tbody>
              @for (d of drills(); track d.id) {
                <tr class="border-b border-slate-100 dark:border-slate-800">
                  <td class="p-3 text-slate-500">{{ d.date }}</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase">{{ d.type }}</span></td>
                  <td class="p-3 font-bold">{{ d.duration }}</td>
                  <td class="p-3">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full rounded-full" [class]="d.evacuationPct >= 90 ? 'bg-emerald-500' : d.evacuationPct >= 70 ? 'bg-amber-500' : 'bg-red-500'" [style.width.%]="d.evacuationPct"></div></div>
                      <span class="text-xs font-bold">{{ d.evacuationPct }}%</span>
                    </div>
                  </td>
                  <td class="p-3 text-xs text-slate-500">{{ d.notes }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Broadcast History -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-megaphone mr-2 text-purple-500"></i>Broadcast History</h4>
        <div class="space-y-2">
          @for (b of broadcasts(); track b.id) {
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center text-xs">
              <div class="flex items-center gap-3">
                <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600 uppercase">{{ b.type }}</span>
                <span class="text-slate-700 dark:text-slate-300">{{ b.message }}</span>
              </div>
              <div class="text-slate-400">{{ b.time }} · {{ b.recipients }} recipients</div>
            </div>
          }
        </div>
      </div>

      <!-- Confirm Dialog -->
      <p-dialog [(visible)]="confirmVisible" header="⚠️ Confirm Emergency Action" [modal]="true" [style]="{width: '420px'}" styleClass="rounded-2xl">
        <div class="space-y-4 pt-2">
          <p class="text-sm text-slate-600 dark:text-slate-400">Are you sure you want to trigger <b class="text-red-600">{{ pendingAction }}</b>? This will broadcast alerts to all residents and staff.</p>
          <div class="flex justify-end gap-2">
            <button pButton label="Cancel" class="p-button-text p-button-sm" (click)="confirmVisible = false"></button>
            <button pButton label="ACTIVATE" icon="pi pi-exclamation-triangle" class="p-button-sm p-button-danger rounded-lg" (click)="confirmEmergency()"></button>
          </div>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [``]
})
export class WardenEmergency {
  activeAlert = signal<string | null>(null);
  confirmVisible = false;
  pendingAction = '';

  emergencyButtons = [
    { label: 'Fire Evacuate', icon: 'pi pi-bolt', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    { label: 'Medical Alert', icon: 'pi pi-heart', gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
    { label: 'Lock Gates', icon: 'pi pi-lock', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
    { label: 'Evacuation', icon: 'pi pi-sign-out', gradient: 'linear-gradient(135deg, #ef4444, #991b1b)' },
    { label: 'Missing Person', icon: 'pi pi-search', gradient: 'linear-gradient(135deg, #ef4444, #be123c)' },
    { label: 'Utility Failure', icon: 'pi pi-power-off', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  ];

  contacts: EmergencyContact[] = [
    { name: 'Fire Department', number: '101', icon: 'pi pi-bolt' },
    { name: 'Ambulance', number: '108', icon: 'pi pi-heart' },
    { name: 'Police', number: '100', icon: 'pi pi-shield' },
    { name: 'City Hospital', number: '0120-456-7890', icon: 'pi pi-building' },
    { name: 'Management', number: '9876-543-210', icon: 'pi pi-phone' },
  ];

  drills = signal<DrillRecord[]>([
    { id: 'd1', date: 'May 28, 2026', type: 'Fire', duration: '8 min 32 sec', evacuationPct: 94, notes: 'All floors evacuated. 3rd floor delayed by 45s.' },
    { id: 'd2', date: 'Apr 15, 2026', type: 'Earthquake', duration: '6 min 18 sec', evacuationPct: 88, notes: 'Assembly point reached. Head count confirmed.' },
    { id: 'd3', date: 'Mar 10, 2026', type: 'Fire', duration: '7 min 05 sec', evacuationPct: 96, notes: 'Best drill performance this quarter.' },
    { id: 'd4', date: 'Feb 20, 2026', type: 'Medical', duration: '4 min 12 sec', evacuationPct: 100, notes: 'First aid team response time: 2 min 30 sec.' },
  ]);

  broadcasts = signal<Broadcast[]>([
    { id: 'b1', type: 'Drill', message: 'Monthly fire drill — please proceed to assembly points', time: 'May 28, 10:00 AM', recipients: 45 },
    { id: 'b2', type: 'Alert', message: 'Power outage expected 2-4 PM for maintenance', time: 'May 20, 9:00 AM', recipients: 52 },
    { id: 'b3', type: 'Info', message: 'Water supply interruption tomorrow 6-8 AM', time: 'May 15, 6:00 PM', recipients: 52 },
  ]);

  triggerEmergency(action: string) { this.pendingAction = action; this.confirmVisible = true; }
  confirmEmergency() {
    this.activeAlert.set(this.pendingAction);
    this.broadcasts.update(list => [{ id: 'b' + Date.now(), type: 'Emergency', message: this.pendingAction + ' protocol activated', time: 'Just now', recipients: 52 }, ...list]);
    this.confirmVisible = false;
  }
}
