export interface Organization {
  id: string;
  name: string;
  legalName: string;
  gstin?: string;
  pan?: string;
  address: any;
  contactPerson: string;
  phone: string;
  email: string;
  logo?: string;
  subscriptionId: string;
  createdAt: string;
  status: string;
  settings: any;
}