import { create } from 'zustand';
import { SubscriptionPlan, Subscription, Invoice } from '../services/subscriptionService';

interface SubscriptionStore {
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  selectedInvoices: Invoice[];
  isLoading: boolean;
  setPlans: (plans: SubscriptionPlan[]) => void;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setSelectedInvoices: (invoices: Invoice[]) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  plans: [],
  subscriptions: [],
  selectedInvoices: [],
  isLoading: false,

  setPlans: (plans) => set({ plans }),
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setSelectedInvoices: (selectedInvoices) => set({ selectedInvoices }),
  setIsLoading: (isLoading) => set({ isLoading })
}));
