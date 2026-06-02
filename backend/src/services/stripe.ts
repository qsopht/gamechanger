import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY not configured');
}

export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2023-10-16'
});

export async function createStripeCustomer(email: string, name?: string): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    name
  });
  return customer.id;
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string,
  paymentMethodId?: string
): Promise<string> {
  const subscriptionData: any = {
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete'
  };

  if (paymentMethodId) {
    subscriptionData.default_payment_method = paymentMethodId;
    subscriptionData.payment_settings = { save_default_payment_method: 'on_subscription' };
  }

  const subscription = await stripe.subscriptions.create(subscriptionData);
  return subscription.id;
}

export async function cancelStripeSubscription(subscriptionId: string, atPeriodEnd: boolean = true): Promise<void> {
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: atPeriodEnd
  });
}

export async function getStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function createStripePrice(amount: number, currency: string, productId: string, interval: 'month' | 'year'): Promise<string> {
  const price = await stripe.prices.create({
    unit_amount: Math.round(amount * 100),
    currency,
    recurring: { interval },
    product: productId
  });
  return price.id;
}

export async function createStripeProduct(name: string, description?: string): Promise<string> {
  const product = await stripe.products.create({
    name,
    description
  });
  return product.id;
}
