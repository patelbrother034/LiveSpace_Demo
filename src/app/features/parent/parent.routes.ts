import { Routes } from '@angular/router';
import { MainLayout } from '../../layouts/main-layout/main-layout';

export const PARENT_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/parent-dashboard.component').then(c => c.ParentDashboard) },
      { path: 'student-overview', loadComponent: () => import('./student-overview/student-overview.component').then(c => c.StudentOverview) },
      { path: 'payments', loadComponent: () => import('./payments/parent-payment-history.component').then(c => c.ParentPaymentHistory) },
      { path: 'complaints', loadComponent: () => import('./complaints/parent-complaint.component').then(c => c.ParentComplaint) },
      { path: 'announcements', loadComponent: () => import('./announcements/parent-announcements.component').then(c => c.ParentAnnouncements) },
      { path: 'communication', loadComponent: () => import('./communication/parent-communication.component').then(c => c.ParentCommunication) },
      { path: 'invoices', loadComponent: () => import('./invoices/parent-invoice-list.component').then(c => c.ParentInvoiceListComponent) },
      { path: 'receipts', loadComponent: () => import('./receipts/parent-receipt-list.component').then(c => c.ParentReceiptListComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
