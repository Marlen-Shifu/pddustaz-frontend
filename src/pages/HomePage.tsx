import { Row, Col, Card, Typography, Button, Tag } from 'antd';
import {
  FileTextOutlined,
  ReadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const { Title, Paragraph, Text } = Typography;

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
  tagColor?: string;
  route: string;
  buttonText: string;
}

const features: FeatureCard[] = [
  {
    icon: <FileTextOutlined style={{ fontSize: 32, color: '#1D5BBD' }} />,
    title: 'Тесты ПДД',
    description: '32 темы для подготовки к экзаменам. Режим обучения и режим экзамена.',
    tag: '32 темы',
    tagColor: 'blue',
    route: '/tests',
    buttonText: 'Начать тест',
  },
{
    icon: <ReadOutlined style={{ fontSize: 32, color: '#1D5BBD' }} />,
    title: 'Книга ПДД 2026',
    description: 'Полный сборник правил дорожного движения с иллюстрациями и пояснениями.',
    tag: 'Обновлено',
    tagColor: 'green',
    route: '/book',
    buttonText: 'Читать',
  },
  {
    icon: <PlayCircleOutlined style={{ fontSize: 32, color: '#E73642' }} />,
    title: 'Видео уроки',
    description: 'Видео материалы по теории и практике вождения от опытных инструкторов.',
    route: '/tests',
    buttonText: 'Смотреть',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          {user ? `${user.username}, добро пожаловать!` : 'Добро пожаловать!'}
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16, margin: 0 }}>
          Платформа для подготовки к экзаменам ПДД
        </Paragraph>
      </div>

      <Row gutter={[20, 20]}>
        {features.map((feature) => (
          <Col xs={24} sm={12} lg={8} key={feature.title}>
            <Card
              hoverable
              style={{ height: '100%', borderRadius: 20, border: '1px solid #f0f0f0' }}
              styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 24 } }}
            >
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                {feature.icon}
                {feature.tag && <Tag color={feature.tagColor}>{feature.tag}</Tag>}
              </div>
              <Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>{feature.title}</Title>
              <Paragraph type="secondary" style={{ flex: 1 }}>{feature.description}</Paragraph>
              <Button
                type="primary"
                block
                size="large"
                style={{ marginTop: 8, borderRadius: 12 }}
                onClick={() => navigate(feature.route)}
              >
                {feature.buttonText}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        style={{
          marginTop: 32,
          borderRadius: 20,
          background: 'linear-gradient(135deg, #1D5BBD, #3D8AFF)',
          border: 'none',
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <Row align="middle" gutter={24}>
          <Col xs={24} md={16}>
            <Title level={3} style={{ color: '#fff', marginTop: 0 }}>
              Готовы к экзамену?
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16 }}>
              Выберите подходящий тариф и начните подготовку прямо сейчас.
              Тесты, видео уроки и книга ПДД — всё в одном месте.
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right', marginTop: 16 }}>
            <Button
              size="large"
              style={{
                borderRadius: 16,
                background: '#FFE000',
                color: '#000',
                border: 'none',
                fontWeight: 600,
                height: 52,
                padding: '0 40px',
              }}
              onClick={() => navigate('/tariffs')}
            >
              Выбрать тариф
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
