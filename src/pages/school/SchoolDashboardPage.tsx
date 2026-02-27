import { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Statistic, Spin, Button, Descriptions, Tag, App, Form, Input } from 'antd';
import { TeamOutlined, WalletOutlined, SettingOutlined, UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, BankOutlined } from '@ant-design/icons';
import { schoolsApi } from '@/api/schools';
import type { DrivingSchoolDetail } from '@/types';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '@/components/PhoneInput';
import axios from 'axios';

const { Title, Paragraph } = Typography;

export default function SchoolDashboardPage() {
  const [school, setSchool] = useState<DrivingSchoolDetail | null>(null);
  const [notCreated, setNotCreated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    schoolsApi.getMySchool()
      .then(({ data }) => setSchool(data))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setNotCreated(true);
        } else {
          message.error('Не удалось загрузить данные автошколы');
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (values: Record<string, string>) => {
    setCreating(true);
    try {
      const { data } = await schoolsApi.createMySchool(values);
      setSchool(data);
      setNotCreated(false);
      message.success('Автошкола создана');
    } catch {
      message.error('Не удалось создать автошколу');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  if (notCreated) {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto' }}>
        <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 32 } }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <BankOutlined style={{ fontSize: 48, color: '#1D5BBD', marginBottom: 12 }} />
            <Title level={3} style={{ marginBottom: 8 }}>Создайте автошколу</Title>
            <Paragraph type="secondary">
              Заполните основные данные, чтобы начать работу
            </Paragraph>
          </div>
          <Form form={form} layout="vertical" onFinish={handleCreate}>
            <Form.Item
              name="name"
              label="Название"
              rules={[{ required: true, message: 'Введите название' }]}
            >
              <Input placeholder="Автошкола «Название»" />
            </Form.Item>
            <Form.Item name="description" label="Описание">
              <Input.TextArea rows={3} placeholder="Краткое описание автошколы" />
            </Form.Item>
            <Form.Item name="address" label="Адрес">
              <Input placeholder="г. Алматы, ул. Примерная, 1" />
            </Form.Item>
            <Form.Item name="phone" label="Телефон">
              <PhoneInput />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Введите корректный email' }]}
            >
              <Input placeholder="school@example.com" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={creating}
              style={{ borderRadius: 12, marginTop: 8 }}
            >
              Создать автошколу
            </Button>
          </Form>
        </Card>
      </div>
    );
  }

  if (!school) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>{school.name}</Title>
        <Tag color={school.is_active ? 'success' : 'default'}>{school.is_active ? 'Активна' : 'Неактивна'}</Tag>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: 16 }} onClick={() => navigate('/school/students')}>
            <Statistic
              title="Курсанты"
              value={school.students_count}
              suffix={`/ ${school.max_students}`}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1D5BBD' }}
            />
            <Button type="link" style={{ padding: 0, marginTop: 8 }}>Управление курсантами</Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: 16 }} onClick={() => navigate('/school/balance')}>
            <Statistic
              title="Баланс"
              value={school.balance}
              suffix="₸"
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#30A943' }}
            />
            <Button type="link" style={{ padding: 0, marginTop: 8 }}>История транзакций</Button>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderRadius: 16 }} onClick={() => navigate('/school/settings')}>
            <Statistic
              title="Настройки"
              valueRender={() => <SettingOutlined style={{ fontSize: 28, color: '#666' }} />}
            />
            <Button type="link" style={{ padding: 0, marginTop: 8 }}>Редактировать</Button>
          </Card>
        </Col>
      </Row>

      <Card title="Информация об автошколе" style={{ borderRadius: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }}>
          {school.description && (
            <Descriptions.Item label="Описание" span={2}>{school.description}</Descriptions.Item>
          )}
          <Descriptions.Item label={<><EnvironmentOutlined /> Адрес</>}>{school.address || '—'}</Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Телефон</>}>{school.phone || '—'}</Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>{school.email || '—'}</Descriptions.Item>
          <Descriptions.Item label={<><UserOutlined /> Владелец</>}>{school.owner_name}</Descriptions.Item>
        </Descriptions>
        {school.logo && (
          <div style={{ marginTop: 16 }}>
            <img src={school.logo} alt="Логотип" style={{ maxWidth: 200, borderRadius: 12 }} />
          </div>
        )}
      </Card>
    </div>
  );
}
