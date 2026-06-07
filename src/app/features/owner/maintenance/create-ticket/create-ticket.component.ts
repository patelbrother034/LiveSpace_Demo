import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { generateId } from '../../../../utilities/id-generator.util';

interface Property {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface Tenant {
  id: string;
  fullName: string;
}

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Raise Maintenance Ticket" subtitle="Create a new service or repair ticket for your properties">
        <button pButton label="Back to Dashboard" icon="pi pi-arrow-left" (click)="navigateBack()"
          class="p-button-sm p-button-outlined rounded-xl border-slate-300 text-slate-700 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
        </button>
      </app-page-header>

      <!-- Ticket Creation Form -->
      <div class="glass-card p-8 relative overflow-hidden">
        <!-- Visual Accent Glow -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <form (ngSubmit)="onSubmit()" class="space-y-6 relative z-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Property Location Selection -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Property Location *</label>
              <select required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
                [(ngModel)]="form.propertyId" name="propertyId">
                <option value="" disabled>Select Property</option>
                @for (prop of properties(); track prop.id) {
                  <option [value]="prop.id">{{ prop.name }}</option>
                }
              </select>
            </div>

            <!-- Category Selection -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category *</label>
              <select required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
                [(ngModel)]="form.category" name="category">
                <option value="" disabled>Select Category</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Furniture">Furniture</option>
                <option value="Cleaning">Cleaning</option>
                <option value="AC/Heating">AC/Heating</option>
                <option value="WiFi/IT">WiFi/IT</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <!-- Priority Level -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Priority *</label>
              <select required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
                [(ngModel)]="form.priority" name="priority">
                <option value="" disabled>Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <!-- Room / Bed (Optional text input for specific detail) -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Room / Bed Number (Optional)</label>
              <input type="text" pInputText
                placeholder="e.g. Room A-102"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                [(ngModel)]="form.roomDetail" name="roomDetail" />
            </div>
          </div>

          <!-- Reported By selection -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reported By *</label>
              <select required
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
                [(ngModel)]="form.reportedBy" name="reportedBy" (change)="onReporterChange()">
                <option value="" disabled>Select Resident</option>
                @for (tenant of tenants(); track tenant.id) {
                  <option [value]="tenant.id">{{ tenant.fullName }}</option>
                }
                <option value="other">Other / Staff</option>
              </select>
            </div>

            <!-- Staff Assignee -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assign Technician / Caretaker</label>
              <select
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
                [(ngModel)]="form.assigneeId" name="assigneeId" (change)="onAssigneeChange()">
                <option value="">Leave Unassigned</option>
                @for (s of staff(); track s.id) {
                  <option [value]="s.id">{{ s.name }} ({{ s.role }})</option>
                }
              </select>
            </div>
          </div>

          <!-- Custom Reporter Name if 'other' is selected -->
          @if (form.reportedBy === 'other') {
            <div class="space-y-2 animate-slide-down">
              <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reporter Name *</label>
              <input type="text" pInputText required
                placeholder="Enter name of reporter"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                [(ngModel)]="form.customReporterName" name="customReporterName" />
            </div>
          }

          <!-- Ticket Title -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Issue Title *</label>
            <input type="text" pInputText required
              placeholder="e.g. WiFi router in lobby not working"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [(ngModel)]="form.title" name="title" />
          </div>

          <!-- Ticket Description -->
          <div class="space-y-2">
            <label class="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Detailed Description *</label>
            <textarea required rows="4"
              placeholder="Provide context, error codes, specific symptoms or steps to replicate..."
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [(ngModel)]="form.description" name="description"></textarea>
          </div>

          <!-- Submit Buttons -->
          <div class="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" pButton label="Cancel" (click)="navigateBack()"
              class="p-button-text p-button-sm rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            </button>
            <button type="submit" pButton label="Submit Ticket"
              class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90 px-6 py-2.5 shadow-md shadow-indigo-500/25">
            </button>
          </div>
        </form>
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
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-down {
      animation: slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class CreateTicket implements OnInit {
  private router = inject(Router);
  private crudService = inject(CrudService);

  properties = signal<Property[]>([]);
  staff = signal<Staff[]>([]);
  tenants = signal<Tenant[]>([]);

  form = {
    propertyId: '',
    category: '',
    priority: '',
    roomDetail: '',
    reportedBy: '',
    reportedByName: '',
    customReporterName: '',
    assigneeId: '',
    assigneeName: '',
    title: '',
    description: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Load active properties, staff, and tenants from local storage
    const props = this.crudService.getAll<Property>(StorageKeys.PROPERTIES);
    this.properties.set(props);

    const staffMembers = this.crudService.getAll<Staff>(StorageKeys.STAFF);
    this.staff.set(staffMembers);

    const residents = this.crudService.getAll<Tenant>(StorageKeys.TENANTS);
    this.tenants.set(residents);
  }

  onReporterChange() {
    if (this.form.reportedBy === 'other') {
      this.form.reportedByName = '';
    } else {
      const selected = this.tenants().find(t => t.id === this.form.reportedBy);
      this.form.reportedByName = selected ? selected.fullName : '';
    }
  }

  onAssigneeChange() {
    if (this.form.assigneeId) {
      const selected = this.staff().find(s => s.id === this.form.assigneeId);
      this.form.assigneeName = selected ? selected.name : '';
    } else {
      this.form.assigneeName = '';
    }
  }

  onSubmit() {
    // Basic validation
    if (!this.form.propertyId || !this.form.category || !this.form.priority || !this.form.reportedBy || !this.form.title || !this.form.description) {
      return;
    }

    const reporterName = this.form.reportedBy === 'other' ? this.form.customReporterName : this.form.reportedByName;
    const propertyObj = this.properties().find(p => p.id === this.form.propertyId);
    const locationStr = propertyObj ? `${propertyObj.name} ${this.form.roomDetail ? '• ' + this.form.roomDetail : ''}`.trim() : 'Co-Living Property';

    const newTicket = {
      id: generateId('ticket'),
      orgId: 'org-001',
      propertyId: this.form.propertyId,
      category: this.form.category,
      priority: this.form.priority,
      title: this.form.title,
      description: this.form.description,
      reportedBy: this.form.reportedBy,
      reportedByName: reporterName,
      status: this.form.assigneeId ? 'Assigned' : 'Open',
      photos: [],
      timeline: [
        {
          status: 'Open',
          notes: `Ticket raised by ${reporterName}`,
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    } as any;

    if (this.form.assigneeId) {
      newTicket.assignedTo = this.form.assigneeId;
      newTicket.assignedToName = this.form.assigneeName;
      newTicket.timeline.push({
        status: 'Assigned',
        notes: `Assigned to ${this.form.assigneeName}`,
        timestamp: new Date().toISOString()
      });
    }

    // Save ticket via CrudService
    const allTickets = this.crudService.getAll<any>(StorageKeys.TICKETS);
    allTickets.unshift(newTicket);
    localStorage.setItem(StorageKeys.TICKETS, JSON.stringify(allTickets));

    // Route back to dashboard
    this.router.navigate(['/owner/maintenance/dashboard']);
  }

  navigateBack() {
    this.router.navigate(['/owner/maintenance/dashboard']);
  }
}
