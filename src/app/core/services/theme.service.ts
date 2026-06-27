import { Injectable, signal, effect, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../constants/storage-keys.constants';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storage = inject(StorageService);
  
  currentTheme = signal<string>('light');
  currentColorTheme = signal<string>('Indigo');

  constructor() {
    // 1. Initial theme load: Check localStorage override first, then system media query
    const stored = this.storage.getItem<string>(StorageKeys.THEME);
    const initialTheme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.currentTheme.set(initialTheme);
    this.updateThemeClass(initialTheme);

    // Initial color theme load
    const storedColor = this.storage.getItem<string>('lsp_color_theme') || 'Indigo';
    this.currentColorTheme.set(storedColor);
    this.updateColorThemeClass(storedColor);

    // 2. Listen for real-time system/browser preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-update if the user has not established a manual localStorage override
      if (!this.storage.getItem(StorageKeys.THEME)) {
        const nextTheme = e.matches ? 'dark' : 'light';
        this.currentTheme.set(nextTheme);
        this.updateThemeClass(nextTheme);
      }
    });

    // 3. Reactively update the DOM html classes
    effect(() => {
      this.updateThemeClass(this.currentTheme());
    });

    effect(() => {
      this.updateColorThemeClass(this.currentColorTheme());
    });
  }

  private updateThemeClass(theme: string): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  private updateColorThemeClass(themeName: string): void {
    document.documentElement.classList.remove('theme-indigo', 'theme-emerald', 'theme-rose');
    document.documentElement.classList.add(`theme-${themeName.toLowerCase()}`);
  }

  toggleTheme(): void {
    const nextTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(nextTheme);
    this.storage.setItem(StorageKeys.THEME, nextTheme);
    this.updateThemeClass(nextTheme);
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
    this.storage.setItem(StorageKeys.THEME, theme);
    this.updateThemeClass(theme);
  }

  setColorTheme(themeName: string): void {
    this.currentColorTheme.set(themeName);
    this.storage.setItem('lsp_color_theme', themeName);
    this.updateColorThemeClass(themeName);
  }
}
