import { Typography, Empty } from 'antd';
import { GiftOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function GiftPage() {
  return (
    <div>
      <Title level={2}>Подарочный сертификат</Title>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>
        Подарите обучение близким — оформите сертификат онлайн
      </Paragraph>
      <Empty
        image={<GiftOutlined style={{ fontSize: 64, color: '#FFB800' }} />}
        description="Раздел в разработке"
        style={{ marginTop: 80 }}
      />
    </div>
  );
}
