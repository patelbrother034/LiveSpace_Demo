export interface Announcement {
  id: string;
  orgId: string;
  propertyId: string;
  title: string;
  content: string;
  type: 'General' | 'Urgent' | 'Maintenance' | 'Event' | 'Policy';
  priority: 'Low' | 'Medium' | 'High';
  targetAudience: 'All' | 'Property' | 'Floor' | 'Individual';
  targetIds?: string[];
  publishedAt: string;
  expiresAt?: string;
  isPublished: boolean;
  acknowledgedBy: string[];
  createdBy: string;
  createdAt: string;
}