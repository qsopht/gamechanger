import { sql } from '../db';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'past_due' | 'canceled' | 'paused';
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end: boolean;
  canceled_at?: Date;
  ended_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export async function createSubscription(
  userId: string,
  planId: string,
  stripeSubscriptionId?: string
): Promise<Subscription> {
  const result = await sql`
    INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, status)
    VALUES (${userId}, ${planId}, ${stripeSubscriptionId || null}, 'active')
    RETURNING *
  `;
  return result[0] as Subscription;
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  const result = await sql`
    SELECT * FROM subscriptions WHERE id = ${id}
  `;
  return (result[0] as Subscription) || null;
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const result = await sql`
    SELECT * FROM subscriptions WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return result as unknown as Subscription[];
}

export async function getUserActiveSubscription(userId: string, planId: string): Promise<Subscription | null> {
  const result = await sql`
    SELECT * FROM subscriptions 
    WHERE user_id = ${userId} AND plan_id = ${planId} AND status IN ('active', 'past_due')
  `;
  return (result[0] as Subscription) || null;
}

export async function updateSubscription(
  id: string,
  updates: Partial<Subscription>
): Promise<Subscription> {
  const result = await sql`
    UPDATE subscriptions
    SET 
      status = COALESCE(${updates.status || null}, status),
      current_period_start = COALESCE(${updates.current_period_start || null}, current_period_start),
      current_period_end = COALESCE(${updates.current_period_end || null}, current_period_end),
      cancel_at_period_end = COALESCE(${updates.cancel_at_period_end !== undefined ? updates.cancel_at_period_end : null}, cancel_at_period_end),
      canceled_at = COALESCE(${updates.canceled_at || null}, canceled_at),
      ended_at = COALESCE(${updates.ended_at || null}, ended_at),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as Subscription;
}

export async function cancelSubscription(id: string, atPeriodEnd: boolean = true): Promise<Subscription> {
  const updates = atPeriodEnd 
    ? { status: 'canceled' as const, cancel_at_period_end: true, canceled_at: new Date() }
    : { status: 'canceled' as const, canceled_at: new Date() };
  
  return updateSubscription(id, updates);
}

export async function getSubscriptionByStripeId(stripeId: string): Promise<Subscription | null> {
  const result = await sql`
    SELECT * FROM subscriptions WHERE stripe_subscription_id = ${stripeId}
  `;
  return (result[0] as Subscription) || null;
}
