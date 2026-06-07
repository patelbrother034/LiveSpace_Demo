import { Routes } from '@angular/router';
import { MainLayout } from '../../layouts/main-layout/main-layout';

export const CARETAKER_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(c => c.Dashboard) },
      { path: 'properties', loadComponent: () => import('./properties/properties').then(c => c.CaretakerProperties) },
      { path: 'check-in-out', loadComponent: () => import('./check-in-out/check-in-out').then(c => c.CaretakerCheckInOut) },
      { path: 'tickets', loadComponent: () => import('./tickets/tickets').then(c => c.CaretakerTickets) },
      { path: 'rent-entry', loadComponent: () => import('./rent-entry/rent-entry').then(c => c.CaretakerRentEntry) },
      { path: 'attendance', loadComponent: () => import('./attendance/attendance').then(c => c.CaretakerAttendance) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
