import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface KPICard {
  id: string;
  title: string;
  value: string;
  icon: string;
  color: string;
  category: string;
  visible: boolean;
}

@Component({
  selector: 'app-enterprise-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="KPI Dashboard Builder" subtitle="Assemble customized reporting widgets and drag metrics deck layouts" />

      <div class="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        <!-- Left Sidebar: Select KPIs checklist -->
        <div class="xl:col-span-1 glass-card p-5 space-y-4 h-fit">
          <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Metrics Library</h4>
          <p class="text-[9.5px] text-slate-500 leading-relaxed">Toggle the checkboxes below to immediately add or remove cards from your dashboard deck.</p>
          
          <div class="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            @for (k of kpis(); track k.id) {
              <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div class="flex items-center gap-2">
                  <i class="pi" [class]="k.icon" [style.color]="k.color"></i>
                  <span class="font-bold text-slate-700 dark:text-slate-350">{{ k.title }}</span>
                </div>
                <input type="checkbox" [(ngModel)]="k.visible" (change)="saveConfig()" class="h-4 w-4 rounded text-indigo-600">
              </div>
            }
          </div>
        </div>

        <!-- Right: Dynamic Live Dashboard Preview -->
        <div class="xl:col-span-3 space-y-4">
          <div class="flex justify-between items-center pb-1">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Custom Dashboard Preview</h4>
            <span class="text-[9px] px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-extrabold uppercase select-none">Live Layout</span>
          </div>

          <!-- Dynamic Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            @for (k of activeKPIs(); track k.id) {
              <div class="glass-card p-5 space-y-3 hover:scale-[1.02] transition-all relative overflow-hidden group">
                <!-- Color glowing corner -->
                <div class="absolute -top-12 -right-12 h-24 w-24 rounded-full opacity-10 blur-xl group-hover:scale-150 transition-all"
                  [style.backgroundColor]="k.color"></div>
                
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-extrabold uppercase text-slate-400">{{ k.category }}</span>
                  <div class="h-8 w-8 rounded-full flex items-center justify-center"
                    [style.backgroundColor]="k.color + '15'">
                    <i class="pi" [class]="k.icon" [style.color]="k.color"></i>
                  </div>
                </div>

                <div class="space-y-0.5">
                  <h3 class="text-xl font-black text-slate-850 dark:text-white">{{ k.value }}</h3>
                  <p class="text-xs font-bold text-slate-700 dark:text-slate-450">{{ k.title }}</p>
                </div>
              </div>
            } @empty {
              <div class="col-span-full h-48 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs italic">
                <i class="pi pi-box text-2xl mb-2"></i>
                Select metrics from the library to populate your dashboard deck.
              </div>
            }
          </div>
        </div>

      </div>
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
export class EnterpriseStaff implements OnInit {
  kpis = signal<KPICard[]>([]);

  activeKPIs = computed(() => this.kpis().filter(k => k.visible));

  ngOnInit() {
    this.loadConfig();
  }

  loadConfig() {
    const list = localStorage.getItem('lsp_enterprise_custom_kpis');
    if (list) {
      this.kpis.set(JSON.parse(list));
    } else {
      const seed: KPICard[] = [
        { id: 'k-1', title: 'Net Income Collections', value: '₹7,85,000', icon: 'pi-indian-rupee', color: 'hsl(142, 70%, 45%)', category: 'Finance', visible: true },
        { id: 'k-2', title: 'Outstanding Aging Dues', value: '₹24,500', icon: 'pi-clock', color: 'hsl(346, 80%, 55%)', category: 'Finance', visible: true },
        { id: 'k-3', title: 'Active Helpdesk Tickets', value: '5 Tickets', icon: 'pi-ticket', color: 'hsl(243, 75%, 59%)', category: 'Operations', visible: true },
        { id: 'k-4', title: 'Curfew Violations Warning', value: '2 Alerts', icon: 'pi-exclamation-triangle', color: 'hsl(38, 92%, 50%)', category: 'Safety', visible: false },
        { id: 'k-5', title: 'Asset Stock Level', value: '98 Spares', icon: 'pi-box', color: 'hsl(200, 95%, 40%)', category: 'Inventory', visible: false },
        { id: 'k-6', title: 'Staff Attendance Rate', value: '96.8% Score', icon: 'pi-check-circle', color: 'hsl(142, 70%, 45%)', category: 'HR Operations', visible: true }
      ];
      localStorage.setItem('lsp_enterprise_custom_kpis', JSON.stringify(seed));
      this.kpis.set(seed);
    }
  }

  saveConfig() {
    localStorage.setItem('lsp_enterprise_custom_kpis', JSON.stringify(this.kpis()));
  }
}
