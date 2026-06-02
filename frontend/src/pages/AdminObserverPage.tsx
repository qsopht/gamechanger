import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Select, message, Table, Spin, Space, Tag, Statistic } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import * as api from '../services/api';

interface WebhookEvent {
  id: string;
  event_type: string;
  platform: string;
  status: 'pending' | 'sent' | 'processed' | 'failed';
  payload: Record<string, any>;
  response?: string;
  created_at: string;
}

type Platform = 'apple' | 'google';
type EventType = 'purchase' | 'renewal' | 'cancellation' | 'refund' | 'billing_retry' | 'expiration' | 'upgrade_downgrade';

export function AdminObserverPage() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('apple');
  const [selectedEvent, setSelectedEvent] = useState<EventType>('purchase');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

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

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const response = await api.default.get('/observer/events');
      setEvents(response.data);
    } catch (error) {
      message.error('Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  };

  const handleSendEvent = async () => {
    try {
      setLoading(true);
      await api.default.post('/observer/simulate', {
        platform: selectedPlatform,
        eventType: selectedEvent
      });
      message.success(`${selectedEvent} event sent to ${selectedPlatform}`);
      loadEvents();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to send event');
    } finally {
      setLoading(false);
    }
  };

  const eventStats = useMemo(() => {
    const stats: Record<string, Record<string, number>> = {};
    
    events.forEach(event => {
      if (!stats[event.platform]) {
        stats[event.platform] = {};
      }
      stats[event.platform][event.event_type] = (stats[event.platform][event.event_type] || 0) + 1;
    });
    
    return stats;
  }, [events]);

  const columns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform: string) => (
        <Tag color={platform === 'apple' ? 'gray' : 'green'}>
          {platform.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Event Type',
      dataIndex: 'event_type',
      key: 'event_type'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'processed' ? 'green' : status === 'failed' ? 'red' : 'blue'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Payload',
      dataIndex: 'payload',
      key: 'payload',
      render: (payload: Record<string, any>) => (
        <code style={{ fontSize: '11px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {JSON.stringify(payload, null, 2).substring(0, 100)}...
        </code>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/admin/plans')}
        style={{ marginBottom: '24px' }}
      >
        Back to Admin
      </Button>

      <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', marginBottom: '24px' }}>Webhook Event Observer</h1>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Simulate Webhook Event" style={{ height: '100%' }}>
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
                <Button onClick={loadEvents} loading={eventsLoading}>
                  Refresh
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Event Information" style={{ height: '100%' }}>
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
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Event Statistics Dashboard" style={{ marginTop: '24px' }}>
        <Spin spinning={eventsLoading}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: '#666', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>By Platform</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {Object.entries(eventStats).map(([platform, eventTypes]) => (
                <Card key={platform} style={{ backgroundColor: '#fafafa' }} size="small">
                  <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
                    <Tag color={platform === 'apple' ? 'gray' : 'green'} style={{ fontSize: '12px', padding: '4px 8px' }}>
                      {platform.toUpperCase()}
                    </Tag>
                    <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 'bold' }}>
                      {Object.values(eventTypes).reduce((a, b) => a + b, 0)} Total
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(eventTypes)
                      .sort(([, a], [, b]) => b - a)
                      .map(([eventType, count]) => (
                        <div key={eventType} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                          <span style={{ color: '#666', textTransform: 'capitalize' }}>
                            {eventType.replace(/_/g, ' ')}
                          </span>
                          <span style={{ fontWeight: 600, backgroundColor: '#e6f7ff', padding: '2px 8px', borderRadius: '4px' }}>
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '12px', color: '#666', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>By Event Type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              {(() => {
                const eventTypeStats: Record<string, number> = {};
                events.forEach(event => {
                  eventTypeStats[event.event_type] = (eventTypeStats[event.event_type] || 0) + 1;
                });
                
                return Object.entries(eventTypeStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([eventType, count]) => (
                    <Card key={eventType} style={{ backgroundColor: '#fafafa', textAlign: 'center' }} size="small">
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
                        {count}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', textTransform: 'capitalize' }}>
                        {eventType.replace(/_/g, ' ')}
                      </div>
                    </Card>
                  ));
              })()}
            </div>
          </div>
        </Spin>
      </Card>

      <Card title="Recent Events" style={{ marginTop: '24px' }}>
        <Spin spinning={eventsLoading}>
          <Table
            columns={columns}
            dataSource={events}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </Spin>
      </Card>
    </div>
  );
}
