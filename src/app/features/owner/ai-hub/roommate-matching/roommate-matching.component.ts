import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { CrudService } from '../../../../core/services/crud.service';
import { StorageKeys } from '../../../../core/constants/storage-keys.constants';
import { ButtonModule } from 'primeng/button';

interface Tenant {
  id: string;
  fullName: string;
  propertyId: string;
  roomId: string;
  bedId: string;
  status: string;
}

interface MatchCandidate {
  id: string;
  fullName: string;
  compatibility: number;
  sleepScore: number;
  foodScore: number;
  studyScore: number;
  socialScore: number;
  noiseScore: number;
}

@Component({
  selector: 'app-ai-roommate-matching',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, ButtonModule],
  template: `
    <div class="space-y-8 animate-fade-in">
      <app-page-header title="AI Roommate Matchmaker" subtitle="Match incoming residents using behavioral profiles and verify radar dimensions" />

      <div class="grid grid-cols-1 xl:grid-cols-5 gap-8">
        
        <!-- Left: Matchmaker Controller & Candidates -->
        <div class="xl:col-span-2 glass-card p-6 space-y-4">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Candidate Matchmaker</h4>
          
          <div class="space-y-3 text-xs">
            <div class="space-y-1">
              <label class="font-bold text-slate-500 uppercase text-[9px]">Select Target Tenant</label>
              <select [(ngModel)]="selectedTenantId" (change)="onTenantSelected()"
                class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-1 focus:ring-indigo-500">
                <option value="">-- Select Active Resident --</option>
                @for (t of tenants(); track t.id) {
                  <option [value]="t.id">{{ t.fullName }} (Room {{ t.roomId.replace('room-', '').toUpperCase() }})</option>
                }
              </select>
            </div>

            @if (selectedTenantId) {
              <button pButton label="Compute Cohort Matches" icon="pi pi-sparkles" (click)="runMatchmaker()"
                class="w-full py-2.5 rounded-xl bg-indigo-500 border-none text-white hover:bg-indigo-650 font-bold shadow-md shadow-indigo-500/10">
              </button>
            }
          </div>

          <!-- Matching processing delay spinner -->
          @if (isMatching()) {
            <div class="py-12 flex flex-col items-center justify-center space-y-3 animate-fade-in">
              <div class="flex items-center gap-1.5">
                <span class="h-2 w-2 rounded-full bg-indigo-500 animate-ping" style="animation-delay: 0.1s"></span>
                <span class="h-2 w-2 rounded-full bg-indigo-500 animate-ping" style="animation-delay: 0.2s"></span>
                <span class="h-2 w-2 rounded-full bg-indigo-500 animate-ping" style="animation-delay: 0.3s"></span>
              </div>
              <p class="text-xs font-bold text-indigo-500 italic">Processing behavioral vectors compatibility...</p>
            </div>
          }

          <!-- Candidates List -->
          @if (hasMatched() && !isMatching()) {
            <div class="space-y-3 animate-fade-in">
              <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Top Compatibility Pairs</h5>
              
              <div class="space-y-2.5">
                @for (c of candidates(); track c.id) {
                  <div (click)="selectCandidate(c)"
                    class="p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4"
                    [class]="selectedCandId() === c.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/20 bg-white/40 dark:bg-slate-900/40'">
                    <div class="space-y-1">
                      <h5 class="text-xs font-bold text-slate-850 dark:text-white">{{ c.fullName }}</h5>
                      <div class="flex items-center gap-2">
                        <div class="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div class="bg-indigo-500 h-full" [style.width.%]="c.compatibility"></div>
                        </div>
                        <span class="text-[10px] font-extrabold text-indigo-500">{{ c.compatibility }}% Match</span>
                      </div>
                    </div>

                    <button pButton label="Assign Together" (click)="assignRoommates(c)"
                      class="p-button-xs rounded-lg px-2 py-1 text-[9.5px] bg-emerald-500 border-none text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/10">
                    </button>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Right: Radar Chart Visualization -->
        <div class="xl:col-span-3 space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/85">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Compatibility Radar Chart</h4>
            <span class="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-extrabold uppercase select-none">AI Profile Map</span>
          </div>

          @if (hasMatched() && selectedCandId() && !isMatching()) {
            <!-- Custom Radar chart SVG -->
            <div class="glass-card p-6 flex flex-col items-center justify-center space-y-5 h-[400px] animate-fade-in">
              <svg viewBox="0 0 200 200" class="w-64 h-64 overflow-visible">
                <!-- ConcentricPentagons -->
                <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800" />
                <polygon points="100,40 161,84 138,152 62,152 39,84" fill="none" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800" />
                <polygon points="100,60 146,93 129,139 71,139 54,93" fill="none" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800" />
                <polygon points="100,80 131,102 120,126 80,126 69,102" fill="none" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-800/60" />

                <!-- Axes Rays -->
                <line x1="100" y1="100" x2="100" y2="20" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />
                <line x1="100" y1="100" x2="176" y2="75" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />
                <line x1="100" y1="100" x2="147" y2="165" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />
                <line x1="100" y1="100" x2="53" y2="165" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />
                <line x1="100" y1="100" x2="24" y2="75" stroke="#e2e8f0" stroke-width="1" class="dark:stroke-slate-850" />

                <!-- Labels -->
                <text x="100" y="14" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="middle">Sleep Schedule (40%)</text>
                <text x="182" y="78" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="start">Food Preference (30%)</text>
                <text x="153" y="174" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="start">Study Habits (15%)</text>
                <text x="47" y="174" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="end">Social Style (10%)</text>
                <text x="18" y="78" font-size="7" font-weight="extrabold" fill="#94a3b8" text-anchor="end">Noise Tolerance (5%)</text>

                <!-- Polyline Shape -->
                <polygon [attr.points]="radarPoints()" fill="rgba(99, 102, 241, 0.15)" stroke="hsl(243, 75%, 59%)" stroke-width="2.5" />
              </svg>
              
              <p class="text-[10px] text-slate-500 italic text-center font-bold">
                Compatibility Overlay Profile: {{ selectedCandName() }} vs {{ getTargetTenantName() }}
              </p>
            </div>
          @} @else {
            <div class="h-[400px] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs italic">
              <i class="pi pi-users text-2xl mb-2 text-indigo-500 animate-pulse"></i>
              Select resident and click 'Compute Cohort Matches' to visualize behavioral radar overlays.
            </div>
          }
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
export class AIRoommateMatching implements OnInit {
  private crudService = inject(CrudService);

  tenants = signal<Tenant[]>([]);
  candidates = signal<MatchCandidate[]>([]);

  selectedTenantId = '';
  selectedCandId = signal('');
  selectedCandName = signal('');
  
  isMatching = signal(false);
  hasMatched = signal(false);

  // Radar points attributes
  radarPoints = signal('100,100 100,100 100,100 100,100 100,100');

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    const list = this.crudService.getAll<Tenant>(StorageKeys.TENANTS);
    this.tenants.set(list.filter(t => t.propertyId === 'prop-001' && t.status === 'Active'));
  }

  onTenantSelected() {
    this.hasMatched.set(false);
    this.selectedCandId.set('');
    this.selectedCandName.set('');
  }

  runMatchmaker() {
    this.isMatching.set(true);
    this.hasMatched.set(false);

    // Simulated processing delay
    setTimeout(() => {
      const seedCandidates: MatchCandidate[] = [
        { id: 'cand-1', fullName: 'Rahul Sharma', compatibility: 94, sleepScore: 90, foodScore: 95, studyScore: 80, socialScore: 85, noiseScore: 70 },
        { id: 'cand-2', fullName: 'Rajesh Sen', compatibility: 88, sleepScore: 85, foodScore: 90, studyScore: 75, socialScore: 80, noiseScore: 60 },
        { id: 'cand-3', fullName: 'Deepak Mishra', compatibility: 82, sleepScore: 80, foodScore: 85, studyScore: 70, socialScore: 75, noiseScore: 50 },
        { id: 'cand-4', fullName: 'Amit Patel', compatibility: 76, sleepScore: 75, foodScore: 80, studyScore: 65, socialScore: 70, noiseScore: 40 },
        { id: 'cand-5', fullName: 'Suresh Kumar', compatibility: 70, sleepScore: 70, foodScore: 75, studyScore: 60, socialScore: 65, noiseScore: 30 }
      ];
      this.candidates.set(seedCandidates);
      this.isMatching.set(false);
      this.hasMatched.set(true);

      // Auto-select first candidate
      this.selectCandidate(seedCandidates[0]);
    }, 2000);
  }

  selectCandidate(c: MatchCandidate) {
    this.selectedCandId.set(c.id);
    this.selectedCandName.set(c.fullName);

    // Compute radar coordinates points (centered at x=100, y=100, radius max=80)
    // pentagon angles: sleep=-90deg, food=-18deg, study=54deg, social=126deg, noise=198deg
    const center = 100;
    
    // score range 0-100 mapped to radius 0-80
    const sleepRad = (c.sleepScore / 100) * 80;
    const foodRad = (c.foodScore / 100) * 80;
    const studyRad = (c.studyScore / 100) * 80;
    const socialRad = (c.socialScore / 100) * 80;
    const noiseRad = (c.noiseScore / 100) * 80;

    // x = center + r * cos(theta), y = center + r * sin(theta)
    const p1 = `${center},${center - sleepRad}`;
    const p2 = `${(center + foodRad * Math.cos(-18 * Math.PI / 180)).toFixed(1)},${(center + foodRad * Math.sin(-18 * Math.PI / 180)).toFixed(1)}`;
    const p3 = `${(center + studyRad * Math.cos(54 * Math.PI / 180)).toFixed(1)},${(center + studyRad * Math.sin(54 * Math.PI / 180)).toFixed(1)}`;
    const p4 = `${(center + socialRad * Math.cos(126 * Math.PI / 180)).toFixed(1)},${(center + socialRad * Math.sin(126 * Math.PI / 180)).toFixed(1)}`;
    const p5 = `${(center + noiseRad * Math.cos(198 * Math.PI / 180)).toFixed(1)},${(center + noiseRad * Math.sin(198 * Math.PI / 180)).toFixed(1)}`;

    this.radarPoints.set(`${p1} ${p2} ${p3} ${p4} ${p5}`);
  }

  assignRoommates(cand: MatchCandidate) {
    const list = this.crudService.getAll<any>(StorageKeys.TENANTS);
    const target = list.find(t => t.id === this.selectedTenantId);
    const candidate = list.find(t => t.fullName.toLowerCase().includes(cand.fullName.toLowerCase()));
    
    if (target && candidate) {
      // Put them in same room (mock update)
      candidate.roomId = target.roomId;
      localStorage.setItem(StorageKeys.TENANTS, JSON.stringify(list));
      alert(`Success! ${cand.fullName} has been assigned roommate to ${target.fullName} in Room ${target.roomId.replace('room-', '').toUpperCase()}!`);
    } else {
      alert(`Simulation Match Success! Assigned roommate pairing.`);
    }
  }

  getTargetTenantName(): string {
    const target = this.tenants().find(t => t.id === this.selectedTenantId);
    return target ? target.fullName : 'Tenant';
  }
}
