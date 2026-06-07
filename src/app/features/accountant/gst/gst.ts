import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface GstEntry { id: string; invoiceNo: string; party: string; taxableAmount: number; cgst: number; sgst: number; total: number; type: string; date: string; }
interface GstMonth { month: string; output: number; input: number; net: number; status: string; }

@Component({
  selector: 'app-accountant-gst',
  standalone: true,
  imports: [CommonModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="GST Management" subtitle="Track GST collected, paid, and filing compliance" />
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">GST Collected</p><p class="text-xl font-extrabold text-emerald-600 mt-1">₹{{ totalOutput() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">GST Paid (ITC)</p><p class="text-xl font-extrabold text-blue-600 mt-1">₹{{ totalInput() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Net Liability</p><p class="text-xl font-extrabold text-red-500 mt-1">₹{{ netLiability() | number:'1.0-0' }}</p></div>
        <div class="glass-card p-4 text-center"><p class="text-[10px] font-bold text-slate-400 uppercase">Filing Status</p><p class="text-xl font-extrabold text-emerald-600 mt-1">✅ Filed</p></div>
      </div>

      <!-- Monthly Summary -->
      <div class="glass-card p-5 space-y-4">
        <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-calendar mr-2 text-indigo-500"></i>Monthly GST Summary</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          @for (m of monthlySummary; track m.month) {
            <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-bold text-sm text-slate-800 dark:text-white">{{ m.month }}</span>
                <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase" [class]="m.status === 'Filed' ? 'bg-emerald-100 text-emerald-700' : m.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'">{{ m.status }}</span>
              </div>
              <div class="text-xs space-y-1">
                <div class="flex justify-between"><span class="text-slate-500">Output GST</span><span class="font-bold text-emerald-600">₹{{ m.output | number:'1.0-0' }}</span></div>
                <div class="flex justify-between"><span class="text-slate-500">Input GST</span><span class="font-bold text-blue-600">₹{{ m.input | number:'1.0-0' }}</span></div>
                <div class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1"><span class="text-slate-500 font-bold">Net Payable</span><span class="font-extrabold text-red-500">₹{{ m.net | number:'1.0-0' }}</span></div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- GST Transactions -->
      <div class="glass-card overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-700"><h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">GST Transactions</h4></div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="border-b border-slate-200 dark:border-slate-700 text-left bg-slate-50 dark:bg-slate-800/50">
              <th class="p-3 text-xs font-semibold text-slate-500 uppercase">Invoice</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Party</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase">Type</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Taxable</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">CGST</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">SGST</th><th class="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
            </tr></thead>
            <tbody>
              @for (e of gstEntries(); track e.id) {
                <tr class="border-b border-slate-100 dark:border-slate-800">
                  <td class="p-3 font-mono text-xs font-bold text-indigo-600">{{ e.invoiceNo }}</td>
                  <td class="p-3 text-slate-700 dark:text-slate-300">{{ e.party }}</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase" [class]="e.type === 'Output' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'">{{ e.type }}</span></td>
                  <td class="p-3 text-right font-mono">{{ e.taxableAmount | number:'1.0-0' }}</td>
                  <td class="p-3 text-right font-mono">{{ e.cgst | number:'1.0-0' }}</td>
                  <td class="p-3 text-right font-mono">{{ e.sgst | number:'1.0-0' }}</td>
                  <td class="p-3 text-right font-mono font-bold">{{ e.total | number:'1.0-0' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `, styles: [``]
})
export class AccountantGst {
  monthlySummary: GstMonth[] = [
    { month: 'June 2026', output: 28500, input: 12200, net: 16300, status: 'Pending' },
    { month: 'May 2026', output: 32400, input: 14800, net: 17600, status: 'Filed' },
    { month: 'April 2026', output: 30100, input: 13500, net: 16600, status: 'Filed' },
  ];
  gstEntries = signal<GstEntry[]>([
    { id: 'g1', invoiceNo: 'INV-2026-0045', party: 'Rahul Sharma (Tenant)', taxableAmount: 8500, cgst: 765, sgst: 765, total: 10030, type: 'Output', date: 'Jun 3' },
    { id: 'g2', invoiceNo: 'INV-2026-0044', party: 'Priya Patel (Tenant)', taxableAmount: 7500, cgst: 675, sgst: 675, total: 8850, type: 'Output', date: 'Jun 2' },
    { id: 'g3', invoiceNo: 'PUR-2026-0112', party: 'Metro Hardware (Vendor)', taxableAmount: 3200, cgst: 288, sgst: 288, total: 3776, type: 'Input', date: 'Jun 2' },
    { id: 'g4', invoiceNo: 'INV-2026-0043', party: 'Amit Kumar (Tenant)', taxableAmount: 10000, cgst: 900, sgst: 900, total: 11800, type: 'Output', date: 'Jun 1' },
    { id: 'g5', invoiceNo: 'PUR-2026-0111', party: 'Noida Electricals (Vendor)', taxableAmount: 5600, cgst: 504, sgst: 504, total: 6608, type: 'Input', date: 'Jun 1' },
    { id: 'g6', invoiceNo: 'INV-2026-0042', party: 'Deepak Verma (Tenant)', taxableAmount: 10000, cgst: 900, sgst: 900, total: 11800, type: 'Output', date: 'May 31' },
  ]);
  totalOutput = computed(() => this.gstEntries().filter(e => e.type === 'Output').reduce((s, e) => s + e.cgst + e.sgst, 0));
  totalInput = computed(() => this.gstEntries().filter(e => e.type === 'Input').reduce((s, e) => s + e.cgst + e.sgst, 0));
  netLiability = computed(() => this.totalOutput() - this.totalInput());
}
