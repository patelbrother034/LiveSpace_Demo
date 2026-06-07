import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/enums/user-role.enum';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  exact?: boolean;
  badge?: number;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private auth = inject(AuthService);

  navItems = computed<NavItem[]>(() => {
    const user = this.auth.currentUser();
    if (!user) return [];

    switch (user.role) {
      case UserRole.Owner:
        return [
          { icon: 'pi-th-large', label: 'Dashboard', route: '/owner/dashboard', exact: true, badge: 0 },
          { icon: 'pi-building', label: 'Properties', route: '/owner/properties', exact: false, badge: 0 },
          { icon: 'pi-users', label: 'Tenants', route: '/owner/tenants', exact: false, badge: 0 },
          { icon: 'pi-table', label: 'Beds & Rooms', route: '/owner/beds', exact: false, badge: 0 },
          { icon: 'pi-indian-rupee', label: 'Payments', route: '/owner/payments', exact: false, badge: 3 },
          { icon: 'pi-ticket', label: 'Maintenance', route: '/owner/maintenance/dashboard', exact: false, badge: 5 },
          { icon: 'pi-envelope', label: 'Communication', route: '/owner/communication/announcements', exact: false, badge: 2 },
          { icon: 'pi-sparkles', label: 'AI Operations Hub', route: '/owner/ai-hub', exact: false, badge: 0 },
          { icon: 'pi-chart-bar', label: 'Reports', route: '/owner/reports', exact: false, badge: 0 },
          { icon: 'pi-cog', label: 'Settings', route: '/owner/settings', exact: false, badge: 0 }
        ];
      case UserRole.Tenant:
        return [
          { icon: 'pi-th-large', label: 'Dashboard', route: '/tenant/dashboard', exact: true },
          { icon: 'pi-user', label: 'My Profile', route: '/tenant/profile', exact: false },
          { icon: 'pi-indian-rupee', label: 'Payments', route: '/tenant/payments', exact: false, badge: 1 },
          { icon: 'pi-ticket', label: 'Tickets', route: '/tenant/tickets', exact: false },
          { icon: 'pi-building', label: 'My Room', route: '/tenant/room', exact: false },
          { icon: 'pi-id-card', label: 'Gate Pass', route: '/tenant/gate-pass', exact: false }
        ];
      case UserRole.Parent:
        return [
          { icon: 'pi-th-large', label: 'Dashboard', route: '/parent/dashboard', exact: true },
          { icon: 'pi-user', label: 'Student Overview', route: '/parent/student-overview', exact: false },
          { icon: 'pi-indian-rupee', label: 'Payments', route: '/parent/payments', exact: false, badge: 1 },
          { icon: 'pi-exclamation-circle', label: 'Safety Concerns', route: '/parent/complaints', exact: false },
          { icon: 'pi-megaphone', label: 'Announcements', route: '/parent/announcements', exact: false, badge: 1 },
          { icon: 'pi-comments', label: 'Chat Helpdesk', route: '/parent/communication', exact: false }
        ];
      case UserRole.Caretaker:
        return [
          { icon: 'pi-th-large', label: 'Dashboard', route: '/caretaker/dashboard', exact: true },
          { icon: 'pi-building', label: 'Properties', route: '/caretaker/properties', exact: false },
          { icon: 'pi-check-circle', label: 'Check-In/Out', route: '/caretaker/check-in-out', exact: false },
          { icon: 'pi-ticket', label: 'Tickets', route: '/caretaker/tickets', exact: false, badge: 4 }
        ];
      case UserRole.Warden:
        return [
          { icon: 'pi-th-large', label: 'Dashboard', route: '/warden/dashboard', exact: true },
          { icon: 'pi-calendar-plus', label: 'Attendance', route: '/warden/attendance', exact: false },
          { icon: 'pi-id-card', label: 'Gate Pass', route: '/warden/gate-pass', exact: false, badge: 2 },
          { icon: 'pi-table', label: 'Rooms & Beds', route: '/warden/rooms', exact: false }
        ];
      case UserRole.Accountant:
        return [
          { icon: 'pi-th-large', label: 'Dashboard', route: '/accountant/dashboard', exact: true },
          { icon: 'pi-file-pdf', label: 'Invoices', route: '/accountant/invoices', exact: false },
          { icon: 'pi-indian-rupee', label: 'Payments', route: '/accountant/payments', exact: false, badge: 8 },
          { icon: 'pi-credit-card', label: 'Expenses', route: '/accountant/expenses', exact: false }
        ];
      case UserRole.SuperAdmin:
        return [
          { icon: 'pi-th-large', label: 'Dashboard', route: '/admin/dashboard', exact: true },
          { icon: 'pi-briefcase', label: 'Organizations', route: '/admin/organizations', exact: false },
          { icon: 'pi-users', label: 'Users', route: '/admin/users', exact: false },
          { icon: 'pi-dollar', label: 'Subscriptions', route: '/admin/subscriptions', exact: false }
        ];
      case UserRole.Enterprise:
        return [
          { icon: 'pi-th-large', label: 'Dashboard', route: '/enterprise/dashboard', exact: true },
          { icon: 'pi-chart-bar', label: 'Analytics', route: '/enterprise/analytics', exact: false },
          { icon: 'pi-building', label: 'Properties', route: '/enterprise/properties', exact: false },
          { icon: 'pi-users', label: 'Staff Management', route: '/enterprise/staff', exact: false }
        ];
      default:
        return [];
    }
  });
}
