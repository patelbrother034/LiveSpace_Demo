import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface MaintenanceTicket {
  id: string;
  tenantId?: string;
  propertyId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  assignedTo?: string;
  resolutionNotes?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

@Component({
  selector: 'app-caretaker-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, DialogModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Tickets & Supply Inventory" subtitle="Resolve resident issues and manage PG stock levels" />

      <!-- Mode Selector Tabs -->
      <div class="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-0.5">
        <button (click)="currentMode.set('tickets')"
          class="pb-3 text-sm font-bold border-b-2 bg-transparent border-none cursor-pointer transition-all px-4"
          [class]="currentMode() === 'tickets' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'">
          Assigned Maintenance Tickets
        </button>
        <button (click)="currentMode.set('inventory')"
          class="pb-3 text-sm font-bold border-b-2 bg-transparent border-none cursor-pointer transition-all px-4"
          [class]="currentMode() === 'inventory' ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'">
          Supply & Linen Inventory
        </button>
      </div>

      <!-- TICKETS PANEL -->
      @if (currentMode() === 'tickets') {
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in">
          
          <!-- Tickets Queue -->
          <div class="xl:col-span-2 space-y-4">
            <div class="flex justify-between items-center">
              <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Ticket Queue</h4>
              <div class="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                @for (filter of ['All', 'Open', 'InProgress', 'Resolved']; track filter) {
                  <button (click)="activeFilter.set(filter)"
                    class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border-none cursor-pointer transition-all"
                    [class]="activeFilter() === filter ? 'bg-indigo-500 text-white shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'">
                    {{ filter }}
                  </button>
                }
              </div>
            </div>

            <div class="space-y-4">
              @for (tk of filteredTickets(); track tk.id) {
                <div class="glass-card p-5 space-y-3.5 hover:border-indigo-500/10 cursor-pointer transition-all"
                  (click)="openResolveDialog(tk)">
                  <div class="flex justify-between items-start">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {{ tk.category }}
                        </span>
                        <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ tk.title }}</h4>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{{ tk.description }}</p>
                    </div>
                    <span class="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded"
                      [class]="tk.priority === 'Critical' || tk.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-500'">
                      {{ tk.priority }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center text-[10.5px] border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                    <span class="text-slate-400">Created {{ tk.createdAt | date:'shortDate' }}</span>
                    <span class="font-extrabold"
                      [class]="tk.status === 'Open' ? 'text-indigo-500' : tk.status === 'InProgress' ? 'text-amber-500' : 'text-emerald-500'">
                      ● {{ tk.status }}
                    </span>
                  </div>
                </div>
              } @empty {
                <div class="h-32 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center text-xs text-slate-400 italic">
                  No maintenance tickets found matching active filters.
                </div>
              }
            </div>
          </div>

          <!-- Quick Statistics Summary -->
          <div class="xl:col-span-1 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Metrics Performance</h4>
            <div class="glass-card p-5 space-y-5">
              <div class="space-y-1">
                <span class="text-xs font-semibold text-slate-500">Response Speed Rating</span>
                <div class="flex items-center gap-1.5">
                  <i class="pi pi-star-fill text-amber-500"></i>
                  <i class="pi pi-star-fill text-amber-500"></i>
                  <i class="pi pi-star-fill text-amber-500"></i>
                  <i class="pi pi-star-fill text-amber-500"></i>
                  <i class="pi pi-star text-slate-300"></i>
                  <span class="text-xs font-extrabold text-slate-800 dark:text-white ml-1">4.2 / 5.0</span>
                </div>
              </div>

              <div class="border-t border-slate-100 dark:border-slate-800/80 pt-4 grid grid-cols-2 gap-4">
                <div class="space-y-0.5">
                  <p class="text-[10px] text-slate-500 font-semibold uppercase">Resolved Tickets</p>
                  <h4 class="text-lg font-extrabold text-slate-800 dark:text-white">18</h4>
                </div>
                <div class="space-y-0.5">
                  <p class="text-[10px] text-slate-500 font-semibold uppercase">Avg resolution time</p>
                  <h4 class="text-lg font-extrabold text-slate-800 dark:text-white">3.4 hrs</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- INVENTORY PANEL -->
      @if (currentMode() === 'inventory') {
        <div class="max-w-4xl mx-auto glass-card p-6 space-y-6 animate-fade-in">
          <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Supply Stock Level</h4>
            <button pButton label="Record Purchase Request" icon="pi pi-cart-plus" (click)="alertPurchase()"
              class="p-button-xs rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-600">
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (item of inventory(); track item.id) {
              <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <h5 class="text-xs font-bold text-slate-800 dark:text-white">{{ item.name }}</h5>
                  <p class="text-[10px] text-slate-400 mt-0.5">Category: {{ item.category }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <button (click)="adjustStock(item.id, -1)" 
                    class="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer hover:bg-slate-100">-</button>
                  <span class="text-xs font-bold w-6 text-center text-slate-800 dark:text-white">{{ item.quantity }}</span>
                  <button (click)="adjustStock(item.id, 1)" 
                    class="h-7 w-7 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer hover:bg-slate-100">+</button>
                  <span class="text-[9px] text-slate-400 font-extrabold uppercase">{{ item.unit }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- TICKET STATUS RESOLVER MODAL -->
      <p-dialog [(visible)]="resolverDialog" [header]="'Manage Ticket: ' + (selectedTicket()?.title || '')"
        [modal]="true" [style]="{width: '450px'}" styleClass="rounded-2xl dark:bg-slate-900">
        <div class="space-y-4 p-2 text-xs" *ngIf="selectedTicket()">
          
          <div class="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
            <h5 class="font-bold text-slate-700 dark:text-slate-300">Ticket Description:</h5>
            <p class="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{{ selectedTicket()!.description }}</p>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700 dark:text-slate-300 uppercase">Update Status</label>
            <div class="grid grid-cols-3 gap-2">
              @for (st of ['Open', 'InProgress', 'Resolved']; track st) {
                <button (click)="updateStatus = st"
                  class="py-2 rounded-xl border font-bold text-[10px] cursor-pointer transition-all"
                  [class]="updateStatus === st ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400'">
                  {{ st }}
                </button>
              }
            </div>
          </div>

          <div class="space-y-1">
            <label class="font-bold text-slate-700 dark:text-slate-300 uppercase">Remarks & Resolution Notes</label>
            <textarea [(ngModel)]="remarks" placeholder="Enter notes or updates..." rows="3"
              class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:ring-1 focus:ring-indigo-500"></textarea>
          </div>

          <div class="flex gap-3 justify-end pt-3">
            <button pButton label="Cancel" class="p-button-text p-button-sm text-slate-500" (click)="resolverDialog = false"></button>
            <button pButton label="Save Changes" class="p-button-sm rounded-xl bg-indigo-500 border-none text-white" (click)="saveTicketUpdate()"></button>
          </div>

        </div>
      </p-dialog>

    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class CaretakerTickets implements OnInit {
  private crudService = inject(CrudService);

  currentMode = signal<'tickets' | 'inventory'>('tickets');
  activeFilter = signal('All');

  tickets = signal<MaintenanceTicket[]>([]);
  inventory = signal<InventoryItem[]>([]);

  // Dialog Resolver
  resolverDialog = false;
  selectedTicket = signal<MaintenanceTicket | null>(null);
  updateStatus = 'InProgress';
  remarks = '';

  filteredTickets = computed(() => {
    const list = this.tickets();
    const filter = this.activeFilter();
    if (filter === 'All') return list;
    return list.filter(tk => tk.status === filter);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // Load tickets assigned to prop-001 or standard caretaker
    const all = this.crudService.getAll<any>(StorageKeys.TICKETS);
    
    // Seed standard mock tickets if database is empty
    if (all.length === 0) {
      const seed: any[] = [
        { id: 'tk-1', propertyId: 'prop-001', title: 'Flush not working in 102 Toilet', description: 'Resident reported flush is leaking continuously since last night.', category: 'Plumbing', priority: 'High', status: 'Open', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'tk-2', propertyId: 'prop-001', title: 'AC remote battery expired 204', description: 'AC is functioning but remote screen is dead. Requires 2 AAA batteries.', category: 'Electrical', priority: 'Low', status: 'InProgress', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 'tk-3', propertyId: 'prop-001', title: 'Wardrobe drawer stuck room 105', description: 'Drawer wooden frame has swelled. Hard to pull or push.', category: 'Furniture', priority: 'Medium', status: 'Resolved', createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), resolutionNotes: 'Planed down the drawer sides. Glides perfectly now.' }
      ];
      localStorage.setItem(StorageKeys.TICKETS, JSON.stringify(seed));
      this.tickets.set(seed);
    } else {
      this.tickets.set(all.filter(t => t.propertyId === 'prop-001'));
    }

    // Load inventory
    this.inventory.set(this.crudService.getAll<InventoryItem>('lsp_inventory'));
  }

  adjustStock(itemId: string, diff: number) {
    const list = this.crudService.getAll<InventoryItem>('lsp_inventory');
    const idx = list.findIndex(item => item.id === itemId);
    if (idx !== -1) {
      list[idx].quantity = Math.max(0, list[idx].quantity + diff);
      localStorage.setItem('lsp_inventory', JSON.stringify(list));
      this.inventory.set(list);
    }
  }

  openResolveDialog(ticket: MaintenanceTicket) {
    this.selectedTicket.set(ticket);
    this.updateStatus = ticket.status;
    this.remarks = ticket.resolutionNotes || '';
    this.resolverDialog = true;
  }

  saveTicketUpdate() {
    if (!this.selectedTicket()) return;

    const list = this.crudService.getAll<any>(StorageKeys.TICKETS);
    const idx = list.findIndex(t => t.id === this.selectedTicket()!.id);
    if (idx !== -1) {
      list[idx].status = this.updateStatus;
      list[idx].resolutionNotes = this.remarks;
      localStorage.setItem(StorageKeys.TICKETS, JSON.stringify(list));
    }

    this.resolverDialog = false;
    this.loadData();
    alert('Ticket status updated successfully!');
  }

  alertPurchase() {
    alert('Purchase request successfully created and routed to the Accountant portal!');
  }
}
