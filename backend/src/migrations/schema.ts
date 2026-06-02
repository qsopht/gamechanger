export const migrations = {
  '002_update_subscriptions_constraint': `
    -- Drop existing UNIQUE constraint
    ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_plan_id_key;

    -- Create partial unique index for active and past_due subscriptions only
    CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_plan_active 
      ON subscriptions(user_id, plan_id) 
      WHERE status IN ('active', 'past_due');
  `,
  '003_create_webhook_events': `
    -- Create webhook events table for observer
    CREATE TABLE IF NOT EXISTS webhook_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type VARCHAR(50) NOT NULL,
      platform VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      payload JSONB NOT NULL,
      response TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX idx_webhook_events_platform ON webhook_events(platform);
    CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
    CREATE INDEX idx_webhook_events_status ON webhook_events(status);
    CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);
  `,
  '001_initial_schema': `
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create subscription plans table
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      billing_cycle VARCHAR(50) NOT NULL,
      features JSONB,
      stripe_price_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create subscriptions table
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_id UUID NOT NULL REFERENCES subscription_plans(id),
      stripe_subscription_id VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      current_period_start TIMESTAMP,
      current_period_end TIMESTAMP,
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      canceled_at TIMESTAMP,
      ended_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create invoices table
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
      stripe_invoice_id VARCHAR(255),
      amount DECIMAL(10, 2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create payment methods table
    CREATE TABLE IF NOT EXISTS payment_methods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_payment_method_id VARCHAR(255),
      card_brand VARCHAR(50),
      card_last_four VARCHAR(4),
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
    CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
    CREATE INDEX idx_users_email ON users(email);
  `
};
