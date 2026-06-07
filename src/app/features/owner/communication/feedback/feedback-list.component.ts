import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Avatar } from '../../../../shared/components/avatar/avatar';

interface FeedbackItem {
  id: string;
  name: string;
  role: string;
  foodRating: number;
  cleanlinessRating: number;
  wifiRating: number;
  caretakerRating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, PageHeader, Avatar],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Page Header -->
      <app-page-header title="Resident Sentiment & Reviews" subtitle="Monitor quarterly tenant surveys, feedback forms, and overall property satisfaction ratings">
      </app-page-header>

      <!-- SVG Circular Gauges Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- FOOD RATING GAUGE -->
        <div class="glass-card p-5 text-center flex flex-col items-center justify-between">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Food & Mess Service</h4>
          <div class="relative w-28 h-28 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" fill="none" stroke="#f1f5f9" stroke-width="8"></circle>
              <circle cx="56" cy="56" r="48" fill="none" stroke="#6366f1" stroke-width="8"
                      stroke-dasharray="301.6" [attr.stroke-dashoffset]="301.6 * (1 - 4.2/5)"
                      stroke-linecap="round" class="transition-all duration-1000"></circle>
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="text-2xl font-black text-slate-800 dark:text-white">4.2</span>
              <span class="text-[9px] text-slate-400">/ 5.0 Rating</span>
            </div>
          </div>
          <span class="text-xs text-indigo-500 font-bold mt-3">Satisfactory</span>
        </div>

        <!-- CLEANLINESS RATING GAUGE -->
        <div class="glass-card p-5 text-center flex flex-col items-center justify-between">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Room Cleanliness</h4>
          <div class="relative w-28 h-28 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" fill="none" stroke="#f1f5f9" stroke-width="8"></circle>
              <circle cx="56" cy="56" r="48" fill="none" stroke="#10b981" stroke-width="8"
                      stroke-dasharray="301.6" [attr.stroke-dashoffset]="301.6 * (1 - 4.5/5)"
                      stroke-linecap="round" class="transition-all duration-1000"></circle>
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="text-2xl font-black text-slate-800 dark:text-white">4.5</span>
              <span class="text-[9px] text-slate-400">/ 5.0 Rating</span>
            </div>
          </div>
          <span class="text-xs text-emerald-500 font-bold mt-3">Highly Praised</span>
        </div>

        <!-- WIFI SPEED RATING GAUGE -->
        <div class="glass-card p-5 text-center flex flex-col items-center justify-between">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Internet & WiFi Speed</h4>
          <div class="relative w-28 h-28 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" fill="none" stroke="#f1f5f9" stroke-width="8"></circle>
              <circle cx="56" cy="56" r="48" fill="none" stroke="#3b82f6" stroke-width="8"
                      stroke-dasharray="301.6" [attr.stroke-dashoffset]="301.6 * (1 - 3.8/5)"
                      stroke-linecap="round" class="transition-all duration-1000"></circle>
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="text-2xl font-black text-slate-800 dark:text-white">3.8</span>
              <span class="text-[9px] text-slate-400">/ 5.0 Rating</span>
            </div>
          </div>
          <span class="text-xs text-blue-500 font-bold mt-3">Needs Review</span>
        </div>

        <!-- STAFF SPEED RATING GAUGE -->
        <div class="glass-card p-5 text-center flex flex-col items-center justify-between">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Caretaker Assistance</h4>
          <div class="relative w-28 h-28 flex items-center justify-center">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="48" fill="none" stroke="#f1f5f9" stroke-width="8"></circle>
              <circle cx="56" cy="56" r="48" fill="none" stroke="#f59e0b" stroke-width="8"
                      stroke-dasharray="301.6" [attr.stroke-dashoffset]="301.6 * (1 - 4.6/5)"
                      stroke-linecap="round" class="transition-all duration-1000"></circle>
            </svg>
            <div class="absolute flex flex-col items-center">
              <span class="text-2xl font-black text-slate-800 dark:text-white">4.6</span>
              <span class="text-[9px] text-slate-400">/ 5.0 Rating</span>
            </div>
          </div>
          <span class="text-xs text-amber-500 font-bold mt-3">Excellent Speed</span>
        </div>

      </div>

      <!-- Feedbacks Feed Card List -->
      <div class="glass-card p-6 space-y-4 max-w-4xl mx-auto">
        <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
          Quarterly Survey Feedbacks
        </h3>

        <div class="space-y-4">
          @for (item of feedback(); track item.id) {
            <div class="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <app-avatar [name]="item.name" size="sm" />
                  <div>
                    <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ item.name }}</h4>
                    <p class="text-[10px] text-slate-400 mt-0.5">{{ item.role }} • Submitted {{ item.date }}</p>
                  </div>
                </div>

                <!-- Star average representation -->
                <div class="flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg font-bold text-indigo-500">
                  <i class="pi pi-star-fill text-[9px]"></i> {{ getAvgStars(item) }} / 5.0
                </div>
              </div>

              <!-- Rating breakdown indicators -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 border-y border-slate-100 dark:border-slate-800/60 text-xs text-slate-500">
                <div>Food: <strong class="text-slate-700 dark:text-slate-300 font-bold">{{ item.foodRating }}⭐</strong></div>
                <div>Hygiene: <strong class="text-slate-700 dark:text-slate-300 font-bold">{{ item.cleanlinessRating }}⭐</strong></div>
                <div>WiFi: <strong class="text-slate-700 dark:text-slate-300 font-bold">{{ item.wifiRating }}⭐</strong></div>
                <div>Staff: <strong class="text-slate-700 dark:text-slate-300 font-bold">{{ item.caretakerRating }}⭐</strong></div>
              </div>

              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl">
                "{{ item.comment }}"
              </p>
            </div>
          }
        </div>
      </div>
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
export class FeedbackListComponent implements OnInit {
  feedback = signal<FeedbackItem[]>([]);

  ngOnInit() {
    this.loadFeedback();
  }

  loadFeedback() {
    this.feedback.set([
      { id: 'fb-001', name: 'Rajesh Patel', role: 'Parent of Aditya', foodRating: 4, cleanlinessRating: 5, wifiRating: 4, caretakerRating: 5, comment: 'Very happy with the prompt response of the warden when I flagged a heater coil failure. Aditya is having a fully comfortable stay.', date: '2026-05-28' },
      { id: 'fb-002', name: 'Rohan Sharma', role: 'Resident in A-102', foodRating: 4, cleanlinessRating: 4, wifiRating: 3, caretakerRating: 4, comment: 'Overall very good, but the WiFi on the second floor gets clogged in the evening hours when everyone logs in to study.', date: '2026-05-25' },
      { id: 'fb-003', name: 'Sanjay Sharma', role: 'Parent of Rohan', foodRating: 5, cleanlinessRating: 5, wifiRating: 4, caretakerRating: 5, comment: 'Excellent security protocols. Feel very safe sending my child here.', date: '2026-05-20' }
    ]);
  }

  getAvgStars(item: FeedbackItem): string {
    const sum = item.foodRating + item.cleanlinessRating + item.wifiRating + item.caretakerRating;
    return (sum / 4).toFixed(1);
  }
}
