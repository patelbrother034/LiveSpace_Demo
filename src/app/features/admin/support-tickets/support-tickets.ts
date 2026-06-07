import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface Ticket { id: string; ticketId: string; organization: string; subject: string; priority: string; status: string; assignedTo: string; created: string; }

@Component({
  selector: 'app-admin-support-tickets',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="Support Tickets" subtitle="Customer support queue and resolution tracking" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Open Tickets</p><p class="text-xl font-extrabold text-amber-600 mt-1">{{ openCount() }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Avg Response</p><p class="text-xl font-extrabold text-blue-600 mt-1">2.4 hrs</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Resolution Rate</p><p class="text-xl font-extrabold text-emerald-600 mt-1">94%</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Escalated</p><p class="text-xl font-extrabold text-red-500 mt-1">{{ escalatedCount() }}</p></div>
      </div>
      <div class="glass-card overflow-hidden"><div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
            <th class="p-3 text-xs font-semibold text-slate-500 uppercase">ID</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Organization</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Subject</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Priority</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Status</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Assigned</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Created</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
          </tr></thead>
          <tbody>
            @for (t of tickets(); track t.id) {
              <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="p-3 font-mono font-bold text-indigo-600">{{ t.ticketId }}</td>
                <td class="p-3 font-medium text-slate-800 dark:text-white">{{ t.organization }}</td>
                <td class="p-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{{ t.subject }}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="t.priority === 'Critical' ? 'bg-red-100 text-red-700' : t.priority === 'High' ? 'bg-orange-100 text-orange-700' : t.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">{{ t.priority }}</span></td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="t.status === 'Open' ? 'bg-blue-100 text-blue-700' : t.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : t.status === 'Waiting' ? 'bg-amber-100 text-amber-700' : t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'">{{ t.status }}</span></td>
                <td class="p-3 text-slate-500">{{ t.assignedTo }}</td>
                <td class="p-3 text-xs text-slate-400">{{ t.created }}</td>
                <td class="p-3"><button pButton icon="pi pi-eye" class="p-button-sm p-button-text p-button-rounded"></button></td>
              </tr>
            }
          </tbody>
        </table>
      </div></div>
    </div>
  `, styles: [``]
})
export class AdminSupportTickets {
  tickets = signal<Ticket[]>([
    { id: 's1', ticketId: 'SUP-1042', organization: 'Sunrise PG', subject: 'Unable to generate GST report for May', priority: 'High', status: 'Open', assignedTo: 'Amit (L2)', created: 'Jun 3, 15:00' },
    { id: 's2', ticketId: 'SUP-1041', organization: 'Green Valley', subject: 'Tenant check-in wizard not saving data', priority: 'Critical', status: 'In Progress', assignedTo: 'Priya (L2)', created: 'Jun 3, 12:30' },
    { id: 's3', ticketId: 'SUP-1040', organization: 'StudyNest', subject: 'Request to add custom payment mode', priority: 'Low', status: 'Waiting', assignedTo: 'Rohit (L1)', created: 'Jun 2, 18:00' },
    { id: 's4', ticketId: 'SUP-1039', organization: 'Metro Living', subject: 'Dashboard loading slowly on mobile', priority: 'Medium', status: 'In Progress', assignedTo: 'Amit (L2)', created: 'Jun 2, 14:00' },
    { id: 's5', ticketId: 'SUP-1038', organization: 'CampusStay', subject: 'Bulk SMS feature not working', priority: 'High', status: 'Open', assignedTo: 'Unassigned', created: 'Jun 2, 11:30' },
    { id: 's6', ticketId: 'SUP-1037', organization: 'Sunrise PG', subject: 'Invoice print layout broken in Chrome', priority: 'Medium', status: 'Resolved', assignedTo: 'Priya (L2)', created: 'Jun 1, 16:00' },
    { id: 's7', ticketId: 'SUP-1036', organization: 'Green Valley', subject: 'Need API documentation for integration', priority: 'Low', status: 'Resolved', assignedTo: 'Rohit (L1)', created: 'Jun 1, 10:00' },
    { id: 's8', ticketId: 'SUP-1035', organization: 'Metro Living', subject: 'White-label domain not resolving', priority: 'Critical', status: 'Open', assignedTo: 'Amit (L2)', created: 'May 31, 22:00' },
  ]);
  openCount = computed(() => this.tickets().filter(t => t.status === 'Open' || t.status === 'In Progress').length);
  escalatedCount = computed(() => this.tickets().filter(t => t.priority === 'Critical' && t.status !== 'Resolved').length);
}
