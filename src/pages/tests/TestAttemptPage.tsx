import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Card, Radio, Spin, Progress, Space, App, Result } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { testsApi } from '@/api/tests';
import type { TestAttemptDetail, Question } from '@/types';

const { Title, Text } = Typography;

export default function TestAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [attempt, setAttempt] = useState<TestAttemptDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredMap, setAnsweredMap] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const finishingRef = useRef(false);
  const finishAttempt = useCallback(async () => {
    if (!id || finishingRef.current) return;
    finishingRef.current = true;
    setFinishing(true);
    try {
      await testsApi.finishAttempt(Number(id));
      navigate(`/tests/result/${id}`, { replace: true });
    } catch {
      message.error('Ошибка при завершении теста');
      finishingRef.current = false;
      setFinishing(false);
    }
  }, [id, navigate, message]);

  useEffect(() => {
    if (!id) return;
    testsApi.getAttempt(Number(id))
      .then(async ({ data }) => {
        setAttempt(data);

        if (data.status !== 'in_progress') {
          navigate(`/tests/result/${id}`, { replace: true });
          return;
        }

        // Calculate time left
        const started = new Date(data.started_at).getTime();
        const limitMs = data.test.time_limit * 60 * 1000;
        const remaining = Math.max(0, Math.floor((started + limitMs - Date.now()) / 1000));
        setTimeLeft(remaining);

        // Fetch questions from test detail
        const { data: testDetail } = await testsApi.getTest(data.test.id);
        if (testDetail.questions?.length) {
          setQuestions(testDetail.questions);
        }

        // Pre-fill already answered questions
        const answered: Record<number, number> = {};
        for (const a of data.answers) {
          if (a.selected_answer !== null) {
            answered[a.question] = a.selected_answer;
          }
        }
        setAnsweredMap(answered);
      })
      .catch(() => message.error('Не удалось загрузить попытку'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 && attempt?.status === 'in_progress' && !loading) {
      finishAttempt();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishAttempt();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, attempt?.status, loading, finishAttempt]);

  const handleSubmitAnswer = async () => {
    if (!id || selectedAnswer === null || questions.length === 0) return;
    const question = questions[currentIndex];
    setSubmitting(true);
    try {
      await testsApi.submitAnswer(Number(id), {
        question_id: question.id,
        answer_id: selectedAnswer,
      });
      setAnsweredMap((prev) => ({ ...prev, [question.id]: selectedAnswer }));
      setSelectedAnswer(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch {
      message.error('Ошибка при отправке ответа');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  if (!attempt) {
    return <Result status="error" title="Попытка не найдена" extra={<Button onClick={() => navigate('/tests')}>К тестам</Button>} />;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // If questions couldn't be loaded, show fallback
  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card style={{ borderRadius: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>{attempt.test.name}</Title>
            <Text style={{ fontSize: 20, color: timeLeft < 60 ? '#E73642' : undefined }}>
              <ClockCircleOutlined /> {formatTime(timeLeft)}
            </Text>
          </div>
        </Card>

        <Result
          status="warning"
          title="Не удалось загрузить вопросы"
          subTitle="Попробуйте обновить страницу или вернуться к тестам"
          extra={
            <Space>
              <Button type="primary" onClick={() => window.location.reload()}>
                Обновить
              </Button>
              <Button type="primary" danger loading={finishing} onClick={finishAttempt}>
                Завершить тест
              </Button>
              <Button onClick={() => navigate('/tests')}>
                Назад к тестам
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answeredMap).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Title level={4} style={{ margin: 0 }}>{attempt.test.name}</Title>
          <Text style={{ fontSize: 20, fontWeight: 600, color: timeLeft < 60 ? '#E73642' : undefined }}>
            <ClockCircleOutlined /> {formatTime(timeLeft)}
          </Text>
        </div>
        <Progress percent={progress} format={() => `${answeredCount}/${questions.length}`} />
      </Card>

      {/* Question */}
      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <Text type="secondary">Вопрос {currentIndex + 1} из {questions.length}</Text>
        <Title level={5} style={{ marginTop: 8 }}>{currentQuestion.text}</Title>

        {currentQuestion.image && (
          <img
            src={currentQuestion.image}
            alt="Вопрос"
            style={{ maxWidth: '100%', borderRadius: 12, marginBottom: 16 }}
          />
        )}

        <Radio.Group
          value={selectedAnswer ?? answeredMap[currentQuestion.id] ?? null}
          onChange={(e) => setSelectedAnswer(e.target.value)}
          style={{ width: '100%' }}
          disabled={currentQuestion.id in answeredMap}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {currentQuestion.answers.map((opt) => (
              <Radio
                key={opt.id}
                value={opt.id}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #f0f0f0',
                  borderRadius: 12,
                  width: '100%',
                }}
              >
                {opt.text}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Card>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={currentIndex === 0}
          onClick={() => { setCurrentIndex(currentIndex - 1); setSelectedAnswer(null); }}
        >
          Назад
        </Button>
        <Space>
          {!(currentQuestion.id in answeredMap) && (
            <Button
              type="primary"
              loading={submitting}
              disabled={selectedAnswer === null}
              onClick={handleSubmitAnswer}
            >
              Ответить
            </Button>
          )}
          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => { setCurrentIndex(currentIndex + 1); setSelectedAnswer(null); }}>
              Далее
            </Button>
          ) : (
            <Button type="primary" danger loading={finishing} onClick={finishAttempt}>
              Завершить тест
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}
