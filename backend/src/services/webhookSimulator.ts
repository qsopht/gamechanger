import * as WebhookEventModel from '../models/WebhookEvent';

type Platform = 'apple' | 'google' | 'stripe';
type EventType = 'purchase' | 'renewal' | 'cancellation' | 'refund' | 'billing_retry' | 'expiration' | 'upgrade_downgrade';

interface WebhookPayload {
  [key: string]: any;
}

function generateApplePayload(eventType: EventType): WebhookPayload {
  const timestamp = new Date().toISOString();
  const notificationTypes: Record<EventType, string> = {
    purchase: 'INITIAL_BUY',
    renewal: 'DID_RENEW',
    cancellation: 'CANCEL',
    refund: 'REFUND',
    billing_retry: 'BILLING_RECOVERY',
    expiration: 'EXPIRED',
    upgrade_downgrade: 'UPGRADE'
  };

  return {
    notificationType: notificationTypes[eventType],
    subjectTokenType: 'AppleIDToken',
    notificationUUID: Math.random().toString(36).substr(2, 9),
    data: {
      signedTransactionInfo: 'transaction_info',
      signedRenewalInfo: eventType !== 'cancellation' && eventType !== 'refund' ? 'renewal_info' : null,
      latestExpiredSignedRenewalInfo: null
    },
    version: '2.0',
    signedDate: timestamp,
    bundleId: 'com.gamechanger.app'
  };
}

function generateGooglePayload(eventType: EventType): WebhookPayload {
  const notificationTypes: Record<EventType, number> = {
    purchase: 1,        // SUBSCRIPTION_RECOVERED
    renewal: 13,        // SUBSCRIPTION_RENEWED
    cancellation: 3,    // SUBSCRIPTION_CANCELED
    refund: 12,         // SUBSCRIPTION_REVOKED
    billing_retry: 2,   // SUBSCRIPTION_RECOVERED
    expiration: 3,      // SUBSCRIPTION_CANCELED
    upgrade_downgrade: 7 // SUBSCRIPTION_DEFERRED
  };

  const subscriptionId = `sub_${Math.random().toString(36).substr(2, 9)}`;

  return {
    message: {
      data: Buffer.from(
        JSON.stringify({
          version: '1.0',
          packageName: 'com.gamechanger.app',
          eventTimeMillis: Date.now(),
          subscriptionNotification: {
            version: '1.0',
            notificationType: notificationTypes[eventType],
            purchaseToken: `purchase_token_${Math.random().toString(36).substr(2, 9)}`,
            subscriptionId: subscriptionId
          }
        })
      ).toString('base64')
    },
    subscription: subscriptionId
  };
}

export async function simulateWebhookEvent(
  platform: Platform,
  eventType: EventType
): Promise<void> {
  let payload: WebhookPayload;

  if (platform === 'apple') {
    payload = generateApplePayload(eventType);
  } else if (platform === 'google') {
    payload = generateGooglePayload(eventType);
  } else {
    throw new Error(`Unknown platform: ${platform}`);
  }

  // Create webhook event record
  const event = await WebhookEventModel.createWebhookEvent(eventType, platform, payload, 'sent');

  // In production, this would be sent to the appropriate webhook handler
  // For now, we just mark it as processed
  await WebhookEventModel.updateWebhookEventStatus(event.id, 'processed', 'Simulated event');
}
