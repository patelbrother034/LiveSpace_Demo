import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface BrandConfig {
  name: string;
  domain: string;
  hue: number;
  typography: string;
  logoUrl: string;
}

@Component({
  selector: 'app-enterprise-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="White-Label & Brand Manager" subtitle="Customize client portals, modify design themes, and check previews" />

      <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        <!-- Left: Brand Customizer Panel -->
        <div class="xl:col-span-2 glass-card p-6 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Brand Configurations</h4>
          
          <div class="space-y-4 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-500 uppercase text-[9px]">Platform Brand Name</label>
              <input type="text" [(ngModel)]="brandName" (ngModelChange)="updatePreview()"
                class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-500 uppercase text-[9px]">Custom Portal Domain</label>
              <input type="text" [(ngModel)]="brandDomain"
                class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
            </div>

            <!-- HSL Primary Color Hue Slider -->
            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <label class="font-bold text-slate-500 uppercase text-[9px]">Primary HSL Hue ({{ brandHue }}°)</label>
                <span class="h-4 w-4 rounded-full" [style.backgroundColor]="'hsl(' + brandHue + ', 75%, 50%)'"></span>
              </div>
              <input type="range" min="0" max="360" [(ngModel)]="brandHue" (ngModelChange)="updatePreview()"
                class="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none dark:bg-slate-700">
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-500 uppercase text-[9px]">Default Typography</label>
              <select [(ngModel)]="brandTypography" (change)="updatePreview()"
                class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
                <option value="font-sans">Inter / Standard Sans-Serif</option>
                <option value="font-serif">Outfit / Premium Serif</option>
                <option value="font-mono">Fira Code / Tech Monospace</option>
              </select>
            </div>

            <button pButton label="Publish Branding Changes" icon="pi pi-check" (click)="saveBranding()"
              class="w-full py-2.5 rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-650 font-bold shadow-md shadow-indigo-500/10">
            </button>
          </div>
        </div>

        <!-- Right: Real-time Live Portal Preview Frame -->
        <div class="xl:col-span-3 space-y-4">
          <div class="flex justify-between items-center pb-2">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Live Preview Window</h4>
            <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-extrabold uppercase animate-pulse">Preview Mode</span>
          </div>

          <!-- Simulated Browser Viewport with dynamic styles -->
          <div class="w-full rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden text-slate-800 select-none flex flex-col h-[400px]">
            
            <!-- Browser Header -->
            <div class="h-10 px-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div class="flex gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <div class="h-6 w-72 rounded bg-white border border-slate-200 text-[10px] text-slate-400 flex items-center px-3 font-mono leading-none truncate">
                https://{{ brandDomain }}/tenant/dashboard
              </div>
              <div></div>
            </div>

            <!-- Embedded Live Portal body styled dynamically -->
            <div class="flex-1 p-5 space-y-5 bg-slate-50" [class]="brandTypography">
              
              <!-- Portal Header Mock -->
              <div class="flex justify-between items-center pb-3 border-b border-slate-200">
                <div class="flex items-center gap-2">
                  <div class="h-7 w-7 rounded-full flex items-center justify-center font-black text-white text-xs shadow-md shadow-slate-400/20"
                    [style.backgroundColor]="'hsl(' + brandHue + ', 75%, 45%)'">
                    {{ brandName.substring(0, 2).toUpperCase() }}
                  </div>
                  <h4 class="text-xs font-black tracking-wide" [style.color]="'hsl(' + brandHue + ', 75%, 40%)'">
                    {{ brandName }}
                  </h4>
                </div>
                <span class="text-[9px] font-bold text-slate-400">Welcome, Aditya Patel</span>
              </div>

              <!-- Quick mock panels -->
              <div class="grid grid-cols-3 gap-3">
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Room</p>
                  <h5 class="text-sm font-black text-slate-800">Room 102</h5>
                </div>
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Payments status</p>
                  <h5 class="text-xs font-bold text-emerald-500 flex items-center gap-0.5">● Paid</h5>
                </div>
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm space-y-1">
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Open Tickets</p>
                  <h5 class="text-sm font-black text-slate-850">0 Active</h5>
                </div>
              </div>

              <!-- Primary action button mockup -->
              <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h5 class="text-xs font-bold text-slate-800">Support Helpdesk Queue</h5>
                  <p class="text-[9.5px] text-slate-400 mt-0.5">Submit maintenance requests immediately.</p>
                </div>
                <button class="px-4 py-1.5 rounded-xl border-none text-[10.5px] font-bold text-white shadow-lg cursor-pointer transition-all hover:opacity-90"
                  [style.backgroundColor]="'hsl(' + brandHue + ', 75%, 50%)'"
                  [style.boxShadow]="'0 4px 12px rgba(' + Math.floor(brandHue * 0.7) + ', 102, 241, 0.2)'">
                  Raise Ticket
                </button>
              </div>

            </div>

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
export class EnterpriseProperties implements OnInit {
  // Brand Signal params
  brandName = 'LiveSpace Elite';
  brandDomain = 'eliteliving.livespace.pro';
  brandHue = 243;
  brandTypography = 'font-sans';
  brandLogoUrl = '';

  Math = Math;

  ngOnInit() {
    this.loadBranding();
  }

  loadBranding() {
    const brand = localStorage.getItem('lsp_brand_config');
    if (brand) {
      const parsed: BrandConfig = JSON.parse(brand);
      this.brandName = parsed.name;
      this.brandDomain = parsed.domain;
      this.brandHue = parsed.hue;
      this.brandTypography = parsed.typography;
      this.brandLogoUrl = parsed.logoUrl;
    }
  }

  updatePreview() {
    // Instant triggers handled by angular signals binding
  }

  saveBranding() {
    const config: BrandConfig = {
      name: this.brandName,
      domain: this.brandDomain,
      hue: Number(this.brandHue),
      typography: this.brandTypography,
      logoUrl: this.brandLogoUrl
    };
    localStorage.setItem('lsp_brand_config', JSON.stringify(config));
    alert('Enterprise branding updates successfully published and applied globally!');
  }
}
