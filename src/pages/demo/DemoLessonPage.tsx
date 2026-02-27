import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Spin, App, Result, Breadcrumb, Tag } from 'antd';
import { demoApi } from '@/api/demo';
import type { LessonDetail } from '@/types';

const { Title, Text } = Typography;

export default function DemoLessonPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    demoApi.getLesson(slug)
      .then(({ data }) => setLesson(data))
      .catch(() => message.error('Не удалось загрузить урок'))
      .finally(() => setLoading(false));
  }, [slug, message]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  if (!lesson) {
    return <Result status="error" title="Урок не найден" />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <a onClick={() => navigate('/demo')}>Демо</a> },
          { title: lesson.title },
        ]}
      />

      <Card style={{ borderRadius: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <Title level={2} style={{ marginBottom: 8 }}>{lesson.title}</Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Tag color="blue">{lesson.category_name}</Tag>
            <Tag color="green">Демо</Tag>
          </div>
        </div>

        {lesson.image && (
          <img
            src={lesson.image}
            alt={lesson.title}
            style={{ width: '100%', borderRadius: 12, marginBottom: 24 }}
          />
        )}

        {lesson.video_url && (
          <div style={{ marginBottom: 24 }}>
            <iframe
              src={lesson.video_url}
              title={lesson.title}
              style={{ width: '100%', height: 400, border: 'none', borderRadius: 12 }}
              allowFullScreen
            />
          </div>
        )}

        <div
          className="lesson-content"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
          style={{ fontSize: 16, lineHeight: 1.8 }}
        />

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary">
            Обновлено: {new Date(lesson.updated_at).toLocaleDateString('ru-RU')}
          </Text>
        </div>
      </Card>
    </div>
  );
}
