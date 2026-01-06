
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form as AntForm, Input, Checkbox, Tag, Space, Drawer } from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import useHttp from "../../hooks/use-http";
import { CONSTANTS } from "../../util/constant/CONSTANTS";

const Forms = () => {
    const { sendRequest, isLoading } = useHttp();
    const [forms, setForms] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [antForm] = AntForm.useForm();

    const fetchForms = () => {
        sendRequest(
            CONSTANTS.API.forms.get,
            (data) => {
                // Backend returns { status, message, data: { count, rows } } or just rows?
                // Service returns findAndCountAll value potentially?
                // Controller: res.json({ data: findAndCountAll_result }) which is { count, rows }
                setForms(data?.data?.rows || []);
            }
        );
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleCreate = (values) => {
        sendRequest(
            CONSTANTS.API.forms.create,
            () => {
                setIsCreateModalOpen(false);
                antForm.resetFields();
                fetchForms();
            },
            values,
            "Form version created successfully"
        );
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Are you sure?",
            content: "Do you want to delete this form version?",
            onOk: () => {
                sendRequest(
                    { ...CONSTANTS.API.forms.delete, endpoint: `${CONSTANTS.API.forms.delete.endpoint}/${id}` },
                    () => fetchForms(),
                    null,
                    "Form deleted successfully"
                );
            }
        });
    };

    const columns = [
        { title: "Version", dataIndex: "version", key: "version", render: (text) => <b>{text}</b> },
        { title: "Version Number", dataIndex: "versionNumber", key: "versionNumber" },
        { title: "Default", dataIndex: "isDefault", key: "isDefault", render: (val) => val ? <Tag color="green">Default</Tag> : null },
        { title: "Created At", dataIndex: "createdAt", key: "createdAt", render: (date) => new Date(date).toLocaleDateString() },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => setIsPreviewOpen(true)}>Preview</Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} disabled={record.isDefault} />
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Forms Manager</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                    Create Version
                </Button>
            </div>

            <Table
                dataSource={forms}
                columns={columns}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Create New Form Version"
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onOk={() => antForm.submit()}
                confirmLoading={isLoading}
            >
                <AntForm form={antForm} onFinish={handleCreate} layout="vertical">
                    <AntForm.Item name="version" label="Version Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. v2.0" />
                    </AntForm.Item>
                    <AntForm.Item name="isDefault" valuePropName="checked">
                        <Checkbox>Set as Default</Checkbox>
                    </AntForm.Item>
                </AntForm>
            </Modal>

            <Drawer
                title="Form Preview"
                width={720}
                onClose={() => setIsPreviewOpen(false)}
                open={isPreviewOpen}
            >
                <div>
                    <p>Previewing form integration code:</p>
                    <div style={{ border: '1px dashed #ccc', padding: 20 }}>
                        <div id="quote-form" data-booking-form></div>
                        {/* Simulate script loading. In React, inserting script tag dynamically is better. */}
                        <div style={{ marginTop: 20, background: '#f0f0f0', padding: 10 }}>
                            <code>{`<div id="quote-form" data-booking-form></div>`}</code>
                            <br />
                            <code>{`<script src="${import.meta.env.VITE_SERVING_URL || 'SERVING_URL'}/quote-form.iife.js"></script>`}</code>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default Forms;
