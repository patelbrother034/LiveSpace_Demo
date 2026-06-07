import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';

interface Asset {
  id: string;
  propertyId: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition: 'Good' | 'Fair' | 'Poor' | 'Replaced';
  purchaseDate?: string;
  purchasePrice?: number;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  maintenanceCount: number;
  status: 'Active' | 'InRepair' | 'Retired' | 'Disposed';
}

interface Property {
  id: string;
  name: string;
}

@Component({
  selector: 'app-asset-registry',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, StatCard, ButtonModule, InputTextModule, TooltipModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Equipment & Asset Registry" subtitle="Manage and monitor home appliances, ACs, geysers, and furniture across your PG units">
        <button pButton label="Add Equipment" icon="pi pi-plus" (click)="showAddAssetModal()"
          class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90">
        </button>
      </app-page-header>

      <!-- KPI Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <app-stat-card label="Total Assets" [value]="assets().length + ' Items'" icon="pi-box" color="primary" />
        <app-stat-card label="Good Condition" [value]="goodCount() + ' Items'" icon="pi-check-circle" color="success" />
        <app-stat-card label="Requires Service" [value]="poorCount() + ' Alert'" icon="pi-exclamation-triangle" color="danger" />
        <app-stat-card label="Under Warranty" [value]="warrantyCount() + ' Active'" icon="pi-shield" color="info" />
      </div>

      <!-- Filters & Toolbar -->
      <div class="glass-card p-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search input -->
          <div class="relative md:col-span-2">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input type="text" pInputText
              placeholder="Search by name, brand, model..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event)" />
          </div>

          <!-- Property Filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
              [ngModel]="selectedProperty()"
              (ngModelChange)="selectedProperty.set($event)">
              <option value="All">All Properties</option>
              @for (prop of properties(); track prop.id) {
                <option [value]="prop.id">{{ prop.name }}</option>
              }
            </select>
          </div>

          <!-- Condition Filter -->
          <div>
            <select
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
              [ngModel]="selectedCondition()"
              (ngModelChange)="selectedCondition.set($event)">
              <option value="All">All Conditions</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Replaced">Replaced</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Assets Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @for (asset of filteredAssets(); track asset.id) {
          <div class="glass-card p-6 flex flex-col justify-between hover:scale-[1.01] hover:shadow-lg transition-all duration-300 relative group">
            
            <!-- Glow Accent -->
            <div class="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-all"></div>

            <div class="space-y-4">
              <!-- Header Category / Condition -->
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {{ asset.category }}
                </span>
                
                <!-- Reactive Condition Selector Badge -->
                <div class="relative">
                  <select
                    [class]="getConditionClass(asset.condition) + ' px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border-none tracking-wider cursor-pointer appearance-none text-center'"
                    [ngModel]="asset.condition"
                    (ngModelChange)="updateCondition(asset.id, $event)">
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Replaced">Replaced</option>
                  </select>
                </div>
              </div>

              <!-- Name & Details -->
              <div>
                <h3 class="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-500 transition-colors">{{ asset.name }}</h3>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Brand: <span class="font-semibold text-slate-700 dark:text-slate-300">{{ asset.brand || 'N/A' }}</span> • Model: <span class="font-semibold text-slate-700 dark:text-slate-300">{{ asset.model || 'N/A' }}</span>
                </p>
                @if (asset.serialNumber) {
                  <p class="text-[10px] font-mono text-slate-400 mt-0.5">S/N: {{ asset.serialNumber }}</p>
                }
              </div>

              <!-- Property/Room Mapping info -->
              <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <i class="pi pi-map-marker text-indigo-500 text-xs"></i>
                <span class="truncate">{{ getPropertyName(asset.propertyId) }}</span>
              </div>

              <!-- Dates, Warranty, Maintenance Logs -->
              <div class="grid grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Date</p>
                  <p class="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{{ asset.purchaseDate || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warranty Expiry</p>
                  <p class="font-medium text-slate-700 dark:text-slate-300 mt-0.5"
                     [class]="isWarrantyExpired(asset.warrantyExpiry) ? 'text-red-500' : 'text-emerald-500'">
                    {{ asset.warrantyExpiry || 'N/A' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer Details & Quick Action -->
            <div class="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/60">
              <span class="text-[10px] text-slate-400">Maintained: <strong class="text-slate-600 dark:text-slate-300">{{ asset.maintenanceCount }} times</strong></span>
              <button pButton label="Mark Maintained" icon="pi pi-cog" (click)="markAssetMaintained(asset.id)"
                class="p-button-text p-button-xs rounded-lg text-indigo-500 hover:bg-indigo-500/5 text-xs font-semibold p-1">
              </button>
            </div>

          </div>
        } @empty {
          <div class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            No equipment/assets found matching the current filters.
          </div>
        }
      </div>

      <!-- Add Asset Simple Overlay (Inline Mock representation for premium feel) -->
      @if (showAddForm()) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div class="glass-card max-w-xl w-full p-8 relative overflow-hidden">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-6">Register New Equipment Asset</h3>
            
            <form (ngSubmit)="submitNewAsset()" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Asset Name *</label>
                  <input type="text" pInputText required [(ngModel)]="newAsset.name" name="name" class="w-full text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Category *</label>
                  <select required [(ngModel)]="newAsset.category" name="category" class="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                    <option value="AC">AC</option>
                    <option value="Geyser">Geyser</option>
                    <option value="Fan">Fan</option>
                    <option value="Bed">Bed</option>
                    <option value="Mattress">Mattress</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Appliance">Appliance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Brand</label>
                  <input type="text" pInputText [(ngModel)]="newAsset.brand" name="brand" class="w-full text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Model</label>
                  <input type="text" pInputText [(ngModel)]="newAsset.model" name="model" class="w-full text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1">PG Property *</label>
                  <select required [(ngModel)]="newAsset.propertyId" name="propertyId" class="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                    <option value="" disabled>Select Property</option>
                    @for (p of properties(); track p.id) {
                      <option [value]="p.id">{{ p.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-400 uppercase mb-1">Condition *</label>
                  <select required [(ngModel)]="newAsset.condition" name="condition" class="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2">
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" pButton label="Cancel" (click)="showAddForm.set(false)" class="p-button-text p-button-sm text-slate-500"></button>
                <button type="submit" pButton label="Register Asset" class="p-button-sm rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white hover:opacity-90"></button>
              </div>
            </form>
          </div>
        </div>
      }
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
  `]
})
export class AssetRegistry implements OnInit {
  private crudService = inject(CrudService);

  assets = signal<Asset[]>([]);
  properties = signal<Property[]>([]);

  // Filter keys
  searchQuery = signal('');
  selectedProperty = signal('All');
  selectedCondition = signal('All');

  // Overlay state
  showAddForm = signal(false);
  newAsset = {
    name: '',
    category: 'AC',
    brand: '',
    model: '',
    propertyId: '',
    condition: 'Good' as 'Good' | 'Fair' | 'Poor'
  };

  // computed KPIs
  goodCount = computed(() => this.assets().filter(a => a.condition === 'Good').length);
  poorCount = computed(() => this.assets().filter(a => a.condition === 'Poor').length);
  warrantyCount = computed(() => this.assets().filter(a => !this.isWarrantyExpired(a.warrantyExpiry)).length);

  filteredAssets = computed(() => {
    let list = this.assets();
    const query = this.searchQuery().toLowerCase().trim();
    const propId = this.selectedProperty();
    const cond = this.selectedCondition();

    if (query) {
      list = list.filter(a =>
        a.name.toLowerCase().includes(query) ||
        (a.brand && a.brand.toLowerCase().includes(query)) ||
        (a.model && a.model.toLowerCase().includes(query))
      );
    }

    if (propId !== 'All') {
      list = list.filter(a => a.propertyId === propId);
    }

    if (cond !== 'All') {
      list = list.filter(a => a.condition === cond);
    }

    return list;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const list = this.crudService.getAll<Asset>(StorageKeys.ASSETS);
    this.assets.set(list);

    const props = this.crudService.getAll<Property>(StorageKeys.PROPERTIES);
    this.properties.set(props);
  }

  getPropertyName(id: string): string {
    const prop = this.properties().find(p => p.id === id);
    return prop ? prop.name : 'Unknown Property';
  }

  isWarrantyExpired(expiryDate?: string): boolean {
    if (!expiryDate) return true;
    return new Date(expiryDate).getTime() < new Date().getTime();
  }

  getConditionClass(condition: string): string {
    switch (condition) {
      case 'Good':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
      case 'Fair':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
      case 'Poor':
        return 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  updateCondition(id: string, newCond: 'Good' | 'Fair' | 'Poor' | 'Replaced') {
    const all = this.crudService.getAll<Asset>(StorageKeys.ASSETS);
    const idx = all.findIndex(a => a.id === id);
    if (idx !== -1) {
      all[idx].condition = newCond;
      localStorage.setItem(StorageKeys.ASSETS, JSON.stringify(all));
      this.assets.set(all);
    }
  }

  markAssetMaintained(id: string) {
    const all = this.crudService.getAll<Asset>(StorageKeys.ASSETS);
    const idx = all.findIndex(a => a.id === id);
    if (idx !== -1) {
      all[idx].maintenanceCount += 1;
      all[idx].lastMaintenanceDate = new Date().toISOString().split('T')[0];
      localStorage.setItem(StorageKeys.ASSETS, JSON.stringify(all));
      this.assets.set(all);
      alert('Asset marked as maintained today!');
    }
  }

  showAddAssetModal() {
    this.newAsset = {
      name: '',
      category: 'AC',
      brand: '',
      model: '',
      propertyId: this.properties()[0]?.id || '',
      condition: 'Good'
    };
    this.showAddForm.set(true);
  }

  submitNewAsset() {
    if (!this.newAsset.name || !this.newAsset.propertyId) return;

    const fullNewAsset: Asset = {
      id: `ast-${Date.now().toString(36)}`,
      propertyId: this.newAsset.propertyId,
      name: this.newAsset.name,
      category: this.newAsset.category,
      brand: this.newAsset.brand,
      model: this.newAsset.model,
      condition: this.newAsset.condition,
      purchaseDate: new Date().toISOString().split('T')[0],
      maintenanceCount: 0,
      status: 'Active'
    };

    const all = this.crudService.getAll<Asset>(StorageKeys.ASSETS);
    all.unshift(fullNewAsset);
    localStorage.setItem(StorageKeys.ASSETS, JSON.stringify(all));
    
    this.assets.set(all);
    this.showAddForm.set(false);
  }
}
