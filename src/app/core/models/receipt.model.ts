export interface Receipt {
  id: string;
  orgId: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  receiptNumber: string;
  transactionId: string;
  invoiceId?: string;
  amount: number;
  paymentMode: string;
  paymentDate: string;
  description: string;
  receivedBy: string;
  orgName: string;
  propertyName: string;
  createdAt: string;
}