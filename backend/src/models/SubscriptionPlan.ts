import { sql } from '../db';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features?: Record<string, any>;
  stripe_price_id?: string;
  created_at: Date;
  updated_at: Date;
}

export async function createPlan(
  name: string,
  price: number,
  billingCycle: string,
  description?: string,
  features?: Record<string, any>,
  stripePriceId?: string
): Promise<SubscriptionPlan> {
  const result = await sql`
    INSERT INTO subscription_plans (name, description, price, billing_cycle, features, stripe_price_id)
    VALUES (${name}, ${description || null}, ${price}, ${billingCycle}, ${features ? JSON.stringify(features) : null}, ${stripePriceId || null})
    RETURNING *
  `;
  return result[0];
}

export async function getPlanById(id: string): Promise<SubscriptionPlan | null> {
  const result = await sql`
    SELECT * FROM subscription_plans WHERE id = ${id}
  `;
  return result[0] || null;
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  const result = await sql`
    SELECT * FROM subscription_plans ORDER BY price ASC
  `;
  return result;
}

export async function updatePlan(id: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
  const result = await sql`
    UPDATE subscription_plans
    SET 
      name = COALESCE(${updates.name !== undefined ? updates.name : null}, name),
      description = COALESCE(${updates.description !== undefined ? updates.description : null}, description),
      price = COALESCE(${updates.price !== undefined ? updates.price : null}, price),
      billing_cycle = COALESCE(${updates.billing_cycle !== undefined ? updates.billing_cycle : null}, billing_cycle),
      features = COALESCE(${updates.features ? JSON.stringify(updates.features) : null}, features),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

export async function deletePlan(id: string): Promise<void> {
  await sql`DELETE FROM subscription_plans WHERE id = ${id}`;
}
