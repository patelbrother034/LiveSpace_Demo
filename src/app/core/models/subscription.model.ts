export interface SubscriptionPlan {
  id: string;
  name: 'Starter' | 'Growth' | 'Enterprise';
  displayName: string;
  price: number;
  billingCycle: 'Monthly' | 'Annual';
  maxProperties: number;
  maxBeds: number;
  features: string[];
  isPopular: boolean;
}

export interface Subscription {
  id: string;
  orgId: string;
  planId: string;
  planName: string;
  status: 'Active' | 'Trial' | 'Expired' | 'Cancelled' | 'PastDue';
  startDate: string;
  endDate: string;
  trialEndsAt?: string;
  amount: number;
  billingCycle: 'Monthly' | 'Annual';
  autoRenew: boolean;
  paymentHistory: { date: string; amount: number; status: string }[];
  createdAt: string;
}