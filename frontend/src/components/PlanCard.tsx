import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import * as subscriptionService from '../services/subscriptionService';
import { Button, Card } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';

export function PlanCard({ plan }: { plan: subscriptionService.SubscriptionPlan }) {
  const { user } = useAuthStore();
  const { subscriptions, setSubscriptions, setIsLoading, isLoading } = useSubscriptionStore();

  const isSubscribed = subscriptions.some(
    (sub) => sub.plan_id === plan.id && sub.status === 'active'
  );

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      await subscriptionService.createSubscription(plan.id);
      const updated = await subscriptionService.getUserSubscriptions();
      setSubscriptions(updated);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const subscription = subscriptions.find((sub) => sub.plan_id === plan.id);
      if (subscription) {
        await subscriptionService.cancelSubscription(subscription.id);
        const updated = await subscriptionService.getUserSubscriptions();
        setSubscriptions(updated);
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      title={<span style={{ fontSize: 'clamp(14px, 4vw, 16px)' }}>{plan.name}</span>}
      style={{ 
        height: '100%',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{ 
        padding: '12px', 
        display: 'flex', 
        flexDirection: 'column',
        flex: 1
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 'clamp(18px, 6vw, 24px)', fontWeight: 'bold', margin: '8px 0' }}>
          ${Number(plan.price).toFixed(2)} <small style={{ fontSize: '0.6em' }}>/{plan.billing_cycle}</small>
        </p>
        <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', margin: '8px 0', color: '#666' }}>
          {plan.description}
        </p>
        {plan.features && (() => {
          let features = plan.features;
          if (typeof features === 'string') {
            try {
              features = JSON.parse(features);
            } catch {
              return null;
            }
          }
          
          if (typeof features !== 'object' || Object.keys(features).length === 0) {
            return null;
          }
          
          return (
            <div style={{ marginBottom: '8px', textAlign: 'left' }}>
              <p style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: '600', marginBottom: '4px' }}>Features:</p>
              <ul style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', paddingLeft: '16px', margin: '0', listStyle: 'disc' }}>
                {Object.entries(features).map(([key, value]) => (
                  <li key={key} style={{ marginBottom: '4px' }}>
                    {typeof value === 'string' ? value : String(value)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </div>
      <div style={{ marginTop: 'auto' }}>
        {isSubscribed ? (
          <Button
            type="primary"
            danger
            block
            icon={<DeleteOutlined />}
            onClick={handleCancel}
            loading={isLoading}
            size="small"
            style={{ marginTop: '12px' }}
          >
            Cancel
          </Button>
        ) : (
          <Button
            type="primary"
            block
            icon={<ShoppingCartOutlined />}
            onClick={handleSubscribe}
            loading={isLoading}
            disabled={!user}
            size="small"
            style={{ marginTop: '12px' }}
          >
            Subscribe
          </Button>
        )}
      </div>
    </Card>
  );
}
