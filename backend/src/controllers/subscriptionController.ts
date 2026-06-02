import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as SubscriptionModel from '../models/Subscription';
import * as PlanModel from '../models/SubscriptionPlan';
import * as InvoiceModel from '../models/Invoice';
import { createStripeSubscription, cancelStripeSubscription } from '../services/stripe';

export async function getUserSubscriptions(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const subscriptions = await SubscriptionModel.getUserSubscriptions(req.user.id);
    
    // Enrich with plan details
    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const plan = await PlanModel.getPlanById(sub.plan_id);
        return { ...sub, plan };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
}

export async function createSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { planId, stripeCustomerId, paymentMethodId } = req.body;

    if (!planId) {
      res.status(400).json({ error: 'Plan ID is required' });
      return;
    }

    // Check if user already has this subscription
    const existing = await SubscriptionModel.getUserActiveSubscription(req.user.id, planId);
    if (existing) {
      res.status(409).json({ error: 'User already has an active subscription for this plan' });
      return;
    }

    const plan = await PlanModel.getPlanById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    let stripeSubscriptionId: string | undefined;
    
    // Create Stripe subscription if payment details provided
    if (stripeCustomerId && plan.stripe_price_id) {
      stripeSubscriptionId = await createStripeSubscription(
        stripeCustomerId,
        plan.stripe_price_id,
        paymentMethodId
      );
    }

    const subscription = await SubscriptionModel.createSubscription(
      req.user.id,
      planId,
      stripeSubscriptionId
    );

    // Create invoice
    await InvoiceModel.createInvoice(subscription.id, plan.price, 'USD');

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}

export async function cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { atPeriodEnd = true } = req.body;

    const subscription = await SubscriptionModel.getSubscriptionById(id);
    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    if (subscription.user_id !== req.user.id) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Cancel Stripe subscription
    if (subscription.stripe_subscription_id) {
      await cancelStripeSubscription(subscription.stripe_subscription_id, atPeriodEnd);
    }

    const updated = await SubscriptionModel.cancelSubscription(id, atPeriodEnd);
    res.json(updated);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

export async function getSubscriptionInvoices(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { subscriptionId } = req.params;
    const invoices = await InvoiceModel.getSubscriptionInvoices(subscriptionId);
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}
