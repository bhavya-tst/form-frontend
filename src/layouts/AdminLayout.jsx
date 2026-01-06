
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Avatar, Dropdown } from 'antd';
import {
  MenuOutlined,
  FormOutlined,
  GlobalOutlined,
  SwapOutlined,
  MoonOutlined,
  SunOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/forms',
    icon: <FormOutlined />,
    label: 'Forms Manager',
    path: '/forms',
  },
  {
    key: '/websites',
    icon: <GlobalOutlined />,
    label: 'Websites Manager',
    path: '/websites',
  },
  {
    key: '/migration',
    icon: <SwapOutlined />,
    label: 'Migration Tool',
    path: '/migration',
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const handleMenuClick = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'theme',
      icon: isDark ? <SunOutlined /> : <MoonOutlined />,
      label: isDark ? 'Light Mode' : 'Dark Mode',
      onClick: toggleTheme,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
            <FormOutlined className="text-white text-xl" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 dark:text-white">Dream</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Form Platform</span>
            </div>
          )}
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className="flex-1 border-r-0 bg-transparent"
        items={menuItems.map((item) => ({
          ...item,
          onClick: () => handleMenuClick(item.path),
        }))}
      />

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800">
            <p className="text-xs font-semibold text-primary-900 dark:text-primary-100 mb-1">
              Need Help?
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-300">
              Check our documentation for guides and tutorials.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={80}
        width={260}
        className="hidden lg:block bg-white dark:bg-gray-900 shadow-soft"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <SidebarContent />
      </Sider>

      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={260}
        styles={{ body: { padding: 0 } }}
        className="lg:hidden"
      >
        <SidebarContent />
      </Drawer>

      <Layout
        className="bg-gray-50 dark:bg-gray-950"
        style={{
          marginLeft: window.innerWidth >= 1024 ? (collapsed ? 80 : 260) : 0,
        }}
      >
        <Header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-soft px-4 md:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileDrawerOpen(true);
                } else {
                  setCollapsed(!collapsed);
                }
              }}
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden md:block">
              {menuItems.find((item) => item.key === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={isDark ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hidden md:flex"
            />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar
                  size="default"
                  icon={<UserOutlined />}
                  className="bg-gradient-to-br from-primary-500 to-primary-600"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
                  Admin
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-4 md:p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
