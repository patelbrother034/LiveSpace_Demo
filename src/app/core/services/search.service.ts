import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../constants/storage-keys.constants';
import { Property } from '../models/property.model';
import { Tenant } from '../models/tenant.model';
import { Room } from '../models/room.model';
import { Ticket } from '../models/ticket.model';

export interface SearchResult {
  id: string;
  type: 'Property' | 'Tenant' | 'Room' | 'Ticket';
  title: string;
  subtitle: string;
  route: string;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private storage = inject(StorageService);

  search(query: string): SearchResult[] {
    if (!query || query.trim().length < 2) return [];
    
    const term = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // 1. Search Properties
    const properties = this.storage.getItem<Property[]>(StorageKeys.PROPERTIES) || [];
    properties.forEach(p => {
      if (p.name.toLowerCase().includes(term) || p.address.city.toLowerCase().includes(term)) {
        results.push({
          id: p.id,
          type: 'Property',
          title: p.name,
          subtitle: `${p.type} in ${p.address.city}, ${p.address.state}`,
          route: `/owner/properties/${p.id}`
        });
      }
    });

    // 2. Search Tenants
    const tenants = this.storage.getItem<Tenant[]>(StorageKeys.TENANTS) || [];
    tenants.forEach(t => {
      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
      if (fullName.includes(term) || t.phone.includes(term) || t.email?.toLowerCase().includes(term)) {
        results.push({
          id: t.id,
          type: 'Tenant',
          title: `${t.firstName} ${t.lastName}`,
          subtitle: `Room ${t.roomId} · ${t.phone}`,
          route: `/owner/tenants/${t.id}`
        });
      }
    });

    // 3. Search Rooms
    const rooms = this.storage.getItem<Room[]>(StorageKeys.ROOMS) || [];
    rooms.forEach(r => {
      if (r.roomNumber.toLowerCase().includes(term) || r.id.toLowerCase().includes(term)) {
        results.push({
          id: r.id,
          type: 'Room',
          title: `Room ${r.roomNumber}`,
          subtitle: `${r.sharingType} Shared · Floor ${r.floorId}`,
          route: `/owner/beds` // Bed/room list route
        });
      }
    });

    // 4. Search Tickets
    const tickets = this.storage.getItem<Ticket[]>(StorageKeys.TICKETS) || [];
    tickets.forEach(tk => {
      if (tk.title.toLowerCase().includes(term) || tk.category.toLowerCase().includes(term) || tk.id.toLowerCase().includes(term)) {
        results.push({
          id: tk.id,
          type: 'Ticket',
          title: tk.title,
          subtitle: `Status: ${tk.status} · Priority: ${tk.priority}`,
          route: `/owner/tickets`
        });
      }
    });

    return results.slice(0, 10); // Limit to top 10 results
  }
}
