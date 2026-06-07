export interface Visitor {
  id: string;
  orgId: string;
  propertyId: string;
  visitorName: string;
  phone: string;
  purpose: 'Personal' | 'Delivery' | 'Maintenance' | 'Official' | 'Other';
  visitingTenantId?: string;
  visitingTenantName?: string;
  roomNumber?: string;
  idType?: string;
  idNumber?: string;
  photo?: string;
  vehicleNumber?: string;
  numberOfVisitors: number;
  checkInTime: string;
  checkOutTime?: string;
  status: 'CheckedIn' | 'CheckedOut';
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}