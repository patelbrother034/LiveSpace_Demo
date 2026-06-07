import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, of, throwError } from 'rxjs';
import { CrudService } from '../services/crud.service';
import { StorageKeys } from '../constants/storage-keys.constants';

// Helper to convert route segment to StorageKey
function getCollectionKey(segment: string): string | null {
  const mapping: { [key: string]: string } = {
    'organizations': StorageKeys.ORGANIZATIONS,
    'properties': StorageKeys.PROPERTIES,
    'buildings': StorageKeys.BUILDINGS,
    'floors': StorageKeys.FLOORS,
    'rooms': StorageKeys.ROOMS,
    'beds': StorageKeys.BEDS,
    'tenants': StorageKeys.TENANTS,
    'parents': StorageKeys.PARENTS,
    'transactions': StorageKeys.TRANSACTIONS,
    'tickets': StorageKeys.TICKETS,
    'visitors': StorageKeys.VISITORS,
    'staff': StorageKeys.STAFF,
    'announcements': StorageKeys.ANNOUNCEMENTS,
    'invoices': StorageKeys.INVOICES,
    'receipts': StorageKeys.RECEIPTS,
    'expenses': StorageKeys.EXPENSES,
    'assets': StorageKeys.ASSETS,
    'gate-passes': StorageKeys.GATE_PASSES,
    'audit-logs': StorageKeys.AUDIT_LOGS,
    'notifications': StorageKeys.NOTIFICATIONS,
    'users': StorageKeys.USERS,
    'subscriptions': StorageKeys.SUBSCRIPTIONS
  };
  return mapping[segment.toLowerCase()] || null;
}

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;
  
  // Only intercept relative or local /api/ requests
  if (!url.includes('/api/')) {
    return next(req);
  }

  const crud = inject(CrudService);
  const parts = url.split('/api/')[1].split('?')[0].split('/');
  const collection = parts[0];
  const id = parts[1];

  const storageKey = getCollectionKey(collection);
  if (!storageKey) {
    return throwError(() => new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      url: req.url,
      error: { message: `Mock API Collection '${collection}' not found.` }
    })).pipe(delay(200));
  }

  // Simulate network latency (200ms)
  const simulateLatency = (response: any) => {
    return of(new HttpResponse({ status: 200, body: response })).pipe(delay(200));
  };

  try {
    if (req.method === 'GET') {
      if (id) {
        const item = crud.getById(storageKey, id);
        if (item) {
          return simulateLatency(item);
        } else {
          return throwError(() => new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Item with id '${id}' not found in '${collection}'.` }
          })).pipe(delay(200));
        }
      } else {
        const items = crud.getAll(storageKey);
        return simulateLatency(items);
      }
    }

    if (req.method === 'POST') {
      const createdItem = crud.create<any>(storageKey, req.body as any);
      return simulateLatency(createdItem);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!id) {
        return throwError(() => new HttpErrorResponse({
          status: 400,
          statusText: 'Bad Request',
          error: { message: 'ID is required for update operation.' }
        })).pipe(delay(200));
      }
      const updatedItem = crud.update<any>(storageKey, id, req.body as any);
      if (updatedItem) {
        return simulateLatency(updatedItem);
      } else {
        return throwError(() => new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          error: { message: `Item with id '${id}' not found in '${collection}'.` }
        })).pipe(delay(200));
      }
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return throwError(() => new HttpErrorResponse({
          status: 400,
          statusText: 'Bad Request',
          error: { message: 'ID is required for delete operation.' }
        })).pipe(delay(200));
      }
      const deleted = crud.delete(storageKey, id);
      if (deleted) {
        return simulateLatency({ success: true });
      } else {
        return throwError(() => new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          error: { message: `Item with id '${id}' not found in '${collection}'.` }
        })).pipe(delay(200));
      }
    }
  } catch (err: any) {
    return throwError(() => new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: { message: err.message || 'Error executing mock API.' }
    })).pipe(delay(200));
  }

  return next(req);
};
