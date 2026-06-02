import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, message, Table, Spin, Space, Tag, Modal } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
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

export function WebhookViewerPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  const handleClearAll = () => {
    Modal.confirm({
      title: 'Clear All Events',
      content: 'Are you sure you want to delete all webhook events? This action cannot be undone.',
      okText: 'Clear All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setEventsLoading(true);
          await api.default.delete('/observer/events');
          setEvents([]);
          message.success('All events cleared');
        } catch (error) {
          message.error('Failed to clear events');
        } finally {
          setEventsLoading(false);
        }
      }
    });
  };

  // Auto-refresh every 3 seconds when enabled
  useEffect(() => {
    loadEvents();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadEvents();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/admin/plans')}
        >
          Back to Admin
        </Button>
        <h1 style={{ fontSize: 'clamp(24px, 6vw, 32px)', margin: 0, flex: 1 }}>Webhook Event Viewer</h1>
        <Space>
          <Button 
            type={autoRefresh ? 'primary' : 'default'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto Refresh: ON' : 'Auto Refresh: OFF'}
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={loadEvents}
            loading={eventsLoading}
          >
            Refresh
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
          <Button onClick={() => navigate('/admin/simulator')}>
            Go to Simulator
          </Button>
        </Space>
      </div>

      <Card title="Event Statistics Dashboard" style={{ marginBottom: '24px' }}>
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

      <Card title="Recent Events">
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
