import { useState } from 'react';
import { Form, Input, Button, Typography, Divider, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import PhoneInput from '@/components/PhoneInput';
import type { RegisterRequest } from '@/types';
import axios from 'axios';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const onFinish = async (values: RegisterRequest) => {
    setLoading(true);
    try {
      await register(values);
      navigate('/');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errors = err.response.data;
        const firstError = Object.values(errors).flat()[0];
        message.error(typeof firstError === 'string' ? firstError : 'Ошибка при регистрации');
      } else {
        message.error('Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center', marginTop: 0, marginBottom: 4 }}>
        Регистрация
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
        Создайте аккаунт для начала обучения
      </Text>

      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Введите имя пользователя' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Имя пользователя" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Введите email' },
            { type: 'email', message: 'Некорректный email' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item name="phone">
          <PhoneInput prefix={<PhoneOutlined />} placeholder="Телефон (необязательно)" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Введите пароль' },
            { min: 8, message: 'Минимум 8 символов' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading} style={{ borderRadius: 16, height: 52 }}>
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>
        <Text type="secondary">или</Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Text type="secondary">Уже есть аккаунт? </Text>
        <Link to="/auth/login">Войти</Link>
      </div>
    </div>
  );
}
