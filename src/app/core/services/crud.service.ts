import { Injectable, inject } from '@angular/core';
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
}