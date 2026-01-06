import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Drawer, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, CodeOutlined } from '@ant-design/icons';
import service from '../util/API/service';
import { API_ENDPOINTS } from '../util/constant/CONSTANTS';

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await service.get(API_ENDPOINTS.FORMS.LIST);
      setForms(response.data?.data?.rows || []);
    } catch (error) {
      message.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      await service.post(API_ENDPOINTS.FORMS.CREATE, values);
      message.success('Form created successfully');
      setCreateModalOpen(false);
      form.resetFields();
      fetchForms();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create form');
    }
  };

  const handleDelete = async (id) => {
    try {
      await service.delete(API_ENDPOINTS.FORMS.DELETE(id));
      message.success('Form deleted successfully');
      fetchForms();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete form');
    }
  };

  const handlePreview = (record) => {
    setSelectedForm(record);
    setPreviewDrawerOpen(true);
  };

  const getServingUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  };

  const integrationCode = selectedForm
    ? `<div id="quote-form" data-booking-form></div>\n<script src="${getServingUrl()}/quote-form.iife.js"></script>`
    : '';

  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (text) => <span className="font-semibold text-gray-900 dark:text-white">{text}</span>,
    },
    {
      title: 'Version Number',
      dataIndex: 'versionNumber',
      key: 'versionNumber',
      render: (num) => <Tag color="blue">v{num}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault) =>
        isDefault ? (
          <Tag color="success" className="font-medium">Default</Tag>
        ) : (
          <Tag color="default">Not Default</Tag>
        ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
            className="text-primary-600 hover:text-primary-700"
          >
            Preview
          </Button>
          <Popconfirm
            title="Delete Form"
            description="Are you sure you want to delete this form?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forms Manager</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and configure your form versions
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
          size="large"
          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-md"
        >
          Create Form
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-soft border border-gray-100 dark:border-gray-800 overflow-hidden">
        <Table
          columns={columns}
          dataSource={forms}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} forms`,
          }}
          className="custom-table"
        />
      </div>

      <Modal
        title={<span className="text-lg font-semibold">Create New Form</span>}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="mt-4"
        >
          <Form.Item
            name="version"
            label={<span className="font-medium">Version Name</span>}
            rules={[{ required: true, message: 'Please enter version name' }]}
          >
            <Input placeholder="e.g., v1.0" size="large" />
          </Form.Item>

          <Form.Item
            name="isDefault"
            label={<span className="font-medium">Set as Default</span>}
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button onClick={() => {
                setCreateModalOpen(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-gradient-to-r from-primary-500 to-primary-600 border-0"
              >
                Create Form
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <CodeOutlined className="text-primary-600" />
            <span className="text-lg font-semibold">Integration Code</span>
          </div>
        }
        placement="right"
        onClose={() => setPreviewDrawerOpen(false)}
        open={previewDrawerOpen}
        width={600}
      >
        {selectedForm && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                Form Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Version:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedForm.version}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Version Number:</span>
                  <Tag color="blue">v{selectedForm.versionNumber}</Tag>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  {selectedForm.isDefault ? (
                    <Tag color="success">Default</Tag>
                  ) : (
                    <Tag color="default">Not Default</Tag>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Integration Code
                </h3>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(integrationCode);
                    message.success('Code copied to clipboard');
                  }}
                  className="bg-primary-600 border-0"
                >
                  Copy Code
                </Button>
              </div>
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                  {integrationCode}
                </pre>
              </div>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
              <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
                How to Use
              </h4>
              <ol className="text-sm text-primary-700 dark:text-primary-300 space-y-1 list-decimal list-inside">
                <li>Copy the integration code above</li>
                <li>Paste it into your website's HTML</li>
                <li>The form will automatically render on your page</li>
              </ol>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
