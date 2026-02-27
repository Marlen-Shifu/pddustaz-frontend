import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Card, Spin, Result, Statistic, Row, Col, Tag, App } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { testsApi } from '@/api/tests';
import type { TestAttemptDetail } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function TestResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [attempt, setAttempt] = useState<TestAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    testsApi.getAttempt(Number(id))
      .then(({ data }) => {
        if (data.status === 'in_progress') {
          navigate(`/tests/attempt/${id}`, { replace: true });
          return;
        }
        setAttempt(data);
      })
      .catch(() => message.error('Не удалось загрузить результат'))
      .finally(() => setLoading(false));
  }, [id, navigate, message]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  if (!attempt) {
    return <Result status="error" title="Результат не найден" extra={<Button onClick={() => navigate('/tests')}>К тестам</Button>} />;
  }

  const correctCount = attempt.answers.filter((a) => a.is_correct).length;
  const incorrectCount = attempt.answers.filter((a) => !a.is_correct && a.selected_answer !== null).length;
  const unansweredCount = attempt.answers.filter((a) => a.selected_answer === null).length;

  const timeTaken = attempt.finished_at
    ? Math.round((new Date(attempt.finished_at).getTime() - new Date(attempt.started_at).getTime()) / 60000)
    : null;

  const handleRetry = async () => {
    try {
      const { data: newAttempt } = await testsApi.startAttempt(attempt.test.id);
      navigate(`/tests/attempt/${newAttempt.id}`);
    } catch {
      message.error('Не удалось начать тест');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card style={{ borderRadius: 16, textAlign: 'center', marginBottom: 24 }}>
        {attempt.is_passed ? (
          <Result
            icon={<TrophyOutlined style={{ color: '#30A943' }} />}
            title={<span style={{ color: '#30A943' }}>Тест пройден!</span>}
            subTitle={attempt.test.name}
          />
        ) : (
          <Result
            icon={<CloseCircleOutlined style={{ color: '#E73642' }} />}
            title={<span style={{ color: '#E73642' }}>Тест не пройден</span>}
            subTitle={attempt.test.name}
          />
        )}
      </Card>

      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Баллы"
              value={attempt.score}
              suffix={`/ ${attempt.test.passing_score}`}
              valueStyle={{ color: attempt.is_passed ? '#30A943' : '#E73642' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Статус"
              valueRender={() => (
                <Tag color={attempt.status === 'completed' ? 'success' : 'default'} style={{ fontSize: 14 }}>
                  {attempt.status === 'completed' ? 'Завершён' : 'Истёк'}
                </Tag>
              )}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Время"
              value={timeTaken !== null ? `${timeTaken} мин` : '—'}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Title level={5}>Ответы</Title>
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 24, color: '#30A943' }} />
              <div><Text strong style={{ fontSize: 20 }}>{correctCount}</Text></div>
              <Text type="secondary">Правильных</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <CloseCircleOutlined style={{ fontSize: 24, color: '#E73642' }} />
              <div><Text strong style={{ fontSize: 20 }}>{incorrectCount}</Text></div>
              <Text type="secondary">Неправильных</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, color: '#999' }}>—</div>
              <div><Text strong style={{ fontSize: 20 }}>{unansweredCount}</Text></div>
              <Text type="secondary">Без ответа</Text>
            </div>
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text type="secondary">Начат</Text>
            <div><Text>{dayjs(attempt.started_at).format('DD.MM.YYYY HH:mm')}</Text></div>
          </Col>
          <Col span={12}>
            <Text type="secondary">Завершён</Text>
            <div><Text>{attempt.finished_at ? dayjs(attempt.finished_at).format('DD.MM.YYYY HH:mm') : '—'}</Text></div>
          </Col>
        </Row>
      </Card>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button block size="large" onClick={() => navigate('/tests')} style={{ borderRadius: 12 }}>
          К списку тестов
        </Button>
        <Button block size="large" type="primary" onClick={handleRetry} style={{ borderRadius: 12 }}>
          Попробовать снова
        </Button>
      </div>
    </div>
  );
}
