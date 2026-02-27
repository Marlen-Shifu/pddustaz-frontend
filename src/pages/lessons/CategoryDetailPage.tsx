import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Row, Col, Tag, Spin, App, Result, Breadcrumb } from 'antd';
import { ReadOutlined, LockOutlined } from '@ant-design/icons';
import { lessonsApi } from '@/api/lessons';
import type { CategoryDetail } from '@/types';

const { Title, Text } = Typography;

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    lessonsApi.getCategory(slug)
      .then(({ data }) => setCategory(data))
      .catch(() => message.error('Не удалось загрузить категорию'))
      .finally(() => setLoading(false));
  }, [slug, message]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  if (!category) {
    return <Result status="error" title="Категория не найдена" />;
  }

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/tests')}>Тесты и уроки</a> },
          { title: category.name },
        ]}
      />

      <Title level={2}>{category.name}</Title>
      {category.description && (
        <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 24 }}>
          {category.description}
        </Text>
      )}

      <Row gutter={[16, 16]}>
        {category.lessons.map((lesson) => (
          <Col xs={24} sm={12} md={8} lg={6} key={lesson.id}>
            <Card
              hoverable
              style={{ borderRadius: 16 }}
              styles={{ body: { padding: 20 } }}
              cover={lesson.image ? (
                <img src={lesson.image} alt={lesson.title} style={{ height: 160, objectFit: 'cover', borderRadius: '16px 16px 0 0' }} />
              ) : undefined}
              onClick={() => navigate(`/lessons/${lesson.slug}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ReadOutlined style={{ fontSize: 20, color: '#1D5BBD' }} />
                {!lesson.is_demo && <LockOutlined style={{ color: '#999' }} />}
              </div>
              <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>{lesson.title}</Title>
              <div style={{ display: 'flex', gap: 6 }}>
                {lesson.is_demo && <Tag color="green">Демо</Tag>}
                <Tag>Урок {lesson.order}</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {category.lessons.length === 0 && (
        <Result status="info" title="В этой категории пока нет уроков" />
      )}
    </div>
  );
}
