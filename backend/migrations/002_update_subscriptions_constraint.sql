-- Drop existing UNIQUE constraint and recreate with partial index
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_plan_id_key;

-- Add new partial unique constraint for active and past_due subscriptions only
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_plan_id_status_key 
  UNIQUE (user_id, plan_id) WHERE status IN ('active', 'past_due');
