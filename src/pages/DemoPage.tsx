import { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, Tabs, App } from 'antd';
import { FileTextOutlined, PlayCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { demoApi } from '@/api/demo';
import { unwrapList } from '@/api/client';
import type { Test, LessonListItem } from '@/types';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const testTypeLabel: Record<string, string> = {
  exam: 'Экзамен',
  practice: 'Практика',
  topic: 'По теме',
};

const testTypeColor: Record<string, string> = {
  exam: 'red',
  practice: 'blue',
  topic: 'green',
};

export default function DemoPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [lessons, setLessons] = useState<LessonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    Promise.all([
      demoApi.getTests().catch(() => ({ data: [] })),
      demoApi.getLessons().catch(() => ({ data: [] })),
    ])
      .then(([testRes, lessonRes]) => {
        setTests(unwrapList(testRes.data as Test[]));
        setLessons(unwrapList(lessonRes.data as LessonListItem[]));
      })
      .catch(() => message.error('Не удалось загрузить демо-контент'))
      .finally(() => setLoading(false));
  }, [message]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  const tabs = [
    {
      key: 'tests',
      label: (
        <span><FileTextOutlined /> Демо-тесты</span>
      ) as unknown as string,
      children: (
        <Row gutter={[16, 16]}>
          {tests.length === 0 && (
            <Col span={24}>
              <Text type="secondary">Демо-тесты пока недоступны</Text>
            </Col>
          )}
          {tests.map((test) => (
            <Col xs={24} sm={12} md={8} lg={6} key={test.id}>
              <Card hoverable style={{ borderRadius: 16 }} styles={{ body: { padding: 20 } }}>
                <PlayCircleOutlined style={{ fontSize: 28, color: '#1D5BBD', marginBottom: 12, display: 'block' }} />
                <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>{test.name}</Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
                  {test.description}
                </Text>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                  <Tag color={testTypeColor[test.test_type]}>{testTypeLabel[test.test_type]}</Tag>
                  <Tag>{test.questions_count} вопросов</Tag>
                  <Tag>{test.time_limit} мин</Tag>
                  <Tag color="green">Демо</Tag>
                </div>
                <Button
                  type="primary"
                  block
                  style={{ borderRadius: 10 }}
                  onClick={() => navigate(`/demo/test/${test.id}`)}
                >
                  Попробовать
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: 'lessons',
      label: (
        <span><ReadOutlined /> Демо-уроки</span>
      ) as unknown as string,
      children: (
        <Row gutter={[16, 16]}>
          {lessons.length === 0 && (
            <Col span={24}>
              <Text type="secondary">Демо-уроки пока недоступны</Text>
            </Col>
          )}
          {lessons.map((lesson) => (
            <Col xs={24} sm={12} md={8} lg={6} key={lesson.id}>
              <Card
                hoverable
                style={{ borderRadius: 16 }}
                styles={{ body: { padding: 20 } }}
                cover={lesson.image ? (
                  <img
                    alt={lesson.title}
                    src={lesson.image}
                    style={{ height: 160, objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                  />
                ) : undefined}
                onClick={() => navigate(`/demo/lesson/${lesson.slug}`)}
              >
                {!lesson.image && (
                  <ReadOutlined style={{ fontSize: 28, color: '#1D5BBD', marginBottom: 12, display: 'block' }} />
                )}
                <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>{lesson.title}</Title>
                <Tag color="green">Демо</Tag>
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Демо</Title>
      <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 24 }}>
        Попробуйте бесплатные тесты и уроки без регистрации
      </Paragraph>
      <Tabs items={tabs} />
    </div>
  );
}
