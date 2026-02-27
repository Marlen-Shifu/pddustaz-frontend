import { Typography, Empty } from 'antd';
import { ReadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function BookPage() {
  return (
    <div>
      <Title level={2}>Книга ПДД 2026</Title>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>
        Полный сборник правил дорожного движения Республики Казахстан
      </Paragraph>
      <Empty
        image={<ReadOutlined style={{ fontSize: 64, color: '#1D5BBD' }} />}
        description="Раздел в разработке"
        style={{ marginTop: 80 }}
      />
    </div>
  );
}
