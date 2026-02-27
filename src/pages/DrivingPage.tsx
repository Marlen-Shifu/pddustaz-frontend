import { Typography, Empty } from 'antd';
import { CarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function DrivingPage() {
  return (
    <div>
      <Title level={2}>Запись на вождение</Title>
      <Paragraph type="secondary" style={{ fontSize: 16 }}>
        Найдите проверенных инструкторов в вашем городе
      </Paragraph>
      <Empty
        image={<CarOutlined style={{ fontSize: 64, color: '#30A943' }} />}
        description="Раздел в разработке"
        style={{ marginTop: 80 }}
      />
    </div>
  );
}
