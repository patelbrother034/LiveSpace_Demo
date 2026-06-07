import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="mt-auto py-4 px-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <div>
        <span>&copy; 2026 <strong>LiveSpace Pro</strong>. All rights reserved.</span>
      </div>
      
      <div class="flex items-center gap-6 mt-2 md:mt-0 font-medium">
        <a href="#" class="hover:text-primary-500 transition-colors">Privacy Policy</a>
        <a href="#" class="hover:text-primary-500 transition-colors">Terms of Service</a>
        <a href="#" class="hover:text-primary-500 transition-colors">Documentation</a>
        <span class="text-slate-300 dark:text-slate-700">|</span>
        <span class="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          v1.0.0 (Local-First)
        </span>
      </div>
    </footer>
  `
})
export class Footer {}
