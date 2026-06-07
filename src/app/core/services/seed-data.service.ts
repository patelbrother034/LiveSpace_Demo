import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { StorageKeys } from '../constants/storage-keys.constants';

// Note: Ensure tsconfig.json has "resolveJsonModule": true and "esModuleInterop": true
import usersData from '../../../mock-data/users.json';
import propertiesData from '../../../mock-data/properties.json';
import buildingsData from '../../../mock-data/buildings.json';
import floorsData from '../../../mock-data/floors.json';
import roomsData from '../../../mock-data/rooms.json';
import bedsData from '../../../mock-data/beds.json';
import tenantsData from '../../../mock-data/tenants.json';
import transactionsData from '../../../mock-data/transactions.json';
import ticketsData from '../../../mock-data/tickets.json';
import organizationsData from '../../../mock-data/organizations.json';
import parentsData from '../../../mock-data/parents.json';
import staffData from '../../../mock-data/staff.json';
import announcementsData from '../../../mock-data/announcements.json';
import invoicesData from '../../../mock-data/invoices.json';
import receiptsData from '../../../mock-data/receipts.json';
import expensesData from '../../../mock-data/expenses.json';
import assetsData from '../../../mock-data/assets.json';
import gatePassesData from '../../../mock-data/gate-passes.json';
import auditLogsData from '../../../mock-data/audit-logs.json';
import notificationsData from '../../../mock-data/notifications.json';
import subscriptionsData from '../../../mock-data/subscriptions.json';

@Injectable({ providedIn: 'root' })
export class SeedDataService {
  private storage = inject(StorageService);

  async seedIfNeeded(): Promise<void> {
    if (this.storage.getItem(StorageKeys.SEED_LOADED)) {
      return;
    }

    try {
      this.storage.setItem(StorageKeys.USERS, usersData);
      this.storage.setItem(StorageKeys.PROPERTIES, propertiesData);
      this.storage.setItem(StorageKeys.BUILDINGS, buildingsData);
      this.storage.setItem(StorageKeys.FLOORS, floorsData);
      this.storage.setItem(StorageKeys.ROOMS, roomsData);
      this.storage.setItem(StorageKeys.BEDS, bedsData);
      this.storage.setItem(StorageKeys.TENANTS, tenantsData);
      this.storage.setItem(StorageKeys.TRANSACTIONS, transactionsData);
      this.storage.setItem(StorageKeys.TICKETS, ticketsData);
      this.storage.setItem(StorageKeys.ORGANIZATIONS, organizationsData);
      this.storage.setItem(StorageKeys.PARENTS, parentsData);
      this.storage.setItem(StorageKeys.STAFF, staffData);
      this.storage.setItem(StorageKeys.ANNOUNCEMENTS, announcementsData);
      this.storage.setItem(StorageKeys.INVOICES, invoicesData);
      this.storage.setItem(StorageKeys.RECEIPTS, receiptsData);
      this.storage.setItem(StorageKeys.EXPENSES, expensesData);
      this.storage.setItem(StorageKeys.ASSETS, assetsData);
      this.storage.setItem(StorageKeys.GATE_PASSES, gatePassesData);
      this.storage.setItem(StorageKeys.AUDIT_LOGS, auditLogsData);
      this.storage.setItem(StorageKeys.NOTIFICATIONS, notificationsData);
      this.storage.setItem(StorageKeys.SUBSCRIPTIONS, subscriptionsData);

      // Default feature flags
      this.storage.setItem(StorageKeys.FEATURE_FLAGS, {
        aiInsights: true,
        smartLock: false,
        onlinePayments: true
      });

      this.storage.setItem(StorageKeys.SEED_LOADED, true);
    } catch (e) {
      console.error('Failed to seed data', e);
    }
  }
}