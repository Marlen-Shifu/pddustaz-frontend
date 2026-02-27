import { useEffect, useState } from 'react';
import { Typography, Card, Form, Input, Button, Upload, Spin, App, Result } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { schoolsApi } from '@/api/schools';
import type { DrivingSchoolDetail } from '@/types';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '@/components/PhoneInput';
import axios from 'axios';

const { Title } = Typography;
const { TextArea } = Input;

export default function SchoolSettingsPage() {
  const [school, setSchool] = useState<DrivingSchoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notCreated, setNotCreated] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { message } = App.useApp();

  useEffect(() => {
    schoolsApi.getMySchool()
      .then(({ data }) => {
        setSchool(data);
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
        });
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setNotCreated(true);
        } else {
          message.error('Не удалось загрузить данные');
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('logo', fileList[0].originFileObj);
      }

      const { data } = await schoolsApi.updateMySchool(formData);
      setSchool(data);
      message.success('Настройки сохранены');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

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

  if (!school) return null;

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={2}>Настройки автошколы</Title>

      <Card style={{ borderRadius: 16 }}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="address" label="Адрес">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Телефон">
            <PhoneInput />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Введите корректный email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Логотип">
            {school.logo && fileList.length === 0 && (
              <img src={school.logo} alt="Логотип" style={{ maxWidth: 150, borderRadius: 12, marginBottom: 8, display: 'block' }} />
            )}
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Загрузить логотип</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" loading={saving} onClick={handleSave} style={{ borderRadius: 12 }}>
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
