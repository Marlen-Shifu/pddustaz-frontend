import { Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Result
        icon={<LockOutlined style={{ color: '#1D5BBD' }} />}
        title="Требуется авторизация"
        subTitle="Эта страница доступна только авторизованным пользователям"
        extra={
          <Button type="primary" size="large" style={{ borderRadius: 12 }} onClick={() => navigate('/auth/login')}>
            Войти в аккаунт
          </Button>
        }
      />
    );
  }

  return <Outlet />;
}
