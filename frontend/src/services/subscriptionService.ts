import api from './api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features?: Record<string, any>;
  stripe_price_id?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'past_due' | 'canceled' | 'paused';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  plan?: SubscriptionPlan;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: string;
  paid_at?: string;
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  const response = await api.get('/plans');
  return response.data;
}

export async function getPlanById(id: string): Promise<SubscriptionPlan> {
  const response = await api.get(`/plans/${id}`);
  return response.data;
}

export async function getUserSubscriptions(): Promise<Subscription[]> {
  const response = await api.get('/subscriptions');
  return response.data;
}

export async function createSubscription(
  planId: string,
  stripeCustomerId?: string,
  paymentMethodId?: string
): Promise<Subscription> {
  const response = await api.post('/subscriptions', {
    planId,
    stripeCustomerId,
    paymentMethodId
  });
  return response.data;
}

export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
): Promise<Subscription> {
  const response = await api.post(`/subscriptions/${subscriptionId}/cancel`, {
    atPeriodEnd
  });
  return response.data;
}

export async function getSubscriptionInvoices(subscriptionId: string): Promise<Invoice[]> {
  const response = await api.get(`/subscriptions/${subscriptionId}/invoices`);
  return response.data;
}
