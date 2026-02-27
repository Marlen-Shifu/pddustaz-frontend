import { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Tag, Spin, Button, Result } from 'antd';
import { ReadOutlined, LockOutlined } from '@ant-design/icons';
import { lessonsApi } from '@/api/lessons';
import { unwrapList } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { Category } from '@/types';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function LessonsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    lessonsApi.getCategories()
      .catch(() => ({ data: [] as Category[] }))
      .then(({ data }) => setCategories(unwrapList(data as Category[])))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  return (
    <div>
      <Title level={2}>Уроки</Title>
      <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 24 }}>
        Выберите категорию для изучения
      </Paragraph>

      {!isAuthenticated && (
        <Result
          icon={<LockOutlined style={{ color: '#1D5BBD' }} />}
          title="Требуется авторизация"
          subTitle="Войдите, чтобы получить доступ ко всем урокам"
          extra={
            <Button type="primary" size="large" style={{ borderRadius: 12 }} onClick={() => navigate('/auth/login')}>
              Войти в аккаунт
            </Button>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        {categories.map((cat) => (
          <Col xs={24} sm={12} md={8} lg={6} key={cat.id}>
            <Card
              hoverable
              style={{ borderRadius: 16 }}
              styles={{ body: { padding: 20 } }}
              onClick={() => navigate(`/categories/${cat.slug}`)}
            >
              <ReadOutlined style={{ fontSize: 28, color: '#1D5BBD', marginBottom: 12, display: 'block' }} />
              <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>{cat.name}</Title>
              <Tag color="blue">{cat.lessons_count} уроков</Tag>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
