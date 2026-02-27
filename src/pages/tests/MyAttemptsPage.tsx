import { useEffect, useState } from 'react';
import { Typography, Table, Tag, Button, Spin, Select, Space, App } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { testsApi } from '@/api/tests';
import { unwrapList } from '@/api/client';
import type { TestAttempt, AttemptStatus } from '@/types';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusLabel: Record<string, string> = {
  in_progress: 'В процессе',
  completed: 'Завершён',
  expired: 'Истёк',
};

const statusColor: Record<string, string> = {
  in_progress: 'processing',
  completed: 'success',
  expired: 'default',
};

export default function MyAttemptsPage() {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AttemptStatus | 'all'>('all');
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    testsApi.getAttempts()
      .then(({ data }) => setAttempts(unwrapList(data)))
      .catch(() => message.error('Не удалось загрузить историю'))
      .finally(() => setLoading(false));
  }, [message]);

  const filtered = statusFilter === 'all'
    ? attempts
    : attempts.filter((a) => a.status === statusFilter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>История попыток</Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 180 }}
            options={[
              { label: 'Все статусы', value: 'all' },
              { label: 'В процессе', value: 'in_progress' },
              { label: 'Завершён', value: 'completed' },
              { label: 'Истёк', value: 'expired' },
            ]}
          />
        </Space>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <Table
          dataSource={filtered}
          rowKey="id"
          pagination={{ pageSize: 20 }}
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
                <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>
              ),
            },
            {
              title: 'Результат',
              key: 'score',
              render: (_: unknown, record: TestAttempt) => {
                if (record.status === 'in_progress') return <ClockCircleOutlined style={{ color: '#1D5BBD' }} />;
                return record.is_passed
                  ? <span style={{ color: '#30A943' }}><CheckCircleOutlined /> {record.score}</span>
                  : <span style={{ color: '#E73642' }}><CloseCircleOutlined /> {record.score}</span>;
              },
            },
            {
              title: 'Сдан',
              key: 'is_passed',
              render: (_: unknown, record: TestAttempt) => {
                if (record.status === 'in_progress') return '—';
                return record.is_passed
                  ? <Tag color="success">Да</Tag>
                  : <Tag color="error">Нет</Tag>;
              },
            },
            {
              title: 'Дата',
              dataIndex: 'started_at',
              key: 'started_at',
              render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
              sorter: (a: TestAttempt, b: TestAttempt) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime(),
              defaultSortOrder: 'descend',
            },
            {
              title: '',
              key: 'action',
              render: (_: unknown, record: TestAttempt) =>
                record.status === 'in_progress' ? (
                  <Button size="small" type="primary" onClick={() => navigate(`/tests/attempt/${record.id}`)}>
                    Продолжить
                  </Button>
                ) : (
                  <Button size="small" onClick={() => navigate(`/tests/result/${record.id}`)}>
                    Результат
                  </Button>
                ),
            },
          ]}
        />
      )}
    </div>
  );
}
