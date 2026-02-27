import { Outlet } from 'react-router-dom';
import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

export default function AuthLayout() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#F8F8F8' }}>
      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1D5BBD, #3D8AFF)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 24,
            marginBottom: 12,
          }}>
            P
          </div>
          <Title level={3} style={{ margin: 0, color: '#1D5BBD' }}>PDDustaz</Title>
        </div>
        <div style={{
          width: '100%',
          maxWidth: 440,
          background: '#fff',
          borderRadius: 20,
          padding: '40px 32px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
