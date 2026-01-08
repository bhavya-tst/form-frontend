
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, Avatar, Dropdown } from 'antd';
import {
  MenuOutlined,
  FormOutlined,
  GlobalOutlined,
  SwapOutlined,
  LogoutOutlined,
  UserOutlined,
  FileTextOutlined,
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
  const { isDark } = useTheme();
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
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-800 px-4">
        {collapsed ? (
          <div className="text-3xl font-bold text-white">Q</div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <span className="font-bold text-xl text-white whitespace-nowrap">Quote Portal</span>
          </div>
        )}
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
        className="hidden lg:block bg-gray-900 shadow-soft"
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
        className="bg-gray-950 min-h-screen"
        style={{
          marginLeft: window.innerWidth >= 1024 ? (collapsed ? 80 : 260) : 0,
          minHeight: '100vh',
        }}
      >
        <Header className="sticky top-0 z-10 bg-gray-900 shadow-soft px-4 md:px-6 flex items-center justify-between h-16">
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
              className="text-gray-300 hover:text-primary-400"
            />
            <h1 className="text-lg font-semibold text-white hidden md:block">
              {menuItems.find((item) => item.key === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Avatar
                  size="default"
                  icon={<UserOutlined />}
                  className="bg-gradient-to-br from-primary-500 to-primary-600"
                />
                <span className="text-sm font-medium text-gray-300 hidden md:block">
                  Admin
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-4 md:p-6 flex-1 bg-gray-950">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
