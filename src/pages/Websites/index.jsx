
import React, { useEffect, useState } from "react";
import { Card, Input, Select, Button, Modal, Row, Col, Typography, Empty, Pagination, Tag, Space, Form } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, GlobalOutlined } from "@ant-design/icons";
import useHttp from "../../hooks/use-http";
import useDebounce from "../../hooks/useDebounce";
import { CONSTANTS } from "../../util/constant/CONSTANTS";

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

const Websites = () => {
    const { sendRequest, isLoading } = useHttp();
    const [websites, setWebsites] = useState([]); // List
    const [forms, setForms] = useState([]); // For dropdown
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ page: 1, limit: 12 }); // 12 for grid

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterFormId, setFilterFormId] = useState(null);
    const [sort, setSort] = useState("createdAt");
    const [sortBy, setSortBy] = useState("DESC");

    const debouncedSearch = useDebounce(searchTerm, 500);

    // Modal States
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [bulkForm] = Form.useForm();
    const [editModal, setEditModal] = useState(null); // { id, domain, formId }
    const [editForm] = Form.useForm();

    const fetchForms = () => {
        sendRequest(CONSTANTS.API.forms.get, (data) => {
            setForms(data?.data?.rows || []);
        });
    };

    const fetchWebsites = () => {
        // Build query manually because useHttp doesn't auto-spread all complex filters easily in default GET
        // But `sendRequest` GET appends payload as query string.
        const payload = {
            page: pagination.page,
            limit: pagination.limit,
            sort,
            sortBy,
        };
        if (debouncedSearch) payload.search = debouncedSearch;
        if (filterFormId) payload.formId = filterFormId;

        sendRequest(
            CONSTANTS.API.websites.get,
            (data) => {
                setWebsites(data?.data?.rows || []);
                setTotal(data?.data?.count || 0);
            },
            payload
        );
    };

    useEffect(() => {
        fetchForms();
    }, []);

    useEffect(() => {
        fetchWebsites();
    }, [pagination, debouncedSearch, filterFormId, sort, sortBy]);

    const handleBulkCreate = (values) => {
        // Parse domains
        const domains = values.domains.split(/[\n,]+/).map(d => d.trim()).filter(d => d);
        if (domains.length === 0) return;

        sendRequest(
            CONSTANTS.API.websites.bulkCreate,
            () => {
                setIsBulkOpen(false);
                bulkForm.resetFields();
                fetchWebsites();
            },
            { domains, formId: values.formId },
            "Websites added successfully"
        );
    };

    const handleEdit = (values) => {
        sendRequest(
            { ...CONSTANTS.API.websites.update, endpoint: `${CONSTANTS.API.websites.update.endpoint}/${editModal.id}` },
            () => {
                setEditModal(null);
                fetchWebsites();
            },
            { formId: values.formId },
            "Website updated"
        );
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Disconnect Website?",
            content: "This will remove the mapping for this domain.",
            onOk: () => {
                sendRequest(
                    { ...CONSTANTS.API.websites.delete, endpoint: `${CONSTANTS.API.websites.delete.endpoint}/${id}` },
                    () => fetchWebsites(),
                    null,
                    "Website disconnected"
                );
            }
        });
    };

    return (
        <div>
            {/* Toolbar */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={6}>
                        <Search placeholder="Search Domains..." allowClear onChange={e => setSearchTerm(e.target.value)} />
                    </Col>
                    <Col xs={12} md={5}>
                        <Select
                            placeholder="Filter by Form"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={setFilterFormId}
                        >
                            {forms.map(f => <Option key={f.id} value={f.id}>{f.version}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} md={5}>
                        <Select value={sort} style={{ width: '100%' }} onChange={setSort}>
                            <Option value="createdAt">Created Date</Option>
                            <Option value="updatedAt">Updated Date</Option>
                            <Option value="domain">Domain Name</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsBulkOpen(true)}>
                            Bulk Add
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Grid */}
            {websites.length === 0 ? <Empty /> : (
                <Row gutter={[16, 16]}>
                    {websites.map(site => (
                        <Col key={site.id} xs={24} sm={12} lg={8} xl={6}>
                            <Card
                                boxShadow
                                actions={[
                                    <EditOutlined key="edit" onClick={() => {
                                        setEditModal(site);
                                        editForm.setFieldsValue({ formId: site.formId });
                                    }} />,
                                    <DeleteOutlined key="delete" onClick={() => handleDelete(site.id)} style={{ color: 'red' }} />
                                ]}
                            >
                                <Card.Meta
                                    avatar={<GlobalOutlined style={{ fontSize: 24 }} />}
                                    title={site.domain}
                                    description={<Tag color="blue">{site.Form?.version || 'Unknown'}</Tag>}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Pagination
                    current={pagination.page}
                    pageSize={pagination.limit}
                    total={total}
                    onChange={(p, l) => setPagination({ page: p, limit: l })}
                />
            </div>

            {/* Bulk Modal */}
            <Modal
                title="Bulk Add Websites"
                open={isBulkOpen}
                onCancel={() => setIsBulkOpen(false)}
                onOk={() => bulkForm.submit()}
                confirmLoading={isLoading}
            >
                <Form form={bulkForm} onFinish={handleBulkCreate} layout="vertical">
                    <Form.Item name="formId" label="Assign Form Version" rules={[{ required: true }]}>
                        <Select placeholder="Select a version">
                            {forms.map(f => <Option key={f.id} value={f.id}>{f.version}</Option>)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="domains" label="Domains" rules={[{ required: true }]} help="Comma or newline separated">
                        <Input.TextArea rows={6} placeholder="google.com, example.org..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Modal */}
            <Modal
                title={`Edit ${editModal?.domain}`}
                open={!!editModal}
                onCancel={() => setEditModal(null)}
                onOk={() => editForm.submit()}
                confirmLoading={isLoading}
            >
                <Form form={editForm} onFinish={handleEdit} layout="vertical">
                    <Form.Item name="formId" label="Change Form Version" rules={[{ required: true }]}>
                        <Select>
                            {forms.map(f => <Option key={f.id} value={f.id}>{f.version}</Option>)}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Websites;
