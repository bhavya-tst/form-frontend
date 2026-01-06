
import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Layout } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Content } = Layout;

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        // Map "secret" field to "password" for the API
        const credentials = { password: values.secret };
        const result = await login(credentials);
        setLoading(false);

        if (result.success) {
            navigate("/forms");
        } else {
            // Error handling done in AuthContext/UI?
            // AuthContext returns { success: false, error }
            // We can show message here if needed, but context might notify.
            // Let's rely on global error context or add local feedback
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Content style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Card style={{ width: 400, boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <Title level={3}>Admin Access</Title>
                    </div>
                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="secret"
                            rules={[{ required: true, message: "Please input the Admin Secret!" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Admin Secret"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                                Access Dashboard
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default Login;
