import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-enterprise-brand',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule, InputTextModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <app-page-header title="White-Label Configuration" subtitle="Customize your brand identity and preview changes" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Configuration Panel -->
        <div class="glass-card p-5 space-y-5">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-palette mr-2 text-purple-500"></i>Brand Settings</h4>
          <div class="space-y-4">
            <div><label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Brand Name</label><input pInputText class="w-full rounded-lg" [(ngModel)]="config.brandName" /></div>
            <div><label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Tagline</label><input pInputText class="w-full rounded-lg" [(ngModel)]="config.tagline" /></div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Primary Color</label><div class="flex gap-2"><input type="color" class="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer" [(ngModel)]="config.primaryColor" /><input pInputText class="flex-1 rounded-lg text-xs font-mono" [(ngModel)]="config.primaryColor" /></div></div>
              <div><label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Secondary Color</label><div class="flex gap-2"><input type="color" class="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer" [(ngModel)]="config.secondaryColor" /><input pInputText class="flex-1 rounded-lg text-xs font-mono" [(ngModel)]="config.secondaryColor" /></div></div>
            </div>
            <div><label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Logo URL</label><input pInputText class="w-full rounded-lg" [(ngModel)]="config.logoUrl" placeholder="https://example.com/logo.png" /></div>
            <div><label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Custom Domain</label><input pInputText class="w-full rounded-lg" [(ngModel)]="config.domain" placeholder="app.yourbrand.com" /></div>
            <div><label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Font Family</label>
              <select class="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm" [(ngModel)]="config.fontFamily">
                <option>Inter</option><option>Roboto</option><option>Outfit</option><option>Plus Jakarta Sans</option><option>DM Sans</option>
              </select>
            </div>
          </div>
          <button pButton label="Save Configuration" icon="pi pi-save" class="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white" (click)="saveConfig()"></button>
        </div>

        <!-- Live Preview -->
        <div class="glass-card p-5 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider"><i class="pi pi-eye mr-2 text-blue-500"></i>Live Preview</h4>
          <div class="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden" [style.font-family]="config.fontFamily">
            <!-- Preview Header -->
            <div class="p-4 text-white flex items-center gap-3" [style.background]="'linear-gradient(135deg, ' + config.primaryColor + ', ' + config.secondaryColor + ')'">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">{{ config.brandName.charAt(0) }}</div>
              <div><h3 class="font-bold text-lg">{{ config.brandName }}</h3><p class="text-xs text-white/70">{{ config.tagline }}</p></div>
            </div>
            <!-- Preview Content -->
            <div class="p-4 bg-white dark:bg-slate-900 space-y-3">
              <div class="flex gap-3">
                <div class="flex-1 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p class="text-[10px] text-slate-400">Occupancy</p><p class="text-lg font-bold" [style.color]="config.primaryColor">92%</p>
                </div>
                <div class="flex-1 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p class="text-[10px] text-slate-400">Revenue</p><p class="text-lg font-bold" [style.color]="config.secondaryColor">₹3.8L</p>
                </div>
              </div>
              <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <p class="font-bold text-slate-800 dark:text-white mb-1">Welcome to {{ config.brandName }}</p>
                <p>Your premium property management solution at <b>{{ config.domain }}</b></p>
              </div>
              <button class="w-full p-2 rounded-xl text-white text-sm font-bold border-none" [style.background]="config.primaryColor">Dashboard →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `, styles: [``]
})
export class EnterpriseBrand {
  config = { brandName: 'LiveSpace Pro', tagline: 'Intelligent PG Management', primaryColor: '#6366f1', secondaryColor: '#8b5cf6', logoUrl: '', domain: 'app.livespace.pro', fontFamily: 'Inter' };
  saveConfig() { alert('Brand configuration saved successfully!'); }
}
