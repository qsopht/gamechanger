import { useEffect, useState } from 'react';
import { Form, Input, Button, InputNumber, Select, Divider, Space, Tag } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { SubscriptionPlan } from '../services/subscriptionService';

interface PlanFormProps {
  plan?: SubscriptionPlan;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

export function PlanForm({ plan, onSubmit, loading }: PlanFormProps) {
  const [form] = Form.useForm();
  const [features, setFeatures] = useState<Record<string, string>>({});
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (plan) {
      form.setFieldsValue({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        billingCycle: plan.billing_cycle,
        stripePriceId: plan.stripe_price_id
      });
      
      if (plan.features) {
        let parsedFeatures = plan.features;
        
        // Parse if it's a JSON string
        if (typeof plan.features === 'string') {
          try {
            parsedFeatures = JSON.parse(plan.features);
          } catch {
            parsedFeatures = {};
          }
        }
        
        // Ensure it's an object and set features
        if (typeof parsedFeatures === 'object' && parsedFeatures !== null) {
          setFeatures(parsedFeatures as Record<string, string>);
        }
      }
    }
  }, [plan, form]);

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures({
        ...features,
        [featureInput]: featureInput
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (key: string) => {
    const newFeatures = { ...features };
    delete newFeatures[key];
    setFeatures(newFeatures);
  };

  const handleSubmit = async (values: any) => {
    await onSubmit({ ...values, features });
    form.resetFields();
    setFeatures({});
    setFeatureInput('');
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ billingCycle: 'month' }}
    >
      <Form.Item
        label="Plan Name"
        name="name"
        rules={[{ required: true, message: 'Please enter plan name' }]}
      >
        <Input placeholder="e.g., Basic Plan" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="description"
      >
        <Input.TextArea placeholder="Plan description" rows={3} />
      </Form.Item>

      <Form.Item
        label="Price"
        name="price"
        rules={[
          { required: true, message: 'Please enter price' },
          {
            validator: (_, value) => {
              if (value === null || value === undefined || value === '') {
                return Promise.reject('Price is required');
              }
              if (value >= 0) {
                return Promise.resolve();
              }
              return Promise.reject('Price cannot be negative');
            }
          }
        ]}
      >
        <InputNumber 
          prefix="$" 
          min={0} 
          step={0.01}
          precision={2}
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item
        label="Billing Cycle"
        name="billingCycle"
        rules={[{ required: true, message: 'Please select billing cycle' }]}
      >
        <Select>
          <Select.Option value="month">Monthly</Select.Option>
          <Select.Option value="year">Yearly</Select.Option>
          <Select.Option value="lifetime">Lifetime</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Stripe Price ID (optional)"
        name="stripePriceId"
      >
        <Input placeholder="price_xxx" />
      </Form.Item>

      <Divider>Features</Divider>

      <Form.Item label="Add Features">
        <Space.Compact style={{ width: '100%' }}>
          <Input 
            placeholder='e.g., "10 Users", "100GB Storage"' 
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onPressEnter={handleAddFeature}
            style={{ flex: 1 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddFeature}
          >
            Add
          </Button>
        </Space.Compact>
      </Form.Item>

      {Object.keys(features).length > 0 && (
        <Form.Item label="Features">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
            {Object.keys(features).map((key) => (
              <Tag
                key={key}
                closable
                onClose={() => handleRemoveFeature(key)}
                color="blue"
                style={{ padding: '4px 8px', marginBottom: '8px', fontSize: '14px' }}
              >
                {key}
              </Tag>
            ))}
          </div>
        </Form.Item>
      )}

      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          {plan ? 'Update Plan' : 'Create Plan'}
        </Button>
        <Button onClick={() => {
          form.resetFields();
          setFeatures({});
          setFeatureInput('');
        }}>
          Clear
        </Button>
      </Space>
    </Form>
  );
}
