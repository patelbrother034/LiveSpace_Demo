import { Routes } from '@angular/router';
import { MainLayout } from '../../layouts/main-layout/main-layout';

export const OWNER_ROUTES: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard').then(c => c.Dashboard) },
      { path: 'properties', loadComponent: () => import('./properties/property-list/property-list').then(c => c.PropertyList) },
      { path: 'properties/add', loadComponent: () => import('./properties/property-add/property-add').then(c => c.PropertyAddComponent) },
      { path: 'properties/analytics', loadComponent: () => import('./properties/property-analytics/property-analytics.component').then(c => c.PropertyAnalyticsComponent) },
      { path: 'properties/occupancy', loadComponent: () => import('./properties/occupancy-explorer/occupancy-explorer.component').then(c => c.OccupancyExplorerComponent) },
      { path: 'properties/vacancies', loadComponent: () => import('./properties/vacancy-explorer/vacancy-explorer.component').then(c => c.VacancyExplorerComponent) },
      { path: 'properties/:id', loadComponent: () => import('./properties/property-detail/property-detail').then(c => c.PropertyDetail) },
      { path: 'properties/:id/visual-layout', loadComponent: () => import('./properties/visual-layout/visual-layout').then(c => c.VisualLayout) },
      { path: 'properties/:id/settings', loadComponent: () => import('./properties/property-settings/property-settings.component').then(c => c.PropertySettingsComponent) },
      { path: 'properties/:id/buildings', loadComponent: () => import('./properties/building-list/building-list.component').then(c => c.BuildingListComponent) },
      { path: 'properties/:id/buildings/:buildingId', loadComponent: () => import('./properties/building-detail/building-detail.component').then(c => c.BuildingDetailComponent) },
      { path: 'properties/:id/floors', loadComponent: () => import('./properties/floor-list/floor-list.component').then(c => c.FloorListComponent) },
      { path: 'properties/:id/rooms', loadComponent: () => import('./properties/room-list/room-list.component').then(c => c.RoomListComponent) },
      { path: 'properties/:id/rooms/:roomId', loadComponent: () => import('./properties/room-detail/room-detail.component').then(c => c.RoomDetailComponent) },
      { path: 'properties/:id/beds', loadComponent: () => import('./properties/bed-list/bed-list.component').then(c => c.BedListComponent) },
      { path: 'properties/:id/beds/:bedId', loadComponent: () => import('./properties/bed-detail/bed-detail.component').then(c => c.BedDetailComponent) },

      // Tenant Section (Phase 4)
      { path: 'tenants', loadComponent: () => import('./tenants/tenant-directory/tenant-directory').then(c => c.TenantDirectory) },
      { path: 'tenants/check-in', loadComponent: () => import('./tenants/check-in-wizard/check-in-wizard.component').then(c => c.CheckInWizardComponent) },
      { path: 'tenants/check-out', loadComponent: () => import('./tenants/check-out-wizard/check-out-wizard.component').then(c => c.CheckOutWizardComponent) },
      { path: 'tenants/kyc-center', loadComponent: () => import('./tenants/kyc-center/kyc-center.component').then(c => c.KycCenterComponent) },
      { path: 'tenants/renewals', loadComponent: () => import('./tenants/renewal-list/renewal-list.component').then(c => c.RenewalListComponent) },
      { path: 'tenants/notices', loadComponent: () => import('./tenants/notice-list/notice-list.component').then(c => c.NoticeListComponent) },
      { path: 'tenants/analytics', loadComponent: () => import('./tenants/tenant-analytics/tenant-analytics.component').then(c => c.TenantAnalyticsComponent) },
      { path: 'tenants/:id', loadComponent: () => import('./tenants/tenant-profile/tenant-profile').then(c => c.TenantProfile) },
      { path: 'beds', loadComponent: () => import('./properties/visual-layout/visual-layout').then(c => c.VisualLayout) },
      
      // ── Payments Hub — Unified Entry Point from Sidebar ──────────────────
      {
        path: 'payments',
        loadComponent: () => import('./finance/payment-hub/payment-hub.component').then(c => c.PaymentHubComponent),
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview',         loadComponent: () => import('./finance/payment-hub/payment-overview.component').then(c => c.PaymentOverviewComponent) },
          { path: 'transactions',     loadComponent: () => import('./finance/transaction-list/transaction-list.component').then(c => c.TransactionListComponent) },
          { path: 'rent-collection',  loadComponent: () => import('./finance/rent-collection/rent-collection.component').then(c => c.RentCollectionComponent) },
          { path: 'invoices',         loadComponent: () => import('./finance/invoice-list/invoice-list.component').then(c => c.InvoiceListComponent) },
          { path: 'receipts',         loadComponent: () => import('./finance/receipt-list/receipt-list.component').then(c => c.ReceiptListComponent) },
          { path: 'dues',             loadComponent: () => import('./finance/outstanding-dues/outstanding-dues.component').then(c => c.OutstandingDuesComponent) },
          { path: 'expenses',         loadComponent: () => import('./finance/expense-list/expense-list.component').then(c => c.ExpenseListComponent) },
          { path: 'revenue',          loadComponent: () => import('./finance/revenue-analytics/revenue-analytics.component').then(c => c.RevenueAnalyticsComponent) },
          { path: 'gst',              loadComponent: () => import('./finance/gst-dashboard/gst-dashboard.component').then(c => c.GstDashboardComponent) },
        ]
      },

      // Legacy Finance Routes (kept for backward compatibility with existing dashboard links)
      { path: 'finance/transactions', loadComponent: () => import('./finance/transaction-list/transaction-list.component').then(c => c.TransactionListComponent) },
      { path: 'finance/rent-collection', loadComponent: () => import('./finance/rent-collection/rent-collection.component').then(c => c.RentCollectionComponent) },
      { path: 'finance/dues', loadComponent: () => import('./finance/outstanding-dues/outstanding-dues.component').then(c => c.OutstandingDuesComponent) },
      { path: 'finance/expenses', loadComponent: () => import('./finance/expense-list/expense-list.component').then(c => c.ExpenseListComponent) },
      { path: 'finance/ledger', loadComponent: () => import('./finance/ledger/ledger.component').then(c => c.LedgerComponent) },
      { path: 'finance/invoices', loadComponent: () => import('./finance/invoice-list/invoice-list.component').then(c => c.InvoiceListComponent) },
      { path: 'finance/receipts', loadComponent: () => import('./finance/receipt-list/receipt-list.component').then(c => c.ReceiptListComponent) },
      { path: 'finance/gst', loadComponent: () => import('./finance/gst-dashboard/gst-dashboard.component').then(c => c.GstDashboardComponent) },
      { path: 'finance/revenue', loadComponent: () => import('./finance/revenue-analytics/revenue-analytics.component').then(c => c.RevenueAnalyticsComponent) },

      // Maintenance Section (Phase 6)
      { path: 'maintenance/dashboard', loadComponent: () => import('./maintenance/maintenance-dashboard/maintenance-dashboard.component').then(c => c.MaintenanceDashboard) },
      { path: 'maintenance/create', loadComponent: () => import('./maintenance/create-ticket/create-ticket.component').then(c => c.CreateTicket) },
      { path: 'maintenance/tickets/:id', loadComponent: () => import('./maintenance/ticket-detail/ticket-detail.component').then(c => c.TicketDetail) },
      { path: 'maintenance/assignments', loadComponent: () => import('./maintenance/assignment-board/assignment-board.component').then(c => c.AssignmentBoard) },
      { path: 'maintenance/assets', loadComponent: () => import('./maintenance/asset-registry/asset-registry.component').then(c => c.AssetRegistry) },
      { path: 'maintenance/analytics', loadComponent: () => import('./maintenance/maintenance-analytics/maintenance-analytics.component').then(c => c.MaintenanceAnalytics) },

      // Communication Section (Phase 7)
      { path: 'communication/announcements', loadComponent: () => import('./communication/announcements/announcement-list.component').then(c => c.AnnouncementListComponent) },
      { path: 'communication/complaints', loadComponent: () => import('./communication/complaints/complaint-list.component').then(c => c.ComplaintListComponent) },
      { path: 'communication/feedback', loadComponent: () => import('./communication/feedback/feedback-list.component').then(c => c.FeedbackListComponent) },

      // AI Operations Hub (Phase 9)
      { path: 'ai-hub', loadComponent: () => import('./ai-hub/ai-hub.component').then(c => c.AIHubComponent) },
      { path: 'ai-hub/roommate-matching', loadComponent: () => import('./ai-hub/roommate-matching/roommate-matching.component').then(c => c.AIRoommateMatching) },
      { path: 'ai-hub/occupancy-forecast', loadComponent: () => import('./ai-hub/occupancy-forecast/occupancy-forecast.component').then(c => c.AIOccupancyForecast) },
      { path: 'ai-hub/revenue-optimizer', loadComponent: () => import('./ai-hub/revenue-optimizer/revenue-optimizer.component').then(c => c.AIRevenueOptimizer) },
      { path: 'ai-hub/maintenance-diagnostics', loadComponent: () => import('./ai-hub/maintenance-diagnostics/maintenance-diagnostics.component').then(c => c.AIMaintenanceDiagnostics) },
      { path: 'ai-hub/fraud-detection', loadComponent: () => import('./ai-hub/fraud-detection/fraud-detection.component').then(c => c.AIFraudDetection) },
      { path: 'ai-hub/voice-ledger', loadComponent: () => import('./ai-hub/voice-ledger/voice-ledger.component').then(c => c.AIVoiceLedger) },
      { path: 'ai-hub/property-insights', loadComponent: () => import('./ai-hub/property-insights/property-insights.component').then(c => c.AIPropertyInsights) },

      // Reports & Settings (Phase 10)
      { path: 'reports', loadComponent: () => import('./reports/reports.component').then(c => c.ReportsComponent) },
      { path: 'settings', loadComponent: () => import('./settings/settings.component').then(c => c.SettingsComponent) },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
