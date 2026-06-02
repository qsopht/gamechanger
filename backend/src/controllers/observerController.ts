import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as WebhookEventModel from '../models/WebhookEvent';
import { simulateWebhookEvent } from '../services/webhookSimulator';

type Platform = 'apple' | 'google' | 'stripe';
type EventType = 'purchase' | 'renewal' | 'cancellation' | 'refund' | 'billing_retry' | 'expiration' | 'upgrade_downgrade';

export async function simulateEvent(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { platform, eventType } = req.body;

    if (!platform || !eventType) {
      res.status(400).json({ error: 'Missing required fields: platform, eventType' });
      return;
    }

    if (!['apple', 'google'].includes(platform)) {
      res.status(400).json({ error: 'Invalid platform. Must be apple or google' });
      return;
    }

    const validEventTypes = ['purchase', 'renewal', 'cancellation', 'refund', 'billing_retry', 'expiration', 'upgrade_downgrade'];
    if (!validEventTypes.includes(eventType)) {
      res.status(400).json({ error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}` });
      return;
    }

    await simulateWebhookEvent(
      platform as Platform,
      eventType as EventType
    );

    res.status(201).json({ message: `${eventType} event simulated for ${platform}` });
  } catch (error) {
    console.error('Simulate event error:', error);
    res.status(500).json({ error: 'Failed to simulate event' });
  }
}

export async function getEvents(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const events = await WebhookEventModel.getRecentWebhookEvents(50);
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

export async function clearAllEvents(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const count = await WebhookEventModel.deleteAllWebhookEvents();
    res.json({ message: `Deleted ${count} webhook events` });
  } catch (error) {
    console.error('Clear events error:', error);
    res.status(500).json({ error: 'Failed to clear events' });
  }
}
