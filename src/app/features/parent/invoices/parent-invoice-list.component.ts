import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface Invoice {
  id: string;
  invoiceNo: string;
  month: string;
  rent: number;
  utilities: number;
  food: number;
  laundry: number;
  gst: number;
  total: number;
  status: string;
  dueDate: string;
}

@Component({
  selector: 'app-parent-invoice-list',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule, DialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Invoices" subtitle="View monthly invoices for your child's accommodation" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Invoices</p>
          <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{{ invoices().length }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month Due</p>
          <p class="text-2xl font-extrabold text-amber-600 mt-1">₹{{ currentDue() | number:'1.0-0' }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Paid Invoices</p>
          <p class="text-2xl font-extrabold text-emerald-600 mt-1">{{ paidCount() }}</p>
        </div>
        <div class="glass-card p-5">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding</p>
          <p class="text-2xl font-extrabold text-red-500 mt-1">₹{{ outstanding() | number:'1.0-0' }}</p>
        </div>
      </div>

      <div class="glass-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700 text-left">
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Invoice No</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Month</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Rent</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Utilities</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Food</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Total</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Status</th>
                <th class="p-4 font-semibold text-slate-500 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (inv of invoices(); track inv.id) {
                <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="p-4 font-mono font-bold text-indigo-600">{{ inv.invoiceNo }}</td>
                  <td class="p-4 text-slate-700 dark:text-slate-300">{{ inv.month }}</td>
                  <td class="p-4">₹{{ inv.rent | number:'1.0-0' }}</td>
                  <td class="p-4">₹{{ inv.utilities | number:'1.0-0' }}</td>
                  <td class="p-4">₹{{ inv.food | number:'1.0-0' }}</td>
                  <td class="p-4 font-bold text-slate-800 dark:text-white">₹{{ inv.total | number:'1.0-0' }}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                      [class]="inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : inv.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                      {{ inv.status }}
                    </span>
                  </td>
                  <td class="p-4">
                    <button pButton icon="pi pi-eye" class="p-button-text p-button-sm p-button-rounded" (click)="viewInvoice(inv)" pTooltip="View Details"></button>
                    <button pButton icon="pi pi-print" class="p-button-text p-button-sm p-button-rounded" pTooltip="Print"></button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <p-dialog [(visible)]="detailVisible" [header]="'Invoice ' + (selectedInvoice()?.invoiceNo || '')" [modal]="true" [style]="{width: '480px'}" styleClass="rounded-2xl">
        @if (selectedInvoice(); as inv) {
          <div class="space-y-4 pt-2">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-slate-500">Base Rent</span><span class="font-bold">₹{{ inv.rent | number:'1.0-0' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Electricity & Water</span><span class="font-bold">₹{{ inv.utilities | number:'1.0-0' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Food & Mess</span><span class="font-bold">₹{{ inv.food | number:'1.0-0' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">Laundry</span><span class="font-bold">₹{{ inv.laundry | number:'1.0-0' }}</span></div>
              <div class="flex justify-between"><span class="text-slate-500">GST (18%)</span><span class="font-bold">₹{{ inv.gst | number:'1.0-0' }}</span></div>
              <div class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span class="font-bold text-slate-800 dark:text-white">Total</span>
                <span class="font-extrabold text-indigo-600 text-lg">₹{{ inv.total | number:'1.0-0' }}</span>
              </div>
            </div>
            <div class="flex justify-between text-xs text-slate-400">
              <span>Due: {{ inv.dueDate }}</span>
              <span class="font-bold uppercase" [class]="inv.status === 'Paid' ? 'text-emerald-500' : 'text-red-500'">{{ inv.status }}</span>
            </div>
          </div>
        }
      </p-dialog>
    </div>
  `,
  styles: [``]
})
export class ParentInvoiceListComponent {
  detailVisible = false;
  selectedInvoice = signal<Invoice | null>(null);

  invoices = signal<Invoice[]>([
    { id: 'inv-1', invoiceNo: 'INV-2026-06', month: 'June 2026', rent: 8500, utilities: 1200, food: 3500, laundry: 500, gst: 2466, total: 16166, status: 'Pending', dueDate: '2026-06-05' },
    { id: 'inv-2', invoiceNo: 'INV-2026-05', month: 'May 2026', rent: 8500, utilities: 1100, food: 3500, laundry: 500, gst: 2448, total: 16048, status: 'Paid', dueDate: '2026-05-05' },
    { id: 'inv-3', invoiceNo: 'INV-2026-04', month: 'April 2026', rent: 8500, utilities: 1300, food: 3500, laundry: 500, gst: 2484, total: 16284, status: 'Paid', dueDate: '2026-04-05' },
    { id: 'inv-4', invoiceNo: 'INV-2026-03', month: 'March 2026', rent: 8500, utilities: 1000, food: 3500, laundry: 500, gst: 2430, total: 15930, status: 'Paid', dueDate: '2026-03-05' },
    { id: 'inv-5', invoiceNo: 'INV-2026-02', month: 'February 2026', rent: 8500, utilities: 950, food: 3500, laundry: 500, gst: 2421, total: 15871, status: 'Paid', dueDate: '2026-02-05' },
    { id: 'inv-6', invoiceNo: 'INV-2026-01', month: 'January 2026', rent: 8500, utilities: 1150, food: 3500, laundry: 500, gst: 2457, total: 16107, status: 'Paid', dueDate: '2026-01-05' },
  ]);

  currentDue = computed(() => this.invoices().filter(i => i.status === 'Pending').reduce((s, i) => s + i.total, 0));
  paidCount = computed(() => this.invoices().filter(i => i.status === 'Paid').length);
  outstanding = computed(() => this.invoices().filter(i => i.status !== 'Paid').reduce((s, i) => s + i.total, 0));

  viewInvoice(inv: Invoice) {
    this.selectedInvoice.set(inv);
    this.detailVisible = true;
  }
}
