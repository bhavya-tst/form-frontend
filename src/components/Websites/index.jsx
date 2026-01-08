import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Empty,
  Spin,
  Pagination,
  Tag,
  Space,
  Table,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  SearchOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import useHttp from '../../hooks/use-http';
import { API_ENDPOINTS } from '../../util/constant/CONSTANTS';

const { TextArea } = Input;

export default function Websites() {
  const [websites, setWebsites] = useState([]);
  const [forms, setForms] = useState([]);
  const { isLoading: loading, sendRequest } = useHttp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkCreateModalOpen, setBulkCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    formId: null,
    sort: 'createdAt',
    sortBy: 'DESC',
  });

  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    fetchWebsites();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchForms = () => {
    sendRequest(
      API_ENDPOINTS.FORMS.DROPDOWN,
      (data) => setForms(data?.data || []),
      null,
      null,
      (err) => message.error(err || 'Failed to fetch forms')
    );
  };

  const fetchWebsites = () => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      sort: filters.sort,
      sortBy: filters.sortBy,
    };

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.formId) {
      params.formId = filters.formId;
    }

    sendRequest(
      API_ENDPOINTS.WEBSITES.LIST,
      (data) => {
        setWebsites(data?.data?.rows || []);
        setPagination((prev) => ({
          ...prev,
          total: data?.data?.count || 0,
        }));
      },
      params,
      null,
      (err) => message.error(err || 'Failed to fetch websites')
    );
  };

  const handleCreate = (values) => {
    sendRequest(
      API_ENDPOINTS.WEBSITES.CREATE,
      () => {
        message.success('Website created successfully');
        setCreateModalOpen(false);
        form.resetFields();
        fetchWebsites();
      },
      values,
      null,
      (err) => message.error(err || 'Failed to create website')
    );
  };

  const handleBulkCreate = (values) => {
    const domains = values.domains
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d);

    sendRequest(
      API_ENDPOINTS.WEBSITES.BULK_CREATE,
      () => {
        message.success(`${domains.length} websites created successfully`);
        setBulkCreateModalOpen(false);
        bulkForm.resetFields();
        fetchWebsites();
      },
      {
        domains,
        formId: values.formId,
      },
      null,
      (err) => message.error(err || 'Failed to create websites')
    );
  };

  const handleEdit = (values) => {
    sendRequest(
      API_ENDPOINTS.WEBSITES.UPDATE(selectedWebsite.id),
      () => {
        message.success('Website updated successfully');
        setEditModalOpen(false);
        editForm.resetFields();
        setSelectedWebsite(null);
        fetchWebsites();
      },
      { formId: values.formId },
      null,
      (err) => message.error(err || 'Failed to update website')
    );
  };

  const handleDelete = (id) => {
    sendRequest(
      API_ENDPOINTS.WEBSITES.DELETE(id),
      () => {
        message.success('Website deleted successfully');
        fetchWebsites();
      },
      null,
      null,
      (err) => message.error(err || 'Failed to delete website')
    );
  };

  const openEditModal = (website) => {
    setSelectedWebsite(website);
    editForm.setFieldsValue({ formId: website.formId });
    setEditModalOpen(true);
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFormFilter = (value) => {
    setFilters((prev) => ({ ...prev, formId: value || null }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Websites Manager</h2>
          <p className="text-gray-400 mt-1">
            Manage websites and their associated forms
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            size="large"
          >
            Add Website
          </Button>
          <Button
            type="primary"
            icon={<AppstoreAddOutlined />}
            onClick={() => setBulkCreateModalOpen(true)}
            size="large"
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-md"
          >
            Bulk Create
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl shadow-soft border border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by domain..."
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(e) => handleSearch(e.target.value)}
            size="large"
            allowClear
          />
          <Select
            placeholder="Filter by form"
            value={filters.formId}
            onChange={handleFormFilter}
            size="large"
            allowClear
          >
            {forms.map((form) => (
              <Select.Option key={form.id} value={form.id}>
                {form.version}
              </Select.Option>
            ))}
          </Select>
          <Select
            value={`${filters.sort}-${filters.sortBy}`}
            onChange={(value) => {
              const [sort, sortBy] = value.split('-');
              setFilters((prev) => ({ ...prev, sort, sortBy }));
            }}
            size="large"
          >
            <Select.Option value="createdAt-DESC">Newest First</Select.Option>
            <Select.Option value="createdAt-ASC">Oldest First</Select.Option>
            <Select.Option value="updatedAt-DESC">Recently Updated</Select.Option>
            <Select.Option value="domain-ASC">Domain A-Z</Select.Option>
            <Select.Option value="domain-DESC">Domain Z-A</Select.Option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : websites.length === 0 ? (
        <div className="bg-gray-900 rounded-xl shadow-soft border border-gray-800 p-12">
          <Empty
            description={
              <span className="text-gray-400">
                No websites found. Create your first website to get started.
              </span>
            }
          />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl shadow-soft border border-gray-800 overflow-hidden">
          <Table
            dataSource={websites}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                setPagination((prev) => ({ ...prev, current: page, pageSize }));
              },
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} websites`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            columns={[
              {
                title: 'Domain',
                dataIndex: 'domain',
                key: 'domain',
                sorter: (a, b) => a.domain.localeCompare(b.domain),
                render: (text) => (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-900/40 to-primary-800/40 flex items-center justify-center flex-shrink-0">
                      <GlobalOutlined className="text-primary-400 text-sm" />
                    </div>
                    <span className="font-semibold text-white">{text}</span>
                  </div>
                ),
              },
              {
                title: 'Form Version',
                dataIndex: 'formId',
                key: 'formId',
                render: (formId) => {
                  const form = forms.find((f) => f.id === formId);
                  return form ? (
                    <Tag color="blue" className="text-xs font-medium">
                      {form.version}
                    </Tag>
                  ) : (
                    <Tag color="default" className="text-xs">Unknown Form</Tag>
                  );
                },
              },
              {
                title: 'Created',
                dataIndex: 'createdAt',
                key: 'createdAt',
                sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                render: (date) => (
                  <span className="text-gray-400">
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                ),
              },
              {
                title: 'Updated',
                dataIndex: 'updatedAt',
                key: 'updatedAt',
                sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
                render: (date) => (
                  <span className="text-gray-400">
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                width: 150,
                render: (_, record) => (
                  <Space size="small">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(record)}
                      className="text-primary-600 hover:text-primary-700 hover:bg-primary-900/20"
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete Website"
                      description="Are you sure you want to delete this website?"
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
            ]}
          />
        </div>
      )}

      <Modal
        title={<span className="text-lg font-semibold">Add New Website</span>}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} className="mt-4">
          <Form.Item
            name="domain"
            label={<span className="font-medium">Domain</span>}
            rules={[{ required: true, message: 'Please enter domain' }]}
          >
            <Input placeholder="example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="formId"
            label={<span className="font-medium">Form</span>}
            rules={[{ required: true, message: 'Please select a form' }]}
          >
            <Select placeholder="Select a form" size="large">
              {forms.map((form) => (
                <Select.Option key={form.id} value={form.id}>
                  {form.version}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setCreateModalOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-gradient-to-r from-primary-500 to-primary-600 border-0"
              >
                Create Website
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="text-lg font-semibold">Bulk Create Websites</span>}
        open={bulkCreateModalOpen}
        onCancel={() => {
          setBulkCreateModalOpen(false);
          bulkForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={bulkForm} layout="vertical" onFinish={handleBulkCreate} className="mt-4">
          <Form.Item
            name="domains"
            label={<span className="font-medium">Domains (one per line)</span>}
            rules={[{ required: true, message: 'Please enter at least one domain' }]}
          >
            <TextArea
              rows={8}
              placeholder="example1.com&#10;example2.com&#10;example3.com"
              className="font-mono"
            />
          </Form.Item>

          <Form.Item
            name="formId"
            label={<span className="font-medium">Form</span>}
            rules={[{ required: true, message: 'Please select a form' }]}
          >
            <Select placeholder="Select a form" size="large">
              {forms.map((form) => (
                <Select.Option key={form.id} value={form.id}>
                  {form.version}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setBulkCreateModalOpen(false);
                  bulkForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-gradient-to-r from-primary-500 to-primary-600 border-0"
              >
                Create Websites
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="text-lg font-semibold">Edit Website</span>}
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          editForm.resetFields();
          setSelectedWebsite(null);
        }}
        footer={null}
        width={500}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit} className="mt-4">
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Domain: </span>
            <span className="font-semibold text-white">
              {selectedWebsite?.domain}
            </span>
          </div>

          <Form.Item
            name="formId"
            label={<span className="font-medium">Form</span>}
            rules={[{ required: true, message: 'Please select a form' }]}
          >
            <Select placeholder="Select a form" size="large">
              {forms.map((form) => (
                <Select.Option key={form.id} value={form.id}>
                  {form.version}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setEditModalOpen(false);
                  editForm.resetFields();
                  setSelectedWebsite(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-gradient-to-r from-primary-500 to-primary-600 border-0"
              >
                Update Website
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
