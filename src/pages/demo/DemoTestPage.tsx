import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Card, Radio, Spin, Progress, Space, App, Result, Modal, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { demoApi } from '@/api/demo';
import type { DemoTestDetail, DemoQuestion, CheckAnswerResponse } from '@/types';

const { Title, Text, Paragraph } = Typography;

interface AnswerRecord {
  questionId: number;
  answerId: number;
  isCorrect: boolean;
}

export default function DemoTestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [test, setTest] = useState<DemoTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [feedback, setFeedback] = useState<CheckAnswerResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!id) return;
    demoApi.getTest(Number(id))
      .then(({ data }) => {
        setTest(data);
        setTimeLeft(data.time_limit * 60);
      })
      .catch(() => message.error('Не удалось загрузить тест'))
      .finally(() => setLoading(false));
  }, [id, message]);

  const finishTest = useCallback(() => {
    clearInterval(timerRef.current);
    setFinished(true);
  }, []);

  // Timer
  useEffect(() => {
    if (!test || finished || loading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [test, finished, loading, finishTest]);

  const handleCheckAnswer = async () => {
    if (!id || !test || selectedAnswer === null) return;
    const question = test.questions[currentIndex];
    setSubmitting(true);
    try {
      const { data } = await demoApi.checkAnswer(Number(id), {
        question_id: question.id,
        answer_id: selectedAnswer,
      });
      setFeedback(data);
      setAnswers((prev) => [...prev, {
        questionId: question.id,
        answerId: selectedAnswer,
        isCorrect: data.is_correct,
      }]);
    } catch {
      message.error('Ошибка при проверке ответа');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!test) return;
    setFeedback(null);
    setSelectedAnswer(null);
    if (currentIndex < test.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishTest();
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setFeedback(null);
    setFinished(false);
    if (test) setTimeLeft(test.time_limit * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  if (!test || test.questions.length === 0) {
    return <Result status="error" title="Тест не найден" extra={<Button onClick={() => navigate('/demo')}>К демо</Button>} />;
  }

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const totalQuestions = test.questions.length;
  const isPassed = correctCount >= test.passing_score;

  const currentQuestion: DemoQuestion = test.questions[currentIndex];
  const isAnswered = answers.some((a) => a.questionId === currentQuestion.id);
  const progress = Math.round((answers.length / totalQuestions) * 100);

  const getAnswerStyle = (answerId: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '12px 16px',
      border: '1px solid #f0f0f0',
      borderRadius: 12,
      width: '100%',
      transition: 'all 0.3s',
    };
    if (!feedback) return base;
    if (answerId === feedback.correct_answer_id) {
      return { ...base, border: '2px solid #30A943', background: '#f6ffed' };
    }
    if (answerId === selectedAnswer && !feedback.is_correct) {
      return { ...base, border: '2px solid #E73642', background: '#fff2f0' };
    }
    return base;
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Title level={4} style={{ margin: 0 }}>{test.name}</Title>
          <Text style={{ fontSize: 20, fontWeight: 600, color: timeLeft < 60 ? '#E73642' : undefined }}>
            <ClockCircleOutlined /> {formatTime(timeLeft)}
          </Text>
        </div>
        <Progress percent={progress} format={() => `${answers.length}/${totalQuestions}`} />
      </Card>

      {/* Question */}
      <Card style={{ borderRadius: 16, marginBottom: 16 }}>
        <Text type="secondary">Вопрос {currentIndex + 1} из {totalQuestions}</Text>
        <Title level={5} style={{ marginTop: 8 }}>{currentQuestion.text}</Title>

        {currentQuestion.media && (currentQuestion.media_type === 'image' || currentQuestion.media_type === 'gif') && (
          <img
            src={currentQuestion.media}
            alt="Вопрос"
            style={{ maxWidth: '100%', borderRadius: 12, marginBottom: 16 }}
          />
        )}

        {currentQuestion.media && currentQuestion.media_type === 'video' && (
          <video
            src={currentQuestion.media}
            controls
            style={{ maxWidth: '100%', borderRadius: 12, marginBottom: 16 }}
          />
        )}

        <Radio.Group
          value={selectedAnswer}
          onChange={(e) => { if (!feedback) setSelectedAnswer(e.target.value); }}
          style={{ width: '100%' }}
          disabled={isAnswered}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {currentQuestion.answers.map((opt) => (
              <Radio key={opt.id} value={opt.id} style={getAnswerStyle(opt.id)}>
                {opt.text}
              </Radio>
            ))}
          </Space>
        </Radio.Group>

        {feedback && (
          <Alert
            style={{ marginTop: 16, borderRadius: 12 }}
            type={feedback.is_correct ? 'success' : 'error'}
            showIcon
            icon={feedback.is_correct ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            message={feedback.is_correct ? 'Правильно!' : 'Неправильно'}
            description={feedback.explanation || undefined}
          />
        )}
      </Card>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => navigate('/demo')}>
          Выйти
        </Button>
        <Space>
          {!isAnswered && (
            <Button
              type="primary"
              loading={submitting}
              disabled={selectedAnswer === null}
              onClick={handleCheckAnswer}
            >
              Ответить
            </Button>
          )}
          {isAnswered && (
            <Button type="primary" onClick={handleNext}>
              {currentIndex < totalQuestions - 1 ? 'Далее' : 'Завершить'}
            </Button>
          )}
        </Space>
      </div>

      {/* Result Modal */}
      <Modal
        open={finished}
        closable={false}
        footer={null}
        centered
        width={480}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          {isPassed ? (
            <CheckCircleOutlined style={{ fontSize: 64, color: '#30A943', marginBottom: 16 }} />
          ) : (
            <CloseCircleOutlined style={{ fontSize: 64, color: '#E73642', marginBottom: 16 }} />
          )}
          <Title level={3} style={{ marginBottom: 8 }}>
            {isPassed ? 'Тест сдан!' : 'Тест не сдан'}
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Правильных ответов: {correctCount} из {totalQuestions}
          </Paragraph>
          <Paragraph type="secondary">
            Проходной балл: {test.passing_score}
          </Paragraph>
          <Progress
            type="circle"
            percent={Math.round((correctCount / totalQuestions) * 100)}
            strokeColor={isPassed ? '#30A943' : '#E73642'}
            style={{ marginBottom: 24 }}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button type="primary" size="large" style={{ borderRadius: 10 }} onClick={handleRetry}>
              Попробовать снова
            </Button>
            <Button size="large" style={{ borderRadius: 10 }} onClick={() => navigate('/demo')}>
              К демо-странице
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
