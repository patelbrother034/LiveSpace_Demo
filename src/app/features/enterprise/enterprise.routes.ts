import { Routes } from '@angular/router';
import { MainLayout } from '../../layouts/main-layout/main-layout';

export const ENTERPRISE_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(c => c.EnterpriseDashboard) },
      { path: 'analytics', loadComponent: () => import('./analytics/analytics').then(c => c.EnterpriseAnalytics) },
      { path: 'properties', loadComponent: () => import('./properties/properties').then(c => c.EnterpriseProperties) },
      { path: 'staff', loadComponent: () => import('./staff/staff').then(c => c.EnterpriseStaff) },
      { path: 'regions', loadComponent: () => import('./regions/regions').then(c => c.EnterpriseRegions) },
      { path: 'comparison', loadComponent: () => import('./comparison/comparison').then(c => c.EnterpriseComparison) },
      { path: 'franchises', loadComponent: () => import('./franchises/franchises').then(c => c.EnterpriseFranchises) },
      { path: 'brand', loadComponent: () => import('./brand/brand').then(c => c.EnterpriseBrand) },
      { path: 'reports', loadComponent: () => import('./reports/reports').then(c => c.EnterpriseReports) },
      { path: 'kpi', loadComponent: () => import('./kpi/kpi').then(c => c.EnterpriseKpi) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
