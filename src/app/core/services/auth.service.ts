import { Injectable, inject, signal } from '@angular/core';
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
}