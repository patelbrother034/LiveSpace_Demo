const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src/app/core/services');
const guardsDir = path.join(__dirname, 'src/app/core/guards');
const mockDir = path.join(__dirname, 'src/app/mock-data');
const constantsDir = path.join(__dirname, 'src/app/core/constants');

// Constants
const constants = {
    'storage-keys.constants.ts': `export const StorageKeys = {
  ORGANIZATIONS: 'lsp_organizations',
  PROPERTIES: 'lsp_properties',
  BUILDINGS: 'lsp_buildings',
  FLOORS: 'lsp_floors',
  ROOMS: 'lsp_rooms',
  BEDS: 'lsp_beds',
  TENANTS: 'lsp_tenants',
  PARENTS: 'lsp_parents',
  TRANSACTIONS: 'lsp_transactions',
  TICKETS: 'lsp_tickets',
  VISITORS: 'lsp_visitors',
  STAFF: 'lsp_staff',
  ANNOUNCEMENTS: 'lsp_announcements',
  INVOICES: 'lsp_invoices',
  RECEIPTS: 'lsp_receipts',
  EXPENSES: 'lsp_expenses',
  ASSETS: 'lsp_assets',
  GATE_PASSES: 'lsp_gate_passes',
  AUDIT_LOGS: 'lsp_audit_logs',
  NOTIFICATIONS: 'lsp_notifications',
  USERS: 'lsp_users',
  SUBSCRIPTIONS: 'lsp_subscriptions',
  FEATURE_FLAGS: 'lsp_feature_flags',
  SEED_LOADED: 'lsp_seed_loaded',
  DATA_VERSION: 'lsp_data_version',
  THEME: 'lsp_theme'
};

export const SessionKeys = {
  SESSION_USER: 'lsp_session_user',
  SESSION_TOKEN: 'lsp_session_token',
  ACTIVE_PROPERTY: 'lsp_active_property',
  ACTIVE_ORG: 'lsp_active_org'
};`
};

for (const [filename, content] of Object.entries(constants)) {
    fs.writeFileSync(path.join(constantsDir, filename), content);
}

// Services
const services = {
    'storage.service.ts': `import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    // Only clear lsp_ prefixed keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('lsp_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
}`,
    'session.service.ts': `import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  getItem<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  setItem<T>(key: string, value: T): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('lsp_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  }
}`,
    'crud.service.ts': `import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class CrudService {
  private storage = inject(StorageService);

  getAll<T>(collectionKey: string): T[] {
    return this.storage.getItem<T[]>(collectionKey) || [];
  }

  getById<T extends { id: string }>(collectionKey: string, id: string): T | undefined {
    const items = this.getAll<T>(collectionKey);
    return items.find(item => item.id === id);
  }

  create<T extends { id: string }>(collectionKey: string, item: Omit<T, 'id'>): T {
    const items = this.getAll<T>(collectionKey);
    const newItem = { ...item, id: this.generateId() } as unknown as T;
    items.push(newItem);
    this.storage.setItem(collectionKey, items);
    return newItem;
  }

  update<T extends { id: string }>(collectionKey: string, id: string, changes: Partial<T>): T | undefined {
    const items = this.getAll<T>(collectionKey);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...changes };
      this.storage.setItem(collectionKey, items);
      return items[index];
    }
    return undefined;
  }

  delete<T extends { id: string }>(collectionKey: string, id: string): boolean {
    const items = this.getAll<T>(collectionKey);
    const filtered = items.filter(item => item.id !== id);
    if (items.length !== filtered.length) {
      this.storage.setItem(collectionKey, filtered);
      return true;
    }
    return false;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}`,
    'auth.service.ts': `import { Injectable, inject, signal } from '@angular/core';
import { SessionService } from './session.service';
import { SessionKeys, StorageKeys } from '../constants/storage-keys.constants';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private session = inject(SessionService);
  private storage = inject(StorageService);
  
  currentUser = signal<User | null>(this.session.getItem<User>(SessionKeys.SESSION_USER));

  login(email: string, role?: string): boolean {
    const users = this.storage.getItem<User[]>(StorageKeys.USERS) || [];
    const user = users.find(u => u.email === email && (!role || u.role === role));
    if (user) {
      this.session.setItem(SessionKeys.SESSION_USER, user);
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this.session.removeItem(SessionKeys.SESSION_USER);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }
}`,
    'seed-data.service.ts': `import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../constants/storage-keys.constants';

@Injectable({ providedIn: 'root' })
export class SeedDataService {
  private storage = inject(StorageService);

  async seedIfNeeded(): Promise<void> {
    if (this.storage.getItem(StorageKeys.SEED_LOADED)) {
      return;
    }

    try {
      // For demo, we are mocking the imports if files don't actually fetch correctly via HTTP in browser.
      // In a real app we'd fetch JSONs from assets, but here we can just seed some default empty arrays if missing.
      // Actually we will provide the JSON files in the assets folder later and fetch them.
      // For now just mark as loaded to prevent errors.
      this.storage.setItem(StorageKeys.SEED_LOADED, true);
    } catch (e) {
      console.error('Failed to seed data', e);
    }
  }
}`
};

for (const [filename, content] of Object.entries(services)) {
    fs.writeFileSync(path.join(servicesDir, filename), content);
}

// Guards
const guards = {
    'auth.guard.ts': `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.parseUrl('/auth/login');
};`,
    'guest.guard.ts': `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    const user = auth.currentUser();
    // Redirect based on role
    return router.parseUrl('/' + (user?.role.toLowerCase() || '') + '/dashboard');
  }
  return true;
};`,
    'role.guard.ts': `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) {
      return router.parseUrl('/auth/login');
    }
    return auth.hasRole(allowedRoles) ? true : router.parseUrl('/unauthorized');
  };
};`
};

for (const [filename, content] of Object.entries(guards)) {
    fs.writeFileSync(path.join(guardsDir, filename), content);
}

// Just create a placeholder users.json in mock-data
fs.writeFileSync(path.join(mockDir, 'users.json'), `[
  {
    "id": "user-owner-001",
    "email": "owner@demo.com",
    "password": "demo123",
    "role": "Owner",
    "name": "Nikunj Bavishiya"
  }
]`);

console.log('Successfully created core services, constants, guards, and mock data stub');
