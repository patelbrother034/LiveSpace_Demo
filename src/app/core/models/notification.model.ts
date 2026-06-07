export interface AppNotification {
  id: string;
  orgId: string;
  userId: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Success' | 'Error' | 'Payment' | 'Maintenance' | 'Announcement';
  icon?: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}