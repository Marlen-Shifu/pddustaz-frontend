import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Divider, Avatar, Button, Spin, Dropdown, Segmented } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  BookOutlined,
  ReadOutlined,
  CarOutlined,
  GiftOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BankOutlined,
  TeamOutlined,
  WalletOutlined,
  SettingOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const baseMenuItems: MenuItem[] = [
  { key: '/', icon: <HomeOutlined />, label: 'Главная' },
  { key: '/tests', icon: <FileTextOutlined />, label: 'Тесты' },
  { key: '/lessons', icon: <ReadOutlined />, label: 'Уроки' },
  { key: '/demo', icon: <PlayCircleOutlined />, label: 'Демо' },
  { key: '/tariffs', icon: <CreditCardOutlined />, label: 'Тарифы и оплата' },
  { type: 'divider' },
  {
    key: 'useful',
    icon: <BookOutlined />,
    label: 'Полезное',
    children: [
      { key: '/book', icon: <ReadOutlined />, label: 'Книга ПДД' },
      { key: '/driving', icon: <CarOutlined />, label: 'Запись на вождение' },
      { key: '/gift', icon: <GiftOutlined />, label: 'Подарочный сертификат' },
    ],
  },
  { type: 'divider' },
  { key: '/support', icon: <CustomerServiceOutlined />, label: 'Поддержка' },
];

const schoolMenuItems: MenuItem[] = [
  { type: 'divider' },
  {
    key: 'school-group',
    icon: <BankOutlined />,
    label: 'Автошкола',
    children: [
      { key: '/school', icon: <BankOutlined />, label: 'Моя автошкола' },
      { key: '/school/students', icon: <TeamOutlined />, label: 'Курсанты' },
      { key: '/school/balance', icon: <WalletOutlined />, label: 'Баланс' },
      { key: '/school/settings', icon: <SettingOutlined />, label: 'Настройки' },
    ],
  },
];

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  background: '#fff',
  borderRight: '1px solid #f0f0f0',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, fetchUser, logout } = useAuthStore();
  const { lang, setLang } = useLanguageStore();

  const siderWidth = 260;
  const collapsedWidth = 80;

  const menuItems: MenuItem[] = user?.role === 'school_owner'
    ? [...baseMenuItems, ...schoolMenuItems]
    : baseMenuItems;

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />;
  }

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'Профиль' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={siderWidth}
        collapsedWidth={collapsedWidth}
        style={siderStyle}
        theme="light"
        trigger={null}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 24px',
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #1D5BBD, #3D8AFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}>
            P
          </div>
          {!collapsed && (
            <Text strong style={{ marginLeft: 12, fontSize: 18, color: '#1D5BBD' }}>
              PDDustaz
            </Text>
          )}
        </div>

        <Divider style={{ margin: '0 0 8px 0' }} />

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['useful', 'school-group']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', padding: '0 8px' }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? collapsedWidth : siderWidth, transition: 'margin-left 0.2s' }}>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Segmented
              value={lang}
              onChange={(v) => setLang(v as 'ru' | 'kz')}
              options={[{ label: 'РУ', value: 'ru' }, { label: 'ҚАЗ', value: 'kz' }]}
            />
            {isAuthenticated && user ? (
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: ({ key }) => {
                    if (key === 'logout') handleLogout();
                    if (key === 'profile') navigate('/profile');
                  },
                }}
                placement="bottomRight"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <Avatar src={user.avatar} icon={!user.avatar ? <UserOutlined /> : undefined} />
                  <Text strong>{user.username}</Text>
                </div>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={() => navigate('/auth/login')}>
                Войти
              </Button>
            )}
          </div>
        </Header>

        <Content style={{ margin: 24, minHeight: 'calc(100vh - 112px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
