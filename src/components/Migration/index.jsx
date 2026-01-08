import { useState, useEffect } from 'react';
import { Card, Select, Button, message, Alert, Table, Tag, Checkbox, Input, Space } from 'antd';
import { SwapOutlined, ArrowRightOutlined, CheckCircleOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import useHttp from '../../hooks/use-http';
import { API_ENDPOINTS } from '../../util/constant/CONSTANTS';

export default function Migration() {
  const [forms, setForms] = useState([]);
  const [sourceFormId, setSourceFormId] = useState(null);
  const [targetFormId, setTargetFormId] = useState(null);
  const [websitesPreview, setWebsitesPreview] = useState([]);
  const { isLoading: loading, sendRequest } = useHttp();
  const [migrating, setMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Selection state
  const [selectedWebsiteIds, setSelectedWebsiteIds] = useState(new Set());
  const [selectAllMode, setSelectAllMode] = useState(false); // true = select all matching
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (sourceFormId) {
      fetchWebsitesPreview();
    } else {
      setWebsitesPreview([]);
      clearSelection();
    }
  }, [sourceFormId, searchTerm, pagination.current, pagination.pageSize]);

  const fetchForms = () => {
    sendRequest(
      API_ENDPOINTS.FORMS.DROPDOWN,
      (data) => setForms(data?.data || []),
      null,
      null,
      (err) => message.error(err || 'Failed to fetch forms')
    );
  };

  const fetchWebsitesPreview = () => {
    const params = {
      formId: sourceFormId,
      page: pagination.current,
      limit: pagination.pageSize,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    sendRequest(
      API_ENDPOINTS.WEBSITES.LIST,
      (data) => {
        setWebsitesPreview(data?.data?.rows || []);
        setPagination(prev => ({ ...prev, total: data?.data?.count || 0 }));
      },
      params,
      null,
      (err) => message.error(err || 'Failed to fetch websites preview')
    );
  };

  const clearSelection = () => {
    setSelectedWebsiteIds(new Set());
    setSelectAllMode(false);
  };

  const toggleSelection = (id) => {
    setSelectAllMode(false); // Switch to individual mode
    setSelectedWebsiteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAllPage = (e) => {
    setSelectAllMode(false); // Switch to individual mode
    if (e.target.checked) {
      setSelectedWebsiteIds(new Set(websitesPreview.map(w => w.id)));
    } else {
      setSelectedWebsiteIds(new Set());
    }
  };

  const handleSelectAllMatching = () => {
    setSelectAllMode(true);
    setSelectedWebsiteIds(new Set()); // Clear individual selections
    message.success('All matching websites selected for migration');
  };

  const isSelected = (id) => {
    if (selectAllMode) {
      return true; // All matching are selected
    }
    return selectedWebsiteIds.has(id);
  };

  const getSelectionCount = () => {
    if (selectAllMode) {
      return pagination.total || 0;
    }
    return selectedWebsiteIds.size;
  };

  const handleMigrate = () => {
    if (!sourceFormId || !targetFormId) {
      message.warning('Please select both source and target forms');
      return;
    }

    if (sourceFormId === targetFormId) {
      message.warning('Source and target forms cannot be the same');
      return;
    }

    const selectionCount = getSelectionCount();
    if (selectionCount === 0) {
      message.warning('Please select at least one website to migrate');
      return;
    }

    setMigrating(true);
    setMigrationComplete(false);

    const payload = {
      targetFormId,
    };

    if (selectAllMode) {
      // Send select-all flag with filters
      payload.selectAll = true;
      payload.sourceFormId = sourceFormId;
      if (searchTerm) {
        payload.search = searchTerm;
      }
    } else {
      // Send individual IDs
      payload.websiteIds = Array.from(selectedWebsiteIds);
    }

    sendRequest(
      API_ENDPOINTS.WEBSITES.MIGRATE,
      (data) => {
        message.success(data?.message || `Successfully migrated ${selectionCount} websites`);
        setMigrationComplete(true);
        setSourceFormId(null);
        setTargetFormId(null);
        setWebsitesPreview([]);
        clearSelection();
        setSearchTerm('');
        setMigrating(false);
      },
      payload,
      null,
      (err) => {
        setMigrating(false);
        message.error(err || 'Migration failed');
      }
    );
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current: 1 }));
    clearSelection(); // Clear selections when search changes
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={websitesPreview.length > 0 && (selectAllMode || selectedWebsiteIds.size === websitesPreview.length)}
          indeterminate={!selectAllMode && selectedWebsiteIds.size > 0 && selectedWebsiteIds.size < websitesPreview.length}
          onChange={handleSelectAllPage}
        />
      ),
      key: 'checkbox',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={isSelected(record.id)}
          onChange={() => toggleSelection(record.id)}
        />
      ),
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (text) => <span className="font-medium text-gray-900 dark:text-white">{text}</span>,
    },
    {
      title: 'Current Form',
      key: 'currentForm',
      render: () => {
        const form = forms.find((f) => f.id === sourceFormId);
        return form ? <Tag color="blue">{form.version}</Tag> : '-';
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={isSelected(record.id) ? 'success' : 'default'} className="font-medium">
          {isSelected(record.id) ? 'Selected' : 'Ready'}
        </Tag>
      ),
    },
  ];

  const sourceForm = forms.find((f) => f.id === sourceFormId);
  const targetForm = forms.find((f) => f.id === targetFormId);
  const selectionCount = getSelectionCount();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Migration Tool</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Migrate websites from one form version to another
        </p>
      </div>

      {migrationComplete && (
        <Alert
          message="Migration Completed Successfully"
          description="All selected websites have been migrated to the target form."
          type="success"
          icon={<CheckCircleOutlined />}
          showIcon
          closable
          onClose={() => setMigrationComplete(false)}
          className="rounded-lg"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="border border-gray-100 dark:border-gray-800 shadow-soft"
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <span className="font-semibold">Source Form</span>
            </div>
          }
        >
          <div className="space-y-4">
            <Select
              placeholder="Select source form"
              value={sourceFormId}
              onChange={setSourceFormId}
              size="large"
              className="w-full"
            >
              {forms.map((form) => (
                <Select.Option key={form.id} value={form.id}>
                  {form.version}
                  {form.isDefault && <Tag color="success" className="ml-2">Default</Tag>}
                </Select.Option>
              ))}
            </Select>

            {sourceFormId && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {pagination.total || 0}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Websites Found
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card
          className="border border-gray-100 dark:border-gray-800 shadow-soft"
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 flex items-center justify-center">
                <SwapOutlined className="text-primary-600 dark:text-primary-400" />
              </div>
              <span className="font-semibold">Migration</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <ArrowRightOutlined className="text-4xl text-primary-600 dark:text-primary-400 mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select source and target forms to begin migration
                </p>
              </div>
            </div>

            {sourceFormId && targetFormId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">From:</span>
                  <Tag color="blue">{sourceForm?.version}</Tag>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">To:</span>
                  <Tag color="green">{targetForm?.version}</Tag>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <span className="text-sm text-primary-700 dark:text-primary-300">Selected:</span>
                  <Tag color="processing">{selectionCount} websites</Tag>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card
          className="border border-gray-100 dark:border-gray-800 shadow-soft"
          title={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold">2</span>
              </div>
              <span className="font-semibold">Target Form</span>
            </div>
          }
        >
          <div className="space-y-4">
            <Select
              placeholder="Select target form"
              value={targetFormId}
              onChange={setTargetFormId}
              size="large"
              className="w-full"
            >
              {forms
                .filter((f) => f.id !== sourceFormId)
                .map((form) => (
                  <Select.Option key={form.id} value={form.id}>
                    {form.version}
                    {form.isDefault && <Tag color="success" className="ml-2">Default</Tag>}
                  </Select.Option>
                ))}
            </Select>

            {sourceFormId && targetFormId && (
              <Button
                type="primary"
                icon={<SwapOutlined />}
                size="large"
                block
                loading={migrating}
                onClick={handleMigrate}
                disabled={selectionCount === 0}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-md h-12 font-semibold"
              >
                {migrating ? 'Migrating...' : `Migrate ${selectionCount} Website${selectionCount !== 1 ? 's' : ''}`}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {sourceFormId && (
        <Card
          className="border border-gray-100 dark:border-gray-800 shadow-soft"
          title={
            <div className="flex items-center justify-between">
              <span className="font-semibold">Websites to Migrate</span>
              <Space>
                {selectionCount > 0 && (
                  <Button
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={clearSelection}
                  >
                    Clear Selection
                  </Button>
                )}
                <Tag color={selectAllMode ? 'success' : 'processing'}>
                  {selectionCount} selected
                </Tag>
              </Space>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search websites by domain..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                size="large"
                allowClear
                className="flex-1"
              />
              <Button
                type="primary"
                size="large"
                onClick={handleSelectAllMatching}
                className="bg-gradient-to-r from-green-500 to-green-600 border-0"
              >
                Select All {searchTerm ? 'Matching' : ''}
              </Button>
            </div>

            {websitesPreview.length === 0 && !loading ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                <SearchOutlined className="text-4xl text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No websites found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm
                    ? `No websites match "${searchTerm}". Try clearing the search or using different keywords.`
                    : 'No websites are using this form version.'}
                </p>
                {searchTerm && (
                  <Button onClick={() => handleSearch('')} type="primary">
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={websitesPreview}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} websites`,
                  onChange: (page, pageSize) => {
                    setPagination({ current: page, pageSize, total: pagination.total });
                  },
                }}
                className="custom-table"
              />
            )}
          </div>
        </Card>
      )}

      <Card className="border border-gray-100 dark:border-gray-800 shadow-soft bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/10 dark:to-gray-900">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircleOutlined className="text-primary-600" />
            How Migration Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                1
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Select Source</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose the form version and select specific websites to migrate
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                2
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Choose Target</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select the new form version for your selected websites
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                3
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">Execute Migration</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Only selected websites will be updated to use the new form version
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
