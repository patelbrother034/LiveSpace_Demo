import { Routes } from '@angular/router';
import { MainLayout } from '../../layouts/main-layout/main-layout';

export const WARDEN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(c => c.WardenDashboard) },
      { path: 'attendance', loadComponent: () => import('./attendance/attendance').then(c => c.WardenAttendance) },
      { path: 'gate-pass', loadComponent: () => import('./gate-pass/gate-pass').then(c => c.WardenGatePass) },
      { path: 'rooms', loadComponent: () => import('./rooms/rooms').then(c => c.WardenRooms) },
      { path: 'visitors', loadComponent: () => import('./visitors/visitors').then(c => c.WardenVisitors) },
      { path: 'curfew', loadComponent: () => import('./curfew/curfew').then(c => c.WardenCurfew) },
      { path: 'emergency', loadComponent: () => import('./emergency/emergency').then(c => c.WardenEmergency) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
