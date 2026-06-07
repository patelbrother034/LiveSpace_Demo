import { Routes } from '@angular/router';
import { MainLayout } from '../../layouts/main-layout/main-layout';

export const ACCOUNTANT_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(c => c.AccountantDashboard) },
      { path: 'invoices', loadComponent: () => import('./invoices/invoices').then(c => c.AccountantInvoices) },
      { path: 'payments', loadComponent: () => import('./payments/payments').then(c => c.AccountantPayments) },
      { path: 'expenses', loadComponent: () => import('./expenses/expenses').then(c => c.AccountantExpenses) },
      { path: 'transactions', loadComponent: () => import('./transactions/transactions').then(c => c.AccountantTransactions) },
      { path: 'ledger', loadComponent: () => import('./ledger/ledger').then(c => c.AccountantLedger) },
      { path: 'gst', loadComponent: () => import('./gst/gst').then(c => c.AccountantGst) },
      { path: 'receipts', loadComponent: () => import('./receipts/receipts').then(c => c.AccountantReceipts) },
      { path: 'reports', loadComponent: () => import('./reports/reports').then(c => c.AccountantReports) },
      { path: 'cash-flow', loadComponent: () => import('./cash-flow/cash-flow').then(c => c.AccountantCashFlow) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
