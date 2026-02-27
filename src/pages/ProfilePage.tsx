import { useEffect, useState } from 'react';
import { Typography, Card, Form, Input, Button, Upload, Avatar, Tag, Spin, App } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { usersApi } from '@/api/users';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/useAuthStore';
import PhoneInput from '@/components/PhoneInput';

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [profileForm] = Form.useForm();
  const [pwForm] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    if (!user) {
      fetchUser().finally(() => setLoading(false));
    }
  }, [user, fetchUser]);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        username: user.username,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user, profileForm]);

  const handleProfileSave = async () => {
    try {
      const values = await profileForm.validateFields();
      setSaving(true);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('avatar', fileList[0].originFileObj);
      }

      await usersApi.updateProfile(formData);
      await fetchUser();
      setFileList([]);
      message.success('Профиль обновлён');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      const values = await pwForm.validateFields();
      setChangingPw(true);
      await authApi.changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      pwForm.resetFields();
      message.success('Пароль изменён');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Ошибка при смене пароля');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  const roleLabels: Record<string, string> = {
    regular: 'Пользователь',
    school_owner: 'Владелец автошколы',
    school_student: 'Курсант',
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={2}>Профиль</Title>

      {/* User info header */}
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Avatar size={64} src={user?.avatar} icon={!user?.avatar ? <UserOutlined /> : undefined} />
          <div>
            <Title level={4} style={{ margin: 0 }}>{user?.username}</Title>
            <Text type="secondary">{user?.email}</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color="blue">{roleLabels[user?.role ?? 'regular']}</Tag>
              {user?.has_active_subscription && <Tag color="success">Подписка активна</Tag>}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile edit form */}
      <Card title="Редактировать профиль" style={{ borderRadius: 16, marginBottom: 24 }}>
        <Form form={profileForm} layout="vertical">
          <Form.Item name="username" label="Имя пользователя" rules={[{ required: true, message: 'Введите имя' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Введите email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Телефон">
            <PhoneInput />
          </Form.Item>
          <Form.Item label="Аватар">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Загрузить аватар</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={saving} onClick={handleProfileSave} style={{ borderRadius: 12 }}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Change password */}
      <Card title="Сменить пароль" style={{ borderRadius: 16 }}>
        <Form form={pwForm} layout="vertical">
          <Form.Item name="old_password" label="Текущий пароль" rules={[{ required: true, message: 'Введите текущий пароль' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="new_password" label="Новый пароль" rules={[{ required: true, min: 8, message: 'Минимум 8 символов' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="Подтвердите пароль"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Подтвердите пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Пароли не совпадают'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={changingPw} onClick={handlePasswordChange} style={{ borderRadius: 12 }}>
              Сменить пароль
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
