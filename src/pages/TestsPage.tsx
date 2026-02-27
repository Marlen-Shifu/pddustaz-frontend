import { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Tag, Button, Spin, Tabs, Table, Tooltip, App, Result } from 'antd';
import { FileTextOutlined, LockOutlined, HistoryOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { lessonsApi } from '@/api/lessons';
import { testsApi } from '@/api/tests';
import { unwrapList } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import type { Category, Test, TestAttempt } from '@/types';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

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

const attemptStatusLabel: Record<string, string> = {
  in_progress: 'В процессе',
  completed: 'Завершён',
  expired: 'Истёк',
};

const attemptStatusColor: Record<string, string> = {
  in_progress: 'processing',
  completed: 'success',
  expired: 'default',
};

export default function TestsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<number | null>(null);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const requests: Promise<{ data: unknown }>[] = [
      lessonsApi.getCategories().catch(() => ({ data: [] })),
      testsApi.getTests().catch(() => ({ data: [] })),
    ];

    if (isAuthenticated) {
      requests.push(testsApi.getAttempts().catch(() => ({ data: [] })));
    }

    Promise.all(requests)
      .then(([catRes, testRes, attRes]) => {
        setCategories(unwrapList(catRes.data as Category[]));
        setTests(unwrapList(testRes.data as Test[]));
        if (attRes) {
          setAttempts(unwrapList(attRes.data as TestAttempt[]));
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleStartTest = async (test: Test) => {
    if (!isAuthenticated && test.is_demo) {
      navigate(`/demo/test/${test.id}`);
      return;
    }
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (!test.is_demo && !useAuthStore.getState().user?.has_active_subscription) {
      message.warning('Для прохождения этого теста необходима подписка');
      navigate('/tariffs');
      return;
    }
    setStarting(test.id);
    try {
      const { data: attempt } = await testsApi.startAttempt(test.id);
      navigate(`/tests/attempt/${attempt.id}`);
    } catch {
      message.error('Не удалось начать тест');
    } finally {
      setStarting(null);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  const recentAttempts = attempts.slice(0, 5);

  const tabs = [
    {
      key: 'categories',
      label: 'Категории уроков',
      children: (
        <Row gutter={[16, 16]}>
          {categories.map((cat) => (
            <Col xs={24} sm={12} md={8} lg={6} key={cat.id}>
              <Card
                hoverable
                style={{ borderRadius: 16 }}
                styles={{ body: { padding: 20 } }}
                onClick={() => navigate(`/categories/${cat.slug}`)}
              >
                <FileTextOutlined style={{ fontSize: 28, color: '#1D5BBD', marginBottom: 12, display: 'block' }} />
                <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>{cat.name}</Title>
                <Tag color="blue">{cat.lessons_count} уроков</Tag>
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: 'tests',
      label: 'Тесты',
      children: (
        <Row gutter={[16, 16]}>
          {tests.map((test) => {
            const canStart = test.is_demo || (isAuthenticated && useAuthStore.getState().user?.has_active_subscription);
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={test.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 16 }}
                  styles={{ body: { padding: 20 } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <FileTextOutlined style={{ fontSize: 28, color: '#1D5BBD' }} />
                    {!test.is_demo && <LockOutlined style={{ color: '#999' }} />}
                  </div>
                  <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>{test.name}</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
                    {test.description}
                  </Text>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    <Tag color={testTypeColor[test.test_type]}>{testTypeLabel[test.test_type]}</Tag>
                    <Tag>{test.questions_count} вопросов</Tag>
                    <Tag>{test.time_limit} мин</Tag>
                    {test.is_demo && <Tag color="green">Демо</Tag>}
                  </div>
                  {canStart ? (
                    <Button
                      type="primary"
                      block
                      style={{ borderRadius: 10 }}
                      loading={starting === test.id}
                      onClick={() => handleStartTest(test)}
                    >
                      Начать
                    </Button>
                  ) : (
                    <Tooltip title={!isAuthenticated ? 'Войдите в аккаунт' : 'Необходима подписка'}>
                      <Button
                        block
                        style={{ borderRadius: 10 }}
                        onClick={() => navigate(!isAuthenticated ? '/auth/login' : '/tariffs')}
                      >
                        <LockOutlined /> {!isAuthenticated ? 'Войти' : 'Подписка'}
                      </Button>
                    </Tooltip>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      ),
    },
  ];

  // Only show history tab for authenticated users
  if (isAuthenticated) {
    tabs.push({
      key: 'history',
      label: (
        <span><HistoryOutlined /> История</span>
      ) as unknown as string,
      children: (
        <div>
          <Table
            dataSource={recentAttempts}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Тест',
                dataIndex: 'test_name',
                key: 'test_name',
              },
              {
                title: 'Статус',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={attemptStatusColor[status]}>{attemptStatusLabel[status]}</Tag>
                ),
              },
              {
                title: 'Результат',
                key: 'score',
                render: (_: unknown, record: TestAttempt) => {
                  if (record.status === 'in_progress') return <ClockCircleOutlined />;
                  return record.is_passed
                    ? <span style={{ color: '#30A943' }}><CheckCircleOutlined /> {record.score}</span>
                    : <span style={{ color: '#E73642' }}><CloseCircleOutlined /> {record.score}</span>;
                },
              },
              {
                title: 'Дата',
                dataIndex: 'started_at',
                key: 'started_at',
                render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
              },
              {
                title: '',
                key: 'action',
                render: (_: unknown, record: TestAttempt) =>
                  record.status === 'in_progress' ? (
                    <Button size="small" type="link" onClick={() => navigate(`/tests/attempt/${record.id}`)}>
                      Продолжить
                    </Button>
                  ) : (
                    <Button size="small" type="link" onClick={() => navigate(`/tests/result/${record.id}`)}>
                      Результат
                    </Button>
                  ),
              },
            ]}
          />
          {attempts.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Button type="link" onClick={() => navigate('/tests/history')}>
                Показать все попытки
              </Button>
            </div>
          )}
        </div>
      ),
    });
  }

  return (
    <div>
      <Title level={2}>Тесты и уроки</Title>
      <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 24 }}>
        Выберите категорию для изучения или тест для прохождения
      </Paragraph>

      {!isAuthenticated && (
        <Result
          icon={<LockOutlined style={{ color: '#1D5BBD' }} />}
          title="Требуется авторизация"
          subTitle="Войдите, чтобы получить доступ ко всем тестам и сохранять результаты"
          extra={
            <Button type="primary" size="large" style={{ borderRadius: 12 }} onClick={() => navigate('/auth/login')}>
              Войти в аккаунт
            </Button>
          }
        />
      )}

      <Tabs items={tabs} />
    </div>
  );
}
