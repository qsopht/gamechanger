import { sql } from '../db';

export interface Invoice {
  id: string;
  subscription_id: string;
  stripe_invoice_id?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'void' | 'uncollectible';
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export async function createInvoice(
  subscriptionId: string,
  amount: number,
  currency: string = 'USD',
  stripeInvoiceId?: string
): Promise<Invoice> {
  const result = await sql`
    INSERT INTO invoices (subscription_id, amount, currency, stripe_invoice_id)
    VALUES (${subscriptionId}, ${amount}, ${currency}, ${stripeInvoiceId || null})
    RETURNING *
  `;
  return result[0] as Invoice;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const result = await sql`
    SELECT * FROM invoices WHERE id = ${id}
  `;
  return (result[0] as Invoice) || null;
}

export async function getSubscriptionInvoices(subscriptionId: string): Promise<Invoice[]> {
  const result = await sql`
    SELECT * FROM invoices WHERE subscription_id = ${subscriptionId}
    ORDER BY created_at DESC
  `;
  return result as unknown as Invoice[];
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  const result = await sql`
    UPDATE invoices
    SET 
      status = COALESCE(${updates.status || null}, status),
      paid_at = COALESCE(${updates.paid_at || null}, paid_at),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as Invoice;
}

export async function markInvoiceAsPaid(id: string): Promise<Invoice> {
  return updateInvoice(id, {
    status: 'paid',
    paid_at: new Date()
  });
}

export async function getInvoiceByStripeId(stripeId: string): Promise<Invoice | null> {
  const result = await sql`
    SELECT * FROM invoices WHERE stripe_invoice_id = ${stripeId}
  `;
  return (result[0] as Invoice) || null;
}
