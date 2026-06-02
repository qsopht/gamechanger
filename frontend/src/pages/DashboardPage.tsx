import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import * as subscriptionService from '../services/subscriptionService';
import { Layout, Button, Row, Col, Spin, message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { PlanCard } from '../components/PlanCard';
import { SubscriptionTable } from '../components/SubscriptionTable';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { plans, subscriptions, setPlans, setSubscriptions, isLoading, setIsLoading } = useSubscriptionStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [plansData, subsData] = await Promise.all([
          subscriptionService.getAllPlans(),
          subscriptionService.getUserSubscriptions()
        ]);
        setPlans(plansData);
        setSubscriptions(subsData);
      } catch (error) {
        message.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, navigate, setPlans, setSubscriptions, setIsLoading]);

  const handleCancel = async (subscriptionId: string) => {
    try {
      setIsLoading(true);
      await subscriptionService.cancelSubscription(subscriptionId);
      const updated = await subscriptionService.getUserSubscriptions();
      setSubscriptions(updated);
      message.success('Subscription canceled successfully');
    } catch (error) {
      message.error('Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <h1 style={{ color: 'white', margin: 0, fontSize: 'clamp(18px, 5vw, 24px)' }}>Subscriptions</h1>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}>
          <span style={{ marginRight: '8px', fontSize: 'clamp(12px, 3vw, 14px)' }}>
            {user?.fullName || user?.email}
          </span>
          <Button 
            type="text" 
            style={{ color: 'white', padding: '4px 8px' }}
            onClick={() => navigate('/admin/plans')}
            size="small"
          >
            Admin
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
            size="small"
            style={{ padding: '4px 8px' }}
          >
            Logout
          </Button>
        </div>
      </Layout.Header>

      <Layout.Content style={{ padding: '12px' }}>
        <Spin spinning={isLoading}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: 'clamp(18px, 5vw, 24px)' }}>Your Subscriptions</h2>
            {subscriptions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <SubscriptionTable
                  subscriptions={subscriptions}
                  onCancel={handleCancel}
                  loading={isLoading}
                />
              </div>
            ) : (
              <p style={{ fontSize: 'clamp(14px, 3vw, 16px)' }}>
                No active subscriptions. Choose a plan below to get started!
              </p>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: 'clamp(18px, 5vw, 24px)' }}>Available Plans</h2>
            <Row gutter={[12, 12]}>
              {plans.map((plan) => (
                <Col xs={24} sm={12} md={6} key={plan.id}>
                  <PlanCard plan={plan} />
                </Col>
              ))}
            </Row>
          </div>
        </Spin>
      </Layout.Content>
    </Layout>
  );
}
