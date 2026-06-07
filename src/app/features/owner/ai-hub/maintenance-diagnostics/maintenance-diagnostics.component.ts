import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { ButtonModule } from 'primeng/button';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  details?: {
    cause: string;
    severity: 'Low' | 'Medium' | 'Critical';
    cost: number;
    spares: string;
  };
}

interface AssetHealth {
  name: string;
  score: number;
  daysToFailure: number;
  status: string;
}

@Component({
  selector: 'app-ai-maintenance-diagnostics',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="Prescriptive Maintenance Diagnostics" subtitle="Predict machine and appliance faults before they fail and verify AI-guided repairs" />

      <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        <!-- Left: AI Diagnostics Chat Drawer -->
        <div class="xl:col-span-3 glass-card p-6 flex flex-col h-[540px] justify-between relative">
          
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">AI Diagnostics Console</h4>
            
            <!-- Chat logs -->
            <div class="space-y-3 h-[320px] overflow-y-auto pr-1">
              @for (msg of chatMessages(); track msg.timestamp.getTime()) {
                <div class="flex" [class.justify-end]="msg.sender === 'user'">
                  <div class="p-3.5 rounded-2xl max-w-sm text-xs space-y-2"
                    [class]="msg.sender === 'user' ? 'bg-indigo-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/60'">
                    <p class="leading-relaxed">{{ msg.text }}</p>
                    
                    @if (msg.details) {
                      <div class="pt-2 border-t border-slate-200/60 dark:border-slate-700 space-y-1 text-[10px] text-slate-650 dark:text-slate-400 font-bold">
                        <p class="text-red-500 uppercase tracking-wide text-[8.5px] font-black">AI Diagnosis:</p>
                        <p>· Cause: {{ msg.details.cause }}</p>
                        <p>· Severity: 
                          <span class="px-1.5 py-0.5 rounded text-[8px] uppercase"
                            [class]="msg.details.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'">
                            {{ msg.details.severity }}
                          </span>
                        </p>
                        <p>· Spares: {{ msg.details.spares }}</p>
                        <p>· Est Repair Quote: <span class="text-indigo-500 dark:text-indigo-400 font-extrabold">₹{{ msg.details.cost | number:'1.0-0' }}</span></p>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (isTyping()) {
                <div class="flex items-center gap-1.5 pl-3">
                  <span class="h-1.5 w-1.5 rounded-full bg-slate-450 animate-bounce" style="animation-delay: 0.1s"></span>
                  <span class="h-1.5 w-1.5 rounded-full bg-slate-450 animate-bounce" style="animation-delay: 0.2s"></span>
                  <span class="h-1.5 w-1.5 rounded-full bg-slate-450 animate-bounce" style="animation-delay: 0.3s"></span>
                </div>
              }
            </div>
          </div>

          <!-- Quick click symptom buttons -->
          <div class="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-3">
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Select Symptom to Diagnose:</p>
            <div class="flex flex-wrap gap-2">
              @for (sym of symptoms; track sym) {
                <button (click)="submitSymptom(sym)" [disabled]="isTyping()"
                  class="py-1 px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-750 dark:text-slate-350 cursor-pointer hover:border-indigo-500 transition-all">
                  {{ sym }}
                </button>
              }
            </div>
          </div>

        </div>

        <!-- Right: Predictive Health Assets list -->
        <div class="xl:col-span-2 space-y-6">
          <div class="glass-card p-5 space-y-4">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Predictive Appliance Warning</h4>
            
            <div class="space-y-4">
              @for (a of assets(); track a.name) {
                <div class="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between text-xs">
                  <div class="space-y-0.5">
                    <h5 class="font-bold text-slate-850 dark:text-white">{{ a.name }}</h5>
                    <p class="text-[10px] text-red-500 font-bold" *ngIf="a.daysToFailure <= 15">⚠️ Predictive fail-check in {{ a.daysToFailure }} days</p>
                    <p class="text-[10px] text-slate-400 mt-0.5" *ngIf="a.daysToFailure > 15">Operating normally</p>
                  </div>
                  
                  <div class="text-right">
                    <span class="font-black text-xs" [class]="a.score > 80 ? 'text-emerald-500' : a.score > 50 ? 'text-amber-500' : 'text-red-500'">
                      Health Score: {{ a.score }}%
                    </span>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="glass-card p-5 space-y-3.5">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Budget projections</h4>
            <div class="flex justify-between items-center text-xs">
              <span>Next Quarter Maintenance Reserves:</span>
              <span class="font-extrabold text-slate-800 dark:text-white">₹14,500</span>
            </div>
            <div class="w-full bg-slate-150 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div class="bg-indigo-500 h-full" style="width: 35%"></div>
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
export class AIMaintenanceDiagnostics {
  // Symptoms presets
  symptoms = [
    'AC emitting rattling sound on 2nd Floor',
    'Geyser heating cycle is extremely weak',
    'RO water purifier filter tasting salty'
  ];

  assets = signal<AssetHealth[]>([
    { name: 'AC Compressor Unit 201', score: 48, daysToFailure: 12, status: 'Warning' },
    { name: 'RO Filter Core B', score: 55, daysToFailure: 14, status: 'Warning' },
    { name: 'Geyser Coil Building A', score: 92, daysToFailure: 110, status: 'Healthy' }
  ]);

  chatMessages = signal<Message[]>([
    { sender: 'ai', text: 'Prescriptive Maintenance Engine online. Select an appliance symptom below to compile a diagnosis report.', timestamp: new Date() }
  ]);

  isTyping = signal(false);

  submitSymptom(symptom: string) {
    // 1. Add user query
    const userMsg: Message = { sender: 'user', text: symptom, timestamp: new Date() };
    const current = this.chatMessages();
    current.push(userMsg);
    this.chatMessages.set([...current]);

    this.isTyping.set(true);

    // 2. Compute AI response after 1.5s delay
    setTimeout(() => {
      let aiText = '';
      let details: any;

      if (symptom.includes('rattling')) {
        aiText = 'AC unit 201 diagnostic scan complete. The rattling sound is caused by mechanical vibration outside tolerances.';
        details = {
          cause: 'Compressor anti-vibration mount dampers fully worn out.',
          severity: 'Medium',
          cost: 1500,
          spares: 'Rubber Damper Spares Part #AC-RD4'
        };
      } else if (symptom.includes('Geyser')) {
        aiText = 'Geyser heating cycle diagnostic scan complete. Weak thermal transmission identified.';
        details = {
          cause: 'Scale deposit accumulation surrounding the copper heating coil.',
          severity: 'Medium',
          cost: 1800,
          spares: 'Copper Heating Element 2kW'
        };
      } else {
        aiText = 'RO Filter B diagnostic scan complete. Total Dissolved Solids (TDS) indexes are above normal limits.';
        details = {
          cause: 'Pre-activated carbon filters and membrane fully choked.',
          severity: 'Critical',
          cost: 3200,
          spares: 'RO Membrane + Carbon filter bundle kit'
        };
      }

      const responseMsg: Message = { sender: 'ai', text: aiText, details: details, timestamp: new Date() };
      const list = this.chatMessages();
      list.push(responseMsg);
      this.chatMessages.set([...list]);
      this.isTyping.set(false);
    }, 1500);
  }
}
