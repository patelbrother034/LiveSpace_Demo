import { Injectable, inject, signal, computed } from '@angular/core';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';
import { SessionKeys, StorageKeys } from '../constants/storage-keys.constants';
import { Property } from '../models/property.model';

@Injectable({ providedIn: 'root' })
export class PropertyContextService {
  private session = inject(SessionService);
  private storage = inject(StorageService);

  private activePropertyIdSignal = signal<string | null>(
    this.session.getItem<string>(SessionKeys.ACTIVE_PROPERTY)
  );

  activePropertyId = this.activePropertyIdSignal.asReadonly();

  properties = signal<Property[]>([]);

  activeProperty = computed<Property | null>(() => {
    const id = this.activePropertyIdSignal();
    if (!id) return null;
    return this.properties().find(p => p.id === id) || null;
  });

  constructor() {
    this.loadProperties();
  }

  loadProperties(): void {
    const stored = this.storage.getItem<Property[]>(StorageKeys.PROPERTIES) || [];
    this.properties.set(stored);
    
    // Default to the first active property if none is selected
    if (!this.activePropertyIdSignal() && stored.length > 0) {
      this.setActiveProperty(stored[0].id);
    }
  }

  setActiveProperty(propertyId: string): void {
    this.session.setItem(SessionKeys.ACTIVE_PROPERTY, propertyId);
    this.activePropertyIdSignal.set(propertyId);
  }

  clearActiveProperty(): void {
    this.session.removeItem(SessionKeys.ACTIVE_PROPERTY);
    this.activePropertyIdSignal.set(null);
  }
}
