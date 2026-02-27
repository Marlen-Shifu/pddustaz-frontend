import { useState } from 'react';
import { Form, Input, Button, Typography, Divider, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import type { LoginRequest } from '@/types';
import axios from 'axios';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      await login(values);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        message.error('Неверный логин или пароль');
      } else {
        message.error('Ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginTop: 0, marginBottom: 4 }}>
        Вход
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
        Войдите в свой аккаунт
      </Text>

      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Введите имя пользователя' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Введите пароль' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 16, height: 52 }}>
            Войти
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text type="secondary">или</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">Нет аккаунта? </Text>
        <Link to="/auth/register">Зарегистрироваться</Link>
      </div>
    </div>
  );
}
