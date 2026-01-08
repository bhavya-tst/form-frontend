import { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Drawer, Tag, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, CodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import useHttp from '../../hooks/use-http';
import { API_ENDPOINTS } from '../../util/constant/CONSTANTS';

const FormPreview = ({ form }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !form) return;

    // Check for merge conflict markers in file content
    if (form.sourceType === 'file' && form.fileContent) {
      if (form.fileContent.includes('<<<<<<<') || form.fileContent.includes('>>>>>>>')) {
        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
          <div style="color: red; padding: 20px; font-family: system-ui, sans-serif;">
            <strong>Error:</strong> Script content contains merge conflict markers. Please clean up the file content.
          </div>
        `);
        doc.close();
        return;
      }
    }

    let scriptUrl = null;
    let scriptTag = '';

    if (form.sourceType === 'cdn' && form.cdnUrl) {
      scriptTag = `<script src="${form.cdnUrl}"></script>`;
    } else if (form.sourceType === 'file' && form.fileContent) {
      // Create a Blob URL for the file content
      // This "converts to bob" (Blob) to safely serve the content as if it were an external file
      const blob = new Blob([form.fileContent], { type: 'text/javascript' });
      scriptUrl = URL.createObjectURL(blob);
      scriptTag = `<script src="${scriptUrl}"></script>`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
            .error-box {
              margin-top: 20px;
              padding: 16px;
              background-color: #FEF2F2;
              border: 1px solid #FCA5A5;
              border-radius: 8px;
              color: #991B1B;
            }
          </style>
        </head>
        <body>
          <div id="quote-form" data-booking-form></div>
          
          <script>
            window.onerror = function(message, source, lineno, colno, error) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error-box';
              errorDiv.innerHTML = '<strong>Script Error:</strong> ' + message + '<br><small>Location: Line ' + lineno + '</small>';
              document.body.appendChild(errorDiv);
              return false;
            };
          </script>

          ${scriptTag}
        </body>
      </html>
    `;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    return () => {
      if (scriptUrl) {
        URL.revokeObjectURL(scriptUrl);
      }
    };
  }, [form]);

  if (!form) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            {form.version} - {form.sourceType === 'cdn' ? 'CDN' : 'File'}
          </span>
          {form.isDefault && (
            <Tag color="success">Default</Tag>
          )}
        </div>
      </div>
      <div className="border border-gray-700 rounded-lg overflow-hidden min-h-[500px]">
        <iframe
          ref={iframeRef}
          title="Form Preview"
          className="w-full h-[500px] border-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
};

export default function Forms() {
  const [forms, setForms] = useState([]);
  const { isLoading: loading, sendRequest } = useHttp();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [integrationDrawerOpen, setIntegrationDrawerOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [form] = Form.useForm();



  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = () => {
    sendRequest(
      API_ENDPOINTS.FORMS.LIST,
      (data) => setForms(data?.data?.rows || []),
      null,
      null,
      (err) => message.error(err || 'Failed to fetch forms')
    );
  };

  const handleCreate = (values) => {
    sendRequest(
      API_ENDPOINTS.FORMS.CREATE,
      () => {
        setCreateModalOpen(false);
        form.resetFields();
        fetchForms();
      },
      values,
      'Form created successfully'
    );
  };

  const handleDelete = (id) => {
    sendRequest(
      API_ENDPOINTS.FORMS.DELETE(id),
      () => fetchForms(),
      null,
      'Form deleted successfully'
    );
  };

  const handleSetDefault = (id) => {
    sendRequest(
      API_ENDPOINTS.FORMS.SET_DEFAULT(id),
      () => {
        message.success('Form set as default successfully');
        fetchForms();
      },
      null,
      null,
      (err) => message.error(err || 'Failed to set form as default')
    );
  };

  const handlePreviewForm = (record) => {
    setSelectedForm(record);
    setPreviewModalOpen(true);
  };

  const handleIntegrationCode = (record) => {
    setSelectedForm(record);
    setIntegrationDrawerOpen(true);
  };

  const getServingUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  };

  const integrationCode = selectedForm
    ? `<div id="quote-form" data-booking-form></div>\n<script src="${getServingUrl()}/assets/quote-form.iife.js"></script>`
    : '';

  const columns = [
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (text) => <span className="font-semibold text-white">{text}</span>,
    },
    {
      title: 'Source Type',
      dataIndex: 'sourceType',
      key: 'sourceType',
      render: (type) => (
        <Tag color={type === 'cdn' ? 'blue' : 'green'}>
          {type === 'cdn' ? 'CDN Link' : 'Uploaded File'}
        </Tag>
      ),
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
      render: (date) => (
        <span className="text-gray-400">
          {new Date(date).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewForm(record)}
            className="text-primary-600 hover:text-primary-700"
          >
            Preview Form
          </Button>
          <Button
            type="text"
            icon={<CodeOutlined />}
            onClick={() => handleIntegrationCode(record)}
            className="text-blue-600 hover:text-blue-700"
          >
            Integration Code
          </Button>
          {!record.isDefault && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleSetDefault(record.id)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0"
            >
              Set as Default
            </Button>
          )}
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
          <h2 className="text-2xl font-bold text-white">Forms Manager</h2>
          <p className="text-gray-400 mt-1">
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

      <div className="bg-gray-900 rounded-xl shadow-soft border border-gray-800 overflow-hidden">
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
        title={<span className="text-lg font-semibold">Create New Form Version</span>}
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
          initialValues={{ sourceType: 'cdn' }}
        >
          <Form.Item
            name="sourceType"
            label={<span className="font-medium">Source Type</span>}
            rules={[{ required: true, message: 'Please select source type' }]}
          >
            <Input.Group>
              <div className="flex gap-4">
                <Button
                  type={form.getFieldValue('sourceType') === 'cdn' ? 'primary' : 'default'}
                  onClick={() => form.setFieldsValue({ sourceType: 'cdn' })}
                  className={form.getFieldValue('sourceType') === 'cdn' ? 'bg-primary-600 border-0' : ''}
                >
                  CDN Link
                </Button>
                <Button
                  type={form.getFieldValue('sourceType') === 'file' ? 'primary' : 'default'}
                  onClick={() => form.setFieldsValue({ sourceType: 'file' })}
                  className={form.getFieldValue('sourceType') === 'file' ? 'bg-primary-600 border-0' : ''}
                >
                  Upload File
                </Button>
              </div>
            </Input.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.sourceType !== currentValues.sourceType}>
            {({ getFieldValue }) => {
              const sourceType = getFieldValue('sourceType');

              if (sourceType === 'cdn') {
                return (
                  <Form.Item
                    name="cdnUrl"
                    label={<span className="font-medium">CDN URL</span>}
                    rules={[
                      { required: true, message: 'Please enter CDN URL' },
                      { type: 'url', message: 'Please enter a valid URL' }
                    ]}
                  >
                    <Input
                      placeholder="https://cdn.example.com/form.js"
                      size="large"
                    />
                  </Form.Item>
                );
              }

              if (sourceType === 'file') {
                return (
                  <Form.Item
                    name="fileContent"
                    label={<span className="font-medium">JavaScript File</span>}
                    rules={[{ required: true, message: 'Please upload a file' }]}
                  >
                    <Input.TextArea
                      placeholder="Paste your JavaScript code here or upload a file below"
                      rows={8}
                      size="large"
                    />
                  </Form.Item>
                );
              }

              return null;
            }}
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

      <Modal
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-primary-600" />
            <span className="text-lg font-semibold">Form Preview</span>
          </div>
        }
        open={previewModalOpen}
        onCancel={() => {
          setPreviewModalOpen(false);
          setSelectedForm(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedForm && <FormPreview form={selectedForm} />}
      </Modal>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <CodeOutlined className="text-primary-600" />
            <span className="text-lg font-semibold">Integration Code</span>
          </div>
        }
        placement="right"
        onClose={() => setIntegrationDrawerOpen(false)}
        open={integrationDrawerOpen}
        width={600}
      >
        {selectedForm && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white mb-2">
                Form Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-gray-800">
                  <span className="text-gray-400">Version:</span>
                  <span className="font-medium text-white">
                    {selectedForm.version}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-gray-800">
                  <span className="text-gray-400">Version Number:</span>
                  <Tag color="blue">v{selectedForm.versionNumber}</Tag>
                </div>
                <div className="flex justify-between py-2 border-gray-800">
                  <span className="text-gray-400">Source Type:</span>
                  <Tag color={selectedForm.sourceType === 'cdn' ? 'blue' : 'green'}>
                    {selectedForm.sourceType === 'cdn' ? 'CDN Link' : 'Uploaded File'}
                  </Tag>
                </div>
                {selectedForm.sourceType === 'cdn' && selectedForm.cdnUrl && (
                  <div className="flex justify-between py-2 border-gray-800">
                    <span className="text-gray-400">CDN URL:</span>
                    <a
                      href={selectedForm.cdnUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Link
                    </a>
                  </div>
                )}
                {selectedForm.sourceType === 'file' && (
                  <div className="flex justify-between py-2 border-gray-800">
                    <span className="text-gray-400">File Content:</span>
                    <span className="text-white font-medium">Stored in Database</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-gray-800">
                  <span className="text-gray-400">Status:</span>
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
                <h3 className="text-base font-semibold text-white">
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
              <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                  {integrationCode}
                </pre>
              </div>
            </div>

            <div className="bg-primary-900/20 rounded-lg p-4 border border-primary-800">
              <h4 className="font-medium text-primary-100 mb-2">
                How to Use
              </h4>
              <ol className="text-primary-300 space-y-1 list-decimal list-inside">
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
