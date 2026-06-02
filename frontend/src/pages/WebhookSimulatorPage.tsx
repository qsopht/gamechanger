import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, message, Space } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import * as api from '../services/api';
import { useState } from 'react';

type Platform = 'apple' | 'google';
type EventType = 'purchase' | 'renewal' | 'cancellation' | 'refund' | 'billing_retry' | 'expiration' | 'upgrade_downgrade';

export function WebhookSimulatorPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('apple');
  const [selectedEvent, setSelectedEvent] = useState<EventType>('purchase');
  const [loading, setLoading] = useState(false);

  const platformOptions = [
    { label: 'Apple App Store', value: 'apple' },
    { label: 'Google Play', value: 'google' }
  ];

  const eventOptions = [
    { label: 'Initial Purchase', value: 'purchase' },
    { label: 'Renewal', value: 'renewal' },
    { label: 'Cancellation', value: 'cancellation' },
    { label: 'Refund', value: 'refund' },
    { label: 'Billing Retry', value: 'billing_retry' },
    { label: 'Expiration', value: 'expiration' },
    { label: 'Upgrade/Downgrade', value: 'upgrade_downgrade' }
  ];

  const handleSendEvent = async () => {
    try {
      setLoading(true);
      await api.default.post('/observer/simulate', {
        platform: selectedPlatform,
        eventType: selectedEvent
      });
      message.success(`${selectedEvent} event sent to ${selectedPlatform}`);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to send event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/admin/plans')}
        style={{ marginBottom: '24px' }}
      >
        Back to Admin
      </Button>

      <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', marginBottom: '24px' }}>Webhook Event Simulator</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <Card title="Create Test Event" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Platform</label>
              <Select
                style={{ width: '100%' }}
                value={selectedPlatform}
                onChange={setSelectedPlatform}
                options={platformOptions}
              />
            </div>

            <div>
              <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Event Type</label>
              <Select
                style={{ width: '100%' }}
                value={selectedEvent}
                onChange={setSelectedEvent}
                options={eventOptions}
              />
            </div>

            <Space style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendEvent}
                loading={loading}
                style={{ flex: 1 }}
              >
                Send Event
              </Button>
              <Button 
                type="default"
                onClick={() => navigate('/admin/observer')}
              >
                View Dashboard
              </Button>
            </Space>
          </div>
        </Card>

        <Card title="Event Information" style={{ height: 'fit-content' }}>
          <div style={{ fontSize: '14px', lineHeight: 1.8 }}>
            <p><strong>Platform:</strong> {selectedPlatform.toUpperCase()}</p>
            <p><strong>Event:</strong> {selectedEvent}</p>
            
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>Description:</p>
              {selectedEvent === 'purchase' && <p>Simulates initial subscription purchase event</p>}
              {selectedEvent === 'renewal' && <p>Simulates subscription renewal event</p>}
              {selectedEvent === 'cancellation' && <p>Simulates subscription cancellation event</p>}
              {selectedEvent === 'refund' && <p>Simulates refund event</p>}
              {selectedEvent === 'billing_retry' && <p>Simulates billing retry event</p>}
              {selectedEvent === 'expiration' && <p>Simulates subscription expiration event</p>}
              {selectedEvent === 'upgrade_downgrade' && <p>Simulates upgrade/downgrade event</p>}
            </div>

            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#e6f7ff', borderRadius: '4px' }}>
              <p style={{ fontWeight: 600, marginBottom: '8px', color: '#0050b3' }}>Tip:</p>
              <p style={{ margin: 0, fontSize: '13px' }}>
                After sending an event, view the dashboard to see it appear in real-time without page refresh.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
