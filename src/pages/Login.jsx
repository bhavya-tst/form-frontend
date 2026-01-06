import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, FormOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import service from '../util/API/service';
import { API_ENDPOINTS } from '../util/constant/CONSTANTS';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await service.post(API_ENDPOINTS.AUTH.LOGIN, {
        password: values.password,
      });

      if (response.status === 200) {
        login(values.password);
        message.success('Login successful!');
        navigate('/forms');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-large mb-4">
            <FormOutlined className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dream Form Platform
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your admin secret to continue
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-large p-8 border border-gray-100 dark:border-gray-800">
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="password"
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Admin Secret</span>}
              rules={[
                {
                  required: true,
                  message: 'Please enter your admin secret',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your admin secret"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-12 rounded-lg font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 border-0 shadow-md"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Secure authentication powered by x-admin-secret
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Protected area. Authorized access only.
          </p>
        </div>
      </div>
    </div>
  );
}
