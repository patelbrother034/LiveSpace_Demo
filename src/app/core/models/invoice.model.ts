export interface InvoiceLineItem {
  description: string;
  amount: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  id: string;
  orgId: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  invoiceNumber: string;
  month: string;
  year: number;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  paidAmount: number;
  paidDate?: string;
  transactionId?: string;
  notes?: string;
  generatedAt: string;
  createdAt: string;
}