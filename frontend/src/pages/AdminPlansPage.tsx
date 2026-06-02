import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import * as subscriptionService from '../services/subscriptionService';
import api from '../services/api';
import { PlanForm } from '../components/PlanForm';
import { Layout, Table, Button, Space, message, Modal, Card, Row, Col, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export function AdminPlansPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<subscriptionService.SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState<subscriptionService.SubscriptionPlan | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPlans();
  }, [user, navigate]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAllPlans();
      setPlans(data);
    } catch (error) {
      message.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (values: any) => {
    try {
      setLoading(true);

      await api.post('/plans', {
        name: values.name,
        description: values.description,
        price: values.price,
        billingCycle: values.billingCycle,
        stripePriceId: values.stripePriceId,
        features: values.features || {}
      });

      message.success('Plan created successfully');
      setActiveTab('list');
      loadPlans();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (values: any) => {
    if (!editingPlan) return;

    try {
      setLoading(true);

      await api.put(`/plans/${editingPlan.id}`, {
        name: values.name,
        description: values.description,
        price: values.price,
        billingCycle: values.billingCycle,
        stripePriceId: values.stripePriceId,
        features: values.features || {}
      });

      message.success('Plan updated successfully');
      setEditingPlan(null);
      setActiveTab('list');
      loadPlans();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = (planId: string) => {
    Modal.confirm({
      title: 'Delete Plan',
      content: 'Are you sure you want to delete this plan?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/plans/${planId}`);
          message.success('Plan deleted successfully');
          loadPlans();
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Failed to delete plan');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const columns = [
    {
      title: 'Plan Name',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price: any) => `$${Number(price).toFixed(2)}`
    },
    {
      title: 'Billing',
      dataIndex: 'billing_cycle',
      key: 'billing_cycle',
      width: 80
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_: any, record: subscriptionService.SubscriptionPlan) => (
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPlan(record);
              setActiveTab('form');
            }}
            size="small"
            title="Edit"
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePlan(record.id)}
            size="small"
            title="Delete"
          />
        </div>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ 
        background: '#001529', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: 'clamp(18px, 5vw, 24px)' }}>Admin Plans</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type="text" 
            style={{ color: 'white', padding: '4px 8px' }}
            onClick={() => navigate('/admin/simulator')}
            size="small"
          >
            Webhook Simulator
          </Button>
          <Button 
            type="text" 
            style={{ color: 'white', padding: '4px 8px' }}
            onClick={() => navigate('/admin/observer')}
            size="small"
          >
            Webhook Viewer
          </Button>
          <Button 
            type="text" 
            style={{ color: 'white', padding: '4px 8px' }}
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            size="small"
          >
            Dashboard
          </Button>
        </div>
      </Layout.Header>

      <Layout.Content style={{ padding: '12px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'list',
              label: 'Plans List',
              children: (
                <Card>
                  <div style={{ marginBottom: '16px' }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingPlan(null);
                        setActiveTab('form');
                      }}
                    >
                      Create New Plan
                    </Button>
                  </div>
                  <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
                    <Table
                      columns={columns}
                      dataSource={plans}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      size="small"
                    />
                  </div>
                </Card>
              )
            },
            {
              key: 'form',
              label: editingPlan ? 'Edit Plan' : 'Create Plan',
              children: (
                <Card>
                  <PlanForm
                    plan={editingPlan || undefined}
                    onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
                    loading={loading}
                  />
                </Card>
              )
            }
          ]}
        />
      </Layout.Content>
    </Layout>
  );
}
