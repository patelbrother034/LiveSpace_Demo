import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../../core/services/crud.service';
import { StorageKeys } from '../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

interface Tenant {
  id: string;
  fullName: string;
  monthlyRent: number;
  pendingDues: number;
  paymentStatus: string;
  propertyId: string;
  roomId: string;
  bedId: string;
}

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  status: string;
  propertyId: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

@Component({
  selector: 'app-caretaker-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TooltipModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Desktop Info Alert -->
      <div class="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
        <div class="space-y-1">
          <h2 class="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="pi pi-mobile text-indigo-500 text-2xl"></i>
            Caretaker Mobile Simulator
          </h2>
          <p class="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Caretakers manage PG tasks on the move. We have built an interactive, high-fidelity smartphone emulator to demonstrate the mobile-first workflow, including offline sync, voice assistant commands, rent collections, and WhatsApp messaging.
          </p>
        </div>
        <div class="shrink-0 flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            [class]="isOnline() ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'">
            <span class="h-2.5 w-2.5 rounded-full animate-pulse" [class]="isOnline() ? 'bg-emerald-500' : 'bg-amber-500'"></span>
            {{ isOnline() ? 'Connected (Online)' : 'Simulated Offline' }}
          </div>
          <button pButton 
            [label]="isOnline() ? 'Simulate Offline' : 'Go Online'" 
            [icon]="isOnline() ? 'pi pi-wifi' : 'pi pi-wifi'" 
            (click)="toggleConnection()"
            class="p-button-sm rounded-xl"
            [class]="isOnline() ? 'p-button-outlined p-button-secondary' : 'bg-indigo-500 text-white border-none'">
          </button>
        </div>
      </div>

      <!-- Smartphone Emulator Centered Frame -->
      <div class="flex justify-center items-center py-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-800/80">
        
        <!-- Physical Phone Body Container -->
        <div class="relative w-[375px] h-[760px] bg-slate-950 rounded-[55px] p-3 shadow-2xl border-4 border-slate-800/90 ring-12 ring-slate-900/60 overflow-hidden flex flex-col">
          
          <!-- Screen Glare Reflection -->
          <div class="absolute top-0 right-0 w-2/3 h-1/2 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-[150px] pointer-events-none z-50"></div>
          
          <!-- Dynamic Island / Notch -->
          <div class="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-center gap-1.5 px-3">
            <div class="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-indigo-500/80 animate-pulse"></div>
            <div class="w-1 h-1 rounded-full bg-slate-900"></div>
          </div>

          <!-- Phone Screen Container -->
          <div class="w-full h-full bg-slate-100 dark:bg-slate-900 rounded-[44px] overflow-hidden flex flex-col relative text-slate-800 dark:text-slate-200">
            
            <!-- Simulated Top Status Bar -->
            <div class="h-10 pt-4 px-6 flex justify-between items-center text-[11px] font-bold text-slate-700 dark:text-slate-300 select-none z-40 bg-slate-100 dark:bg-slate-900">
              <span>9:41 AM</span>
              <div class="flex items-center gap-1.5">
                <span class="text-[9px]">LiveSpace 5G</span>
                <i class="pi" [class]="isOnline() ? 'pi-wifi' : 'pi-ban text-amber-500'"></i>
                <i class="pi pi-battery-full"></i>
              </div>
            </div>

            <!-- Scrollable Mobile App Area -->
            <div class="flex-1 overflow-y-auto px-4 pb-20 pt-2 space-y-4 select-none">
              
              <!-- HEADER AREA -->
              <div class="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    SK
                  </div>
                  <div>
                    <h3 class="text-xs font-extrabold text-slate-800 dark:text-white">Suresh Kumar</h3>
                    <p class="text-[9px] text-slate-500 dark:text-slate-400">Caretaker · Royal Heights</p>
                  </div>
                </div>
                
                <!-- Sync Badge for Offline Queue -->
                @if (offlineQueue().length > 0) {
                  <button (click)="syncOfflineQueue()"
                    class="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center gap-1 animate-pulse border-none cursor-pointer">
                    <i class="pi pi-sync animate-spin text-[8px]"></i>
                    Sync {{ offlineQueue().length }}
                  </button>
                }
              </div>

              <!-- VIEW 1: HOME TAB -->
              @if (activeTab() === 'home') {
                <div class="space-y-4 animate-fade-in">
                  
                  <!-- Welcome Grid -->
                  <div class="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white space-y-2.5 shadow-lg shadow-indigo-500/20">
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="text-[10px] text-indigo-100 font-semibold uppercase tracking-wider">Today's Target</p>
                        <h2 class="text-xl font-extrabold">₹35,000</h2>
                      </div>
                      <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">14/20 Beds Paid</span>
                    </div>
                    <div class="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                      <div class="bg-white h-full" style="width: 70%"></div>
                    </div>
                  </div>

                  <!-- Quick Stats Rows -->
                  <div class="grid grid-cols-3 gap-2">
                    <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-center border border-slate-200/50 dark:border-slate-800">
                      <p class="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">Pending Dues</p>
                      <h4 class="text-sm font-bold text-red-500">₹24.5k</h4>
                    </div>
                    <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-center border border-slate-200/50 dark:border-slate-800">
                      <p class="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">Dirty Rooms</p>
                      <h4 class="text-sm font-bold text-amber-500">4 / 12</h4>
                    </div>
                    <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-center border border-slate-200/50 dark:border-slate-800">
                      <p class="text-[9px] text-slate-500 dark:text-slate-400 font-semibold">Open Tickets</p>
                      <h4 class="text-sm font-bold text-indigo-500">3</h4>
                    </div>
                  </div>

                  <!-- Voice Assistant Simulator -->
                  <div class="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 space-y-2">
                    <h4 class="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <i class="pi pi-microphone text-indigo-500"></i>
                      Simulated Voice Assistant
                    </h4>
                    
                    @if (voiceActive()) {
                      <div class="py-2.5 flex flex-col items-center justify-center space-y-2">
                        <div class="flex items-center gap-1 h-5">
                          <span class="w-1 bg-indigo-500 rounded animate-wave h-3" style="animation-delay: 0.1s"></span>
                          <span class="w-1 bg-indigo-500 rounded animate-wave h-4" style="animation-delay: 0.2s"></span>
                          <span class="w-1 bg-indigo-500 rounded animate-wave h-5" style="animation-delay: 0.3s"></span>
                          <span class="w-1 bg-indigo-500 rounded animate-wave h-4" style="animation-delay: 0.4s"></span>
                          <span class="w-1 bg-indigo-500 rounded animate-wave h-2" style="animation-delay: 0.5s"></span>
                        </div>
                        <p class="text-[10px] text-indigo-500 font-bold italic">{{ voiceStatus() }}</p>
                      </div>
                    } @else {
                      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-700/80">
                        <span class="text-[9px] text-slate-500 dark:text-slate-400 italic">"Collect rent for Aditya"</span>
                        <button (click)="triggerVoiceCommand()"
                          class="h-7 w-7 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 border-none cursor-pointer hover:bg-indigo-600">
                          <i class="pi pi-microphone text-xs"></i>
                        </button>
                      </div>
                    }
                  </div>

                  <!-- Quick Action Grid -->
                  <div class="space-y-2">
                    <h4 class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-[10px]">Quick Actions</h4>
                    <div class="grid grid-cols-2 gap-2">
                      <button (click)="setTab('collect')" class="p-3 rounded-xl bg-white dark:bg-slate-800 text-left border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-3 cursor-pointer hover:border-indigo-500 transition-all">
                        <div class="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center"><i class="pi pi-indian-rupee text-sm"></i></div>
                        <div><h5 class="text-xs font-bold">Collect Rent</h5><p class="text-[8px] text-slate-500">Quick entry</p></div>
                      </button>
                      
                      <button (click)="setTab('tasks')" class="p-3 rounded-xl bg-white dark:bg-slate-800 text-left border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-3 cursor-pointer hover:border-indigo-500 transition-all">
                        <div class="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center"><i class="pi pi-check-circle text-sm"></i></div>
                        <div><h5 class="text-xs font-bold">Housekeeping</h5><p class="text-[8px] text-slate-500">Room checklist</p></div>
                      </button>
                    </div>
                  </div>

                  <!-- Today's Tasks Log -->
                  <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 space-y-2.5">
                    <h4 class="text-xs font-extrabold text-slate-800 dark:text-white">Active Complaints (3)</h4>
                    <div class="space-y-2 text-xs">
                      <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                        <div>
                          <h5 class="font-bold text-[11px]">Room 104 Tap Leakage</h5>
                          <p class="text-[9px] text-slate-500">Plumbing · Assigned 1h ago</p>
                        </div>
                        <span class="text-[9px] px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-extrabold">High</span>
                      </div>
                      <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                        <div>
                          <h5 class="font-bold text-[11px]">AC Remote Issue Room 202</h5>
                          <p class="text-[9px] text-slate-500">Electrical · Assigned 3h ago</p>
                        </div>
                        <span class="text-[9px] px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-extrabold">Medium</span>
                      </div>
                    </div>
                  </div>

                </div>
              }

              <!-- VIEW 2: COLLECT TAB -->
              @if (activeTab() === 'collect') {
                <div class="space-y-4 animate-fade-in">
                  <div class="flex items-center gap-1 pb-1">
                    <button (click)="setTab('home')" class="p-0 border-none bg-transparent text-indigo-500 cursor-pointer"><i class="pi pi-chevron-left"></i></button>
                    <h4 class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Quick Rent Collection</h4>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 space-y-3.5">
                    <div class="space-y-1">
                      <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Select Tenant</label>
                      <select [(ngModel)]="rentTenantId" (change)="onTenantSelected()"
                        class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-1 focus:ring-indigo-500">
                        <option value="">-- Choose Tenant --</option>
                        @for (t of tenants(); track t.id) {
                          <option [value]="t.id">{{ t.fullName }} (Room {{ t.roomId.replace('room-', '').toUpperCase() }})</option>
                        }
                      </select>
                    </div>

                    @if (rentTenantId) {
                      <div class="space-y-3 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800 animate-fade-in">
                        <div class="flex justify-between items-center text-xs">
                          <span class="text-slate-500">Pending Amount:</span>
                          <span class="font-extrabold text-red-500">₹{{ rentAmount | number:'1.0-0' }}</span>
                        </div>

                        <div class="space-y-1">
                          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Collection Amount (₹)</label>
                          <input type="number" [(ngModel)]="rentAmount"
                            class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white focus:ring-1 focus:ring-indigo-500">
                        </div>

                        <div class="space-y-1">
                          <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Payment Mode</label>
                          <div class="grid grid-cols-3 gap-1.5">
                            @for (mode of ['UPI', 'Cash', 'Card']; track mode) {
                              <button (click)="rentMode = mode"
                                class="py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all"
                                [class]="rentMode === mode ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'">
                                {{ mode }}
                              </button>
                            }
                          </div>
                        </div>

                        <button (click)="collectRent()"
                          class="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none text-xs font-bold hover:opacity-90 shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5">
                          <i class="pi pi-check-circle"></i>
                          {{ isOnline() ? 'Collect Rent' : 'Collect Offline' }}
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- VIEW 3: TASKS TAB -->
              @if (activeTab() === 'tasks') {
                <div class="space-y-4 animate-fade-in">
                  <div class="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-2">
                    <h4 class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Housekeeping Log</h4>
                    <span class="text-[9px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold">Floor 1</span>
                  </div>

                  <!-- Room Checklist -->
                  <div class="space-y-2.5">
                    @for (r of rooms(); track r.id) {
                      <div class="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div class="space-y-0.5">
                          <h5 class="text-xs font-bold text-slate-800 dark:text-white">Room {{ r.roomNumber }}</h5>
                          <p class="text-[9px] text-slate-500 dark:text-slate-400">Sharing: {{ r.type }}</p>
                        </div>
                        
                        <div class="flex items-center gap-1">
                          @for (st of ['Clean', 'Dirty', 'Cleaning']; track st) {
                            <button (click)="toggleRoomStatus(r.id, st)"
                              class="px-2 py-1 rounded text-[8px] font-extrabold uppercase border-none cursor-pointer transition-all"
                              [class]="r.status === st ? 
                                (st === 'Clean' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 
                                 st === 'Dirty' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 
                                 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400') : 
                                'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600'">
                              {{ st }}
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- WhatsApp Template Messaging -->
                  <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 space-y-2">
                    <h4 class="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                      <i class="pi pi-whatsapp text-emerald-500"></i>
                      WhatsApp Cleaning Alert
                    </h4>
                    <p class="text-[8.5px] text-slate-500 dark:text-slate-400">Quickly broadcast alerts to roommates using pre-defined WhatsApp templates.</p>
                    <div class="space-y-2 pt-1">
                      <select [(ngModel)]="whatsappTemplate"
                        class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] focus:ring-1 focus:ring-indigo-500">
                        <option value="cleaning">Reminder: Housekeeping scheduled in 15 mins</option>
                        <option value="completed">Alert: Housekeeping successfully completed</option>
                        <option value="inspect">Alert: Monthly cleanliness room audit scheduled</option>
                      </select>
                      <button (click)="broadcastWhatsApp()"
                        class="w-full py-2 rounded-xl bg-emerald-500 text-white border-none text-[10px] font-bold hover:bg-emerald-600 cursor-pointer flex items-center justify-center gap-1">
                        <i class="pi pi-whatsapp"></i> Broadcast WhatsApp Alert
                      </button>
                    </div>
                  </div>
                </div>
              }

              <!-- VIEW 4: MORE TAB -->
              @if (activeTab() === 'more') {
                <div class="space-y-4 animate-fade-in">
                  <h4 class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-800/50 pb-2">Inventory Log</h4>

                  <div class="space-y-2.5">
                    @for (item of inventory(); track item.id) {
                      <div class="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                        <div class="space-y-0.5">
                          <h5 class="text-xs font-bold text-slate-800 dark:text-white">{{ item.name }}</h5>
                          <p class="text-[9px] text-slate-500">{{ item.category }}</p>
                        </div>
                        <div class="flex items-center gap-2">
                          <button (click)="updateInventory(item.id, -1)" class="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer hover:bg-slate-100">-</button>
                          <span class="text-xs font-bold w-6 text-center text-slate-800 dark:text-white">{{ item.quantity }}</span>
                          <button (click)="updateInventory(item.id, 1)" class="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center cursor-pointer hover:bg-slate-100">+</button>
                          <span class="text-[8px] text-slate-400 font-semibold uppercase">{{ item.unit }}</span>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-500 dark:text-slate-400 space-y-1">
                    <p class="font-bold uppercase text-slate-600 dark:text-slate-300 text-[8px]">Device Diagnosis:</p>
                    <p>· Storage Model: lsp_inventory</p>
                    <p>· Connection Mode: {{ isOnline() ? 'HTTP/HTTPS Live' : 'Simulated Offline Queue Cache' }}</p>
                    <p>· Device Latency: 42ms</p>
                  </div>
                </div>
              }

            </div>

            <!-- Bottom Navigation Bar -->
            <div class="absolute bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-around px-2 z-40 select-none">
              <button (click)="setTab('home')" class="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 w-12"
                [class]="activeTab() === 'home' ? 'text-indigo-500 font-bold' : 'text-slate-400 dark:text-slate-500'">
                <i class="pi pi-home text-sm"></i>
                <span class="text-[8px]">Home</span>
              </button>
              <button (click)="setTab('collect')" class="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 w-12"
                [class]="activeTab() === 'collect' ? 'text-indigo-500 font-bold' : 'text-slate-400 dark:text-slate-500'">
                <i class="pi pi-indian-rupee text-sm"></i>
                <span class="text-[8px]">Collect</span>
              </button>
              <button (click)="setTab('tasks')" class="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 w-12"
                [class]="activeTab() === 'tasks' ? 'text-indigo-500 font-bold' : 'text-slate-400 dark:text-slate-500'">
                <i class="pi pi-check-circle text-sm"></i>
                <span class="text-[8px]">Tasks</span>
              </button>
              <button (click)="setTab('more')" class="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer py-1 w-12"
                [class]="activeTab() === 'more' ? 'text-indigo-500 font-bold' : 'text-slate-400 dark:text-slate-500'">
                <i class="pi pi-box text-sm"></i>
                <span class="text-[8px]">Inventory</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes wave {
      0%, 100% { transform: scaleY(0.4); }
      50% { transform: scaleY(1.2); }
    }
    .animate-wave {
      animation: wave 1.2s ease-in-out infinite;
      transform-origin: center;
    }
    .ring-12 {
      box-shadow: 0 0 0 12px rgba(15, 23, 42, 0.9), 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
  `]
})
export class Dashboard implements OnInit {
  private crudService = inject(CrudService);

  activeTab = signal<'home' | 'collect' | 'tasks' | 'more'>('home');
  isOnline = signal(true);
  offlineQueue = signal<any[]>([]);

  tenants = signal<Tenant[]>([]);
  rooms = signal<Room[]>([]);
  inventory = signal<InventoryItem[]>([]);

  // Rent Entry form
  rentTenantId = '';
  rentAmount = 0;
  rentMode = 'UPI';

  // WhatsApp broadcast template
  whatsappTemplate = 'cleaning';

  // Voice command status
  voiceActive = signal(false);
  voiceStatus = signal('');

  ngOnInit() {
    this.loadData();
    this.seedInventoryIfNeeded();
  }

  loadData() {
    // Get property prop-001 tenants
    const allTenants = this.crudService.getAll<Tenant>(StorageKeys.TENANTS);
    const filteredTenants = allTenants.filter(t => t.propertyId === 'prop-001' && t.paymentStatus !== 'Paid');
    this.tenants.set(filteredTenants);

    // Get rooms
    const allRooms = this.crudService.getAll<Room>(StorageKeys.ROOMS);
    const filteredRooms = allRooms.filter(r => r.propertyId === 'prop-001').slice(0, 5);
    this.rooms.set(filteredRooms);

    // Load inventory
    this.inventory.set(this.crudService.getAll<InventoryItem>('lsp_inventory'));
  }

  seedInventoryIfNeeded() {
    const list = this.crudService.getAll<InventoryItem>('lsp_inventory');
    if (list.length === 0) {
      const seed: InventoryItem[] = [
        { id: 'inv-1', name: 'Bedsheet Covers', category: 'Linen', quantity: 24, unit: 'pcs' },
        { id: 'inv-2', name: 'Door Handles & Locks', category: 'Hardware', quantity: 6, unit: 'pcs' },
        { id: 'inv-3', name: 'LED Bulbs 9W', category: 'Electrical', quantity: 15, unit: 'pcs' },
        { id: 'inv-4', name: 'Toilet Cleaner 5L', category: 'Hygiene', quantity: 3, unit: 'cans' }
      ];
      localStorage.setItem('lsp_inventory', JSON.stringify(seed));
      this.inventory.set(seed);
    }
  }

  setTab(tab: 'home' | 'collect' | 'tasks' | 'more') {
    this.activeTab.set(tab);
  }

  toggleConnection() {
    const current = this.isOnline();
    this.isOnline.set(!current);
    alert(current ? 'Offline Mode Activated. Collections will be queued!' : 'Reconnected! Flushing pending actions to server.');
    
    if (!current) {
      // Swapped to online, flush queue
      this.syncOfflineQueue();
    }
  }

  onTenantSelected() {
    const selected = this.tenants().find(t => t.id === this.rentTenantId);
    if (selected) {
      this.rentAmount = selected.pendingDues;
    }
  }

  collectRent() {
    if (!this.rentTenantId) return;

    const action = {
      type: 'RENT_COLLECT',
      tenantId: this.rentTenantId,
      amount: this.rentAmount,
      mode: this.rentMode,
      timestamp: new Date().toISOString()
    };

    if (this.isOnline()) {
      this.processRentCollection(action);
      alert('Rent payment logged successfully!');
    } else {
      const q = this.offlineQueue();
      q.push(action);
      this.offlineQueue.set([...q]);
      alert('Offline: Payment added to synchronization queue.');
    }

    // Reset Form & reload
    this.rentTenantId = '';
    this.rentAmount = 0;
    this.loadData();
    this.setTab('home');
  }

  processRentCollection(act: any) {
    // 1. Log transaction in lsp_transactions
    const transaction = {
      id: 'tx-' + Math.random().toString(36).substring(7),
      tenantId: act.tenantId,
      propertyId: 'prop-001',
      amount: act.amount,
      type: 'RENT',
      paymentMode: act.mode,
      status: 'Paid',
      createdAt: act.timestamp
    };
    const txs = this.crudService.getAll<any>(StorageKeys.TRANSACTIONS);
    txs.push(transaction);
    localStorage.setItem(StorageKeys.TRANSACTIONS, JSON.stringify(txs));

    // 2. Update tenant payment status and pending dues
    const tenants = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const tenantIdx = tenants.findIndex((t: any) => t.id === act.tenantId);
    if (tenantIdx !== -1) {
      tenants[tenantIdx].pendingDues = Math.max(0, tenants[tenantIdx].pendingDues - act.amount);
      if (tenants[tenantIdx].pendingDues === 0) {
        tenants[tenantIdx].paymentStatus = 'Paid';
      }
      localStorage.setItem(StorageKeys.TENANTS, JSON.stringify(tenants));
    }
  }

  syncOfflineQueue() {
    if (this.offlineQueue().length === 0) return;
    
    // Process each action
    this.offlineQueue().forEach(act => {
      if (act.type === 'RENT_COLLECT') {
        this.processRentCollection(act);
      }
    });

    this.offlineQueue.set([]);
    this.loadData();
    alert('Synchronization complete! All offline logs uploaded successfully.');
  }

  toggleRoomStatus(roomId: string, status: string) {
    const list = this.crudService.getAll<Room>(StorageKeys.ROOMS);
    const idx = list.findIndex(r => r.id === roomId);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem(StorageKeys.ROOMS, JSON.stringify(list));
      this.loadData();
    }
  }

  broadcastWhatsApp() {
    alert(`WhatsApp Broadcast Triggered! Sent template alert ('${this.whatsappTemplate}') to all residents of Building A.`);
  }

  updateInventory(itemId: string, diff: number) {
    const list = this.crudService.getAll<InventoryItem>('lsp_inventory');
    const idx = list.findIndex(item => item.id === itemId);
    if (idx !== -1) {
      list[idx].quantity = Math.max(0, list[idx].quantity + diff);
      localStorage.setItem('lsp_inventory', JSON.stringify(list));
      this.inventory.set(list);
    }
  }

  triggerVoiceCommand() {
    this.voiceActive.set(true);
    this.voiceStatus.set('Listening...');
    
    setTimeout(() => {
      this.voiceStatus.set('Command identified: "Collect rent for Aditya Patel"');
    }, 1500);

    setTimeout(() => {
      // Simulate rent collect for Aditya
      const aditya = this.crudService.getAll<any>(StorageKeys.TENANTS).find((t: any) => t.fullName.includes('Aditya'));
      if (aditya) {
        this.rentTenantId = aditya.id;
        this.rentAmount = aditya.pendingDues;
        this.rentMode = 'UPI';
        this.setTab('collect');
      }
      this.voiceActive.set(false);
      this.voiceStatus.set('');
    }, 3200);
  }
}
