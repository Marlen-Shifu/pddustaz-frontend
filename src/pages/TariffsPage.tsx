import { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Button, Spin, App } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { subscriptionsApi } from '@/api/subscriptions';
import { unwrapList } from '@/api/client';
import type { SubscriptionPlan } from '@/types';

const { Title, Text, Paragraph } = Typography;

export default function TariffsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  useEffect(() => {
    subscriptionsApi.getPlans()
      .then(({ data }) => setPlans(unwrapList(data).filter((p) => p.is_active)))
      .catch(() => message.error('Не удалось загрузить тарифы'))
      .finally(() => setLoading(false));
  }, [message]);

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />;
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Тарифы и оплата</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          Выберите подходящий тариф для подготовки к экзамену
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {plans.map((plan, idx) => {
          const isMiddle = idx === 1 && plans.length > 1;
          return (
            <Col xs={24} sm={12} lg={8} key={plan.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 20,
                  border: isMiddle ? '2px solid #1D5BBD' : '1px solid #f0f0f0',
                  height: '100%',
                }}
                styles={{
                  body: { display: 'flex', flexDirection: 'column', height: '100%', padding: 32 },
                }}
              >
                <Text type="secondary" style={{ fontSize: 14 }}>Тариф</Text>
                <Title level={3} style={{ marginTop: 4, marginBottom: 8 }}>{plan.name}</Title>

                <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                  {plan.description}
                </Paragraph>

                <div style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 36, fontWeight: 600 }}>
                    {Number(plan.price_b2c).toLocaleString('ru-RU')} &#8376;
                  </Text>
                  <Text type="secondary"> / {plan.duration_days} дней</Text>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckOutlined style={{ color: '#30A943' }} />
                    <Text>Полный доступ на {plan.duration_days} дней</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckOutlined style={{ color: '#30A943' }} />
                    <Text>Все тесты и уроки</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckOutlined style={{ color: '#30A943' }} />
                    <Text>Книга ПДД</Text>
                  </div>
                </div>

                <Button
                  type={isMiddle ? 'primary' : 'default'}
                  block
                  size="large"
                  style={{ marginTop: 24, borderRadius: 12, height: 52, fontWeight: 600 }}
                >
                  Выбрать тариф
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
