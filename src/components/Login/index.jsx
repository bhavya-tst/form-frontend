import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import useHttp from '../../hooks/use-http';
import { API_ENDPOINTS } from '../../util/constant/CONSTANTS';

export default function Login() {
  const { isLoading: loading, sendRequest } = useHttp();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = (values) => {
    sendRequest(
      API_ENDPOINTS.AUTH.LOGIN,
      () => {
        login(values.password);
        message.success('Login successful!');
        navigate('/forms');
      },
      { password: values.password },
      null, // success message handled above
      (err) => message.error(err || 'Invalid credentials. Please try again.')
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-large mb-4">
            <FileTextOutlined className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Quote Portal
          </h1>
          <p className="text-gray-400">
            Enter your admin secret to continue
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-large p-8 border border-gray-800">
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="password"
              label={<span className="text-gray-300 font-medium">Admin Secret</span>}
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

          <div className="mt-6 pt-6 border-gray-800">
            <p className="text-xs text-gray-400">
              Secure authentication powered by x-admin-secret
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Protected area. Authorized access only.
          </p>
        </div>
      </div>
    </div>
  );
}
