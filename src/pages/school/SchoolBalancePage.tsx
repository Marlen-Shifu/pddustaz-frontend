import { useEffect, useState } from 'react';
import { Typography, Card, Table, Tag, Statistic, Spin, Button, Result, App } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { schoolsApi } from '@/api/schools';
import type { BalanceResponse, BalanceTransaction } from '@/types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;

const txTypeLabel: Record<string, string> = {
  top_up: 'Пополнение',
  purchase: 'Покупка',
};

const txTypeColor: Record<string, string> = {
  top_up: 'green',
  purchase: 'red',
};

export default function SchoolBalancePage() {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notCreated, setNotCreated] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    schoolsApi.getBalance()
      .then(({ data: res }) => setData(res))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setNotCreated(true);
        } else {
          message.error('Не удалось загрузить баланс');
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  if (notCreated) {
    return (
      <Result
        status="warning"
        title="Автошкола не создана"
        subTitle="Сначала создайте автошколу в разделе «Моя автошкола»"
        extra={
          <Button type="primary" style={{ borderRadius: 12 }} onClick={() => navigate('/school')}>
            Создать автошколу
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <Title level={2}>Баланс</Title>

      <Card style={{ borderRadius: 16, marginBottom: 24, textAlign: 'center' }}>
        <Statistic
          title="Текущий баланс"
          value={data?.balance ?? '0'}
          suffix="₸"
          prefix={<WalletOutlined />}
          valueStyle={{ fontSize: 36, color: '#30A943' }}
        />
      </Card>

      <Card title="История транзакций" style={{ borderRadius: 16 }}>
        <Table
          dataSource={data?.transactions ?? []}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          columns={[
            {
              title: 'Тип',
              dataIndex: 'transaction_type',
              key: 'type',
              render: (type: string) => (
                <Tag color={txTypeColor[type]}>{txTypeLabel[type]}</Tag>
              ),
            },
            {
              title: 'Сумма',
              dataIndex: 'amount',
              key: 'amount',
              render: (amount: string, record: BalanceTransaction) => (
                <span style={{ color: record.transaction_type === 'top_up' ? '#30A943' : '#E73642', fontWeight: 600 }}>
                  {record.transaction_type === 'top_up' ? '+' : '-'}{amount} ₸
                </span>
              ),
            },
            {
              title: 'Описание',
              dataIndex: 'description',
              key: 'description',
            },
            {
              title: 'Автор',
              dataIndex: 'created_by_name',
              key: 'created_by',
              render: (name: string | null) => name || '—',
            },
            {
              title: 'Дата',
              dataIndex: 'created_at',
              key: 'created_at',
              render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
              sorter: (a: BalanceTransaction, b: BalanceTransaction) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
              defaultSortOrder: 'descend',
            },
          ]}
        />
      </Card>
    </div>
  );
}
