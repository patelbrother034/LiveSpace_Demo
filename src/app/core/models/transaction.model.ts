import { PaymentMode } from './enums/payment-mode.enum';
import { PaymentStatus } from './enums/payment-status.enum';

export interface Transaction {
  id: string;
  orgId: string;
  propertyId: string;
  tenantId: string;
  type: string; // RENT, DEPOSIT, EXPENSE, etc.
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
  dueDate?: string;
  receiptNumber?: string;
  invoiceId?: string;
  description: string;
  status: PaymentStatus;
  recordedBy?: string;
  createdAt: string;
}