import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import * as authService from '../services/authService';
import { Form, Input, Button, Card, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const navigate = useNavigate();
  const enableRegistration = (import.meta as any).env.VITE_ENABLE_REGISTRATION !== 'false';

  const handleLogin = async (values: any) => {
    try {
      setLoading(true);
      const response = await authService.login(values.email, values.password);
      setToken(response.token);
      setUser(response.user);
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '12px'
    }}>
      <Card 
        title="Login" 
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          borderRadius: '8px'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <Form
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>

          {enableRegistration && (
            <p style={{ textAlign: 'center', marginTop: '16px' }}>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          )}
        </Form>
      </Card>
    </div>
  );
}
