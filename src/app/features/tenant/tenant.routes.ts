import { Routes } from '@angular/router';
import { MainLayout } from '../../layouts/main-layout/main-layout';

export const TENANT_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(c => c.Dashboard) },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent) },
      { path: 'payments', loadComponent: () => import('./payments/tenant-payments.component').then(c => c.TenantPaymentsComponent) },
      { path: 'tickets', loadComponent: () => import('./tickets/tenant-tickets.component').then(c => c.TenantTicketsComponent) },
      { path: 'room', loadComponent: () => import('./room/my-room.component').then(c => c.MyRoomComponent) },
      { path: 'gate-pass', loadComponent: () => import('./gate-pass/gate-pass.component').then(c => c.GatePassComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
