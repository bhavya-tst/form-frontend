
import React, { useEffect, useState } from "react";
import { Steps, Select, Button, Table, message, Card, Alert } from "antd";
import useHttp from "../../hooks/use-http";
import { CONSTANTS } from "../../util/constant/CONSTANTS";

const { Step } = Steps;
const { Option } = Select;

const Migration = () => {
    const { sendRequest, isLoading } = useHttp();
    const [currentStep, setCurrentStep] = useState(0);
    const [forms, setForms] = useState([]);

    // Step 1 Data
    const [sourceFormId, setSourceFormId] = useState(null);
    const [targetFormId, setTargetFormId] = useState(null);

    // Step 2 Data
    const [websites, setWebsites] = useState([]);
    const [selectedWebsiteIds, setSelectedWebsiteIds] = useState([]);

    useEffect(() => {
        sendRequest(CONSTANTS.API.forms.get, (data) => setForms(data?.data?.rows || []));
    }, []);

    const fetchSourceWebsites = () => {
        if (!sourceFormId) return;
        // Fetch all websites for source form. 
        // Need to ensure backend supports filtering by formId (Yes, usersqquery supports it)
        // Ensure limit is high enough or implement pagination in table if too many. MAX 100 default.
        sendRequest(
            CONSTANTS.API.websites.get,
            (data) => {
                setWebsites(data?.data?.rows || []);
                setCurrentStep(1); // Next step
            },
            { formId: sourceFormId, limit: 1000 } // Assumption: Reasonable count
        );
    };

    const handleNext = () => {
        if (currentStep === 0) {
            if (!sourceFormId || !targetFormId) {
                return message.error("Please select both source and target forms.");
            }
            if (sourceFormId === targetFormId) {
                return message.error("Source and Target cannot be the same.");
            }
            fetchSourceWebsites();
        } else if (currentStep === 1) {
            // Confirm Selection
            if (selectedWebsiteIds.length === 0) {
                return message.error("Please select at least one website to migrate.");
            }
            setCurrentStep(2);
        }
    };

    const handleMigrate = () => {
        sendRequest(
            CONSTANTS.API.websites.migrate,
            (data) => {
                message.success(`Successfully migrated ${data?.data?.updatedCount} websites.`);
                // Reset
                setCurrentStep(0);
                setSourceFormId(null);
                setTargetFormId(null);
                setWebsites([]);
                setSelectedWebsiteIds([]);
            },
            { targetFormId, websiteIds: selectedWebsiteIds },
            "Migration Started"
        );
    };

    const columns = [
        { title: "Domain", dataIndex: "domain", key: "domain" },
        { title: "Current Version", key: "ver", render: () => forms.find(f => f.id === sourceFormId)?.version }
    ];

    const rowSelection = {
        selectedRowKeys: selectedWebsiteIds,
        onChange: (keys) => setSelectedWebsiteIds(keys),
    };

    return (
        <div>
            <h2>Website Migration Wizard</h2>
            <Card>
                <Steps current={currentStep} style={{ marginBottom: 24 }}>
                    <Step title="Select Forms" description="Source & Target" />
                    <Step title="Select Websites" description="Choose sites to move" />
                    <Step title="Confirm & Migrate" description="Execute change" />
                </Steps>

                <div style={{ marginTop: 20 }}>
                    {currentStep === 0 && (
                        <div style={{ maxWidth: 500, margin: '0 auto' }}>
                            <div style={{ marginBottom: 16 }}>
                                <label>Source Form (Move from)</label>
                                <Select style={{ width: '100%' }} value={sourceFormId} onChange={setSourceFormId}>
                                    {forms.map(f => <Option key={f.id} value={f.id}>{f.version} {f.isDefault && "(Default)"}</Option>)}
                                </Select>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label>Target Form (Move to)</label>
                                <Select style={{ width: '100%' }} value={targetFormId} onChange={setTargetFormId}>
                                    {forms.map(f => <Option key={f.id} value={f.id}>{f.version} {f.isDefault && "(Default)"}</Option>)}
                                </Select>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <Alert message={`Found ${websites.length} websites on Source Form`} type="info" showIcon style={{ marginBottom: 16 }} />
                            <Table
                                dataSource={websites}
                                columns={columns}
                                rowKey="id"
                                rowSelection={rowSelection}
                                pagination={{ pageSize: 10 }}
                            />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div style={{ textAlign: 'center' }}>
                            <Alert
                                message="Ready to Migrate"
                                description={`You are about to move ${selectedWebsiteIds.length} websites from ${forms.find(f => f.id === sourceFormId)?.version} to ${forms.find(f => f.id === targetFormId)?.version}.`}
                                type="warning"
                                showIcon
                            />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 24, textAlign: 'right' }}>
                    {currentStep > 0 && (
                        <Button style={{ margin: '0 8px' }} onClick={() => setCurrentStep(currentStep - 1)}>
                            Previous
                        </Button>
                    )}
                    {currentStep < 2 && (
                        <Button type="primary" onClick={handleNext}>
                            Next
                        </Button>
                    )}
                    {currentStep === 2 && (
                        <Button type="primary" danger onClick={handleMigrate} loading={isLoading}>
                            Confirm Migration
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Migration;
