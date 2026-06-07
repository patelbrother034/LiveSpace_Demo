export interface GatePass {
  id: string;
  orgId: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  type: 'TemporaryOut' | 'Overnight' | 'Leave' | 'Medical' | 'LateEntry';
  reason: string;
  outDate: string;
  outTime: string;
  expectedReturnDate: string;
  expectedReturnTime: string;
  actualReturnDate?: string;
  actualReturnTime?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Returned' | 'Overdue';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}