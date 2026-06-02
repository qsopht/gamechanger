import { sql } from '../db';

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  card_brand?: string;
  card_last_four?: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function createPaymentMethod(
  userId: string,
  stripePaymentMethodId: string,
  cardBrand?: string,
  cardLastFour?: string,
  isDefault: boolean = false
): Promise<PaymentMethod> {
  const result = await sql`
    INSERT INTO payment_methods (user_id, stripe_payment_method_id, card_brand, card_last_four, is_default)
    VALUES (${userId}, ${stripePaymentMethodId}, ${cardBrand || null}, ${cardLastFour || null}, ${isDefault})
    RETURNING *
  `;
  return result[0] as PaymentMethod;
}

export async function getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
  const result = await sql`
    SELECT * FROM payment_methods WHERE id = ${id}
  `;
  return (result[0] as PaymentMethod) || null;
}

export async function getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const result = await sql`
    SELECT * FROM payment_methods WHERE user_id = ${userId}
    ORDER BY is_default DESC, created_at DESC
  `;
  return result as unknown as PaymentMethod[];
}

export async function getDefaultPaymentMethod(userId: string): Promise<PaymentMethod | null> {
  const result = await sql`
    SELECT * FROM payment_methods WHERE user_id = ${userId} AND is_default = true
    LIMIT 1
  `;
  return (result[0] as PaymentMethod) || null;
}

export async function setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
  await sql`
    UPDATE payment_methods SET is_default = false WHERE user_id = ${userId}
  `;
  
  await sql`
    UPDATE payment_methods SET is_default = true WHERE id = ${paymentMethodId} AND user_id = ${userId}
  `;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await sql`DELETE FROM payment_methods WHERE id = ${id}`;
}
