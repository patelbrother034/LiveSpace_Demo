import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'owner',
    canActivate: [authGuard, roleGuard(['Owner'])],
    loadChildren: () => import('./features/owner/owner.routes').then(m => m.OWNER_ROUTES)
  },
  {
    path: 'tenant',
    canActivate: [authGuard, roleGuard(['Tenant'])],
    loadChildren: () => import('./features/tenant/tenant.routes').then(m => m.TENANT_ROUTES)
  },
  {
    path: 'parent',
    canActivate: [authGuard, roleGuard(['Parent'])],
    loadChildren: () => import('./features/parent/parent.routes').then(m => m.PARENT_ROUTES)
  },
  {
    path: 'caretaker',
    canActivate: [authGuard, roleGuard(['Caretaker'])],
    loadChildren: () => import('./features/caretaker/caretaker.routes').then(m => m.CARETAKER_ROUTES)
  },
  {
    path: 'warden',
    canActivate: [authGuard, roleGuard(['Warden'])],
    loadChildren: () => import('./features/warden/warden.routes').then(m => m.WARDEN_ROUTES)
  },
  {
    path: 'accountant',
    canActivate: [authGuard, roleGuard(['Accountant'])],
    loadChildren: () => import('./features/accountant/accountant.routes').then(m => m.ACCOUNTANT_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['SuperAdmin', 'Admin'])],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'enterprise',
    canActivate: [authGuard, roleGuard(['Enterprise'])],
    loadChildren: () => import('./features/enterprise/enterprise.routes').then(m => m.ENTERPRISE_ROUTES)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/empty-state/empty-state').then(c => c.EmptyState) // Use empty state component for stub
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
