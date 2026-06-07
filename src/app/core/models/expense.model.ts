export interface Expense {
  id: string;
  orgId: string;
  propertyId: string;
  category: 'Maintenance' | 'Utilities' | 'Salary' | 'Groceries' | 'Cleaning' | 'Security' | 'Insurance' | 'Taxes' | 'Other';
  subCategory?: string;
  amount: number;
  description: string;
  vendor?: string;
  receiptUrl?: string;
  paymentMode: string;
  paidDate: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  recordedBy: string;
  isRecurring: boolean;
  recurringFrequency?: 'Monthly' | 'Quarterly' | 'Annual';
  createdAt: string;
}