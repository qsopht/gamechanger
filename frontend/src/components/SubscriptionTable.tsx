import { Table, Button, Space, Modal } from 'antd';
import { DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import * as subscriptionService from '../services/subscriptionService';
import { useState } from 'react';

interface SubscriptionTableProps {
  subscriptions: subscriptionService.Subscription[];
  onCancel: (id: string) => Promise<void>;
  loading?: boolean;
}

export function SubscriptionTable({ subscriptions, onCancel, loading }: SubscriptionTableProps) {
  const [selectedInvoices, setSelectedInvoices] = useState<subscriptionService.Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const handleViewInvoices = async (subscriptionId: string) => {
    try {
      setInvoicesLoading(true);
      const invoices = await subscriptionService.getSubscriptionInvoices(subscriptionId);
      setSelectedInvoices(invoices);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const columns = [
    {
      title: 'Plan',
      dataIndex: ['plan', 'name'],
      key: 'plan'
    },
    {
      title: 'Price',
      dataIndex: ['plan', 'price'],
      key: 'price',
      render: (price: any) => `$${Number(price).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'active' ? '#52c41a' : '#f5222d' }}>
          {status}
        </span>
      )
    },
    {
      title: 'Billing Cycle',
      dataIndex: ['plan', 'billing_cycle'],
      key: 'billing_cycle'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: subscriptionService.Subscription) => (
        <Space>
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => handleViewInvoices(record.id)}
          >
            Invoices
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onCancel(record.id)}
            loading={loading}
          >
            Cancel
          </Button>
        </Space>
      )
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={subscriptions}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      
      {selectedInvoices.length > 0 && (
        <Modal
          title="Invoices"
          open={selectedInvoices.length > 0}
          onCancel={() => setSelectedInvoices([])}
          footer={null}
        >
          <Table
            columns={[
              {
                title: 'Amount',
                dataIndex: 'amount',
                render: (amount: number) => `$${amount.toFixed(2)}`
              },
              {
                title: 'Status',
                dataIndex: 'status'
              },
              {
                title: 'Date',
                dataIndex: 'created_at',
                render: (date: string) => new Date(date).toLocaleDateString()
              }
            ]}
            dataSource={selectedInvoices}
            rowKey="id"
            pagination={false}
            loading={invoicesLoading}
          />
        </Modal>
      )}
    </>
  );
}
