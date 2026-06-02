import { sql } from '../db';

export interface WebhookEvent {
  id: string;
  event_type: string;
  platform: string;
  status: 'pending' | 'sent' | 'processed' | 'failed';
  payload: Record<string, any>;
  response?: string;
  created_at: Date;
  updated_at: Date;
}

export async function createWebhookEvent(
  eventType: string,
  platform: string,
  payload: Record<string, any>,
  status: 'pending' | 'sent' | 'processed' | 'failed' = 'pending'
): Promise<WebhookEvent> {
  const result = await sql`
    INSERT INTO webhook_events (event_type, platform, status, payload)
    VALUES (${eventType}, ${platform}, ${status}, ${JSON.stringify(payload)})
    RETURNING *
  `;
  return result[0] as WebhookEvent;
}

export async function getWebhookEventById(id: string): Promise<WebhookEvent | null> {
  const result = await sql`
    SELECT * FROM webhook_events WHERE id = ${id}
  `;
  return (result[0] as WebhookEvent) || null;
}

export async function getRecentWebhookEvents(limit: number = 50): Promise<WebhookEvent[]> {
  const result = await sql`
    SELECT * FROM webhook_events 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return result as unknown as WebhookEvent[];
}

export async function getWebhookEventsByPlatform(platform: string, limit: number = 50): Promise<WebhookEvent[]> {
  const result = await sql`
    SELECT * FROM webhook_events 
    WHERE platform = ${platform}
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return result as unknown as WebhookEvent[];
}

export async function getWebhookEventsByType(eventType: string, limit: number = 50): Promise<WebhookEvent[]> {
  const result = await sql`
    SELECT * FROM webhook_events 
    WHERE event_type = ${eventType}
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return result as unknown as WebhookEvent[];
}

export async function updateWebhookEventStatus(
  id: string,
  status: 'pending' | 'sent' | 'processed' | 'failed',
  response?: string
): Promise<WebhookEvent> {
  const result = await sql`
    UPDATE webhook_events
    SET status = ${status}, response = ${response || null}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0] as WebhookEvent;
}

export async function deleteAllWebhookEvents(): Promise<number> {
  const result = await sql`
    DELETE FROM webhook_events
  `;
  return result.count;
}
