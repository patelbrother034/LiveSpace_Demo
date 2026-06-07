import { Routes } from '@angular/router';
import { MainLayout } from '../../layouts/main-layout/main-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(c => c.AdminDashboard) },
      { path: 'organizations', loadComponent: () => import('./organizations/organizations').then(c => c.AdminOrganizations) },
      { path: 'subscriptions', loadComponent: () => import('./subscriptions/subscriptions').then(c => c.AdminSubscriptions) },
      { path: 'users', loadComponent: () => import('./users/users').then(c => c.AdminUsers) },
      { path: 'billing', loadComponent: () => import('./billing/billing').then(c => c.AdminBilling) },
      { path: 'feature-flags', loadComponent: () => import('./feature-flags/feature-flags').then(c => c.AdminFeatureFlags) },
      { path: 'audit-logs', loadComponent: () => import('./audit-logs/audit-logs').then(c => c.AdminAuditLogs) },
      { path: 'support-tickets', loadComponent: () => import('./support-tickets/support-tickets').then(c => c.AdminSupportTickets) },
      { path: 'platform-analytics', loadComponent: () => import('./platform-analytics/platform-analytics').then(c => c.AdminPlatformAnalytics) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
