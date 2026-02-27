import { Typography, Empty } from 'antd';
import { CustomerServiceOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function SupportPage() {
  return (
    <div>
      <Title level={2}>Поддержка</Title>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>
        Свяжитесь с нами, если у вас возникли вопросы
      </Paragraph>
      <Empty
        image={<CustomerServiceOutlined style={{ fontSize: 64, color: '#1D5BBD' }} />}
        description="Раздел в разработке"
        style={{ marginTop: 80 }}
      />
    </div>
  );
}
