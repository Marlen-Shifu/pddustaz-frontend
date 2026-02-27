import { useEffect, useState } from 'react';
import { Typography, Table, Button, Tag, Modal, Form, Input, Select, Popconfirm, Space, Spin, App, Result } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { schoolsApi } from '@/api/schools';
import { subscriptionsApi } from '@/api/subscriptions';
import { unwrapList } from '@/api/client';
import type { Student, StudentCreateRequest, SubscriptionPlan } from '@/types';
import { useNavigate } from 'react-router-dom';
import PhoneInput from '@/components/PhoneInput';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function SchoolStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [notCreated, setNotCreated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [subForm] = Form.useForm();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const loadStudents = () => {
    setLoading(true);
    schoolsApi.getStudents()
      .then(({ data }) => setStudents(unwrapList(data)))
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setNotCreated(true);
        } else {
          message.error('Не удалось загрузить курсантов');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
    subscriptionsApi.getPlans()
      .then(({ data }) => setPlans(unwrapList(data).filter((p) => p.is_active)))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    form.setFieldsValue({ username: student.username, email: student.email, phone: student.phone });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingStudent) {
        await schoolsApi.updateStudent(editingStudent.id, values);
        message.success('Курсант обновлён');
      } else {
        await schoolsApi.createStudent(values as StudentCreateRequest);
        message.success('Курсант добавлен');
      }
      setModalOpen(false);
      loadStudents();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return; // validation error
      message.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await schoolsApi.deleteStudent(id);
      message.success('Курсант удалён');
      loadStudents();
    } catch {
      message.error('Ошибка при удалении');
    }
  };

  const handlePurchase = async () => {
    try {
      const values = await subForm.validateFields();
      setSaving(true);
      await schoolsApi.purchaseSubscriptions({
        plan_id: values.plan_id,
        student_ids: values.student_ids,
      });
      message.success('Подписки приобретены');
      setSubModalOpen(false);
      subForm.resetFields();
      loadStudents();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error('Ошибка при покупке подписок');
    } finally {
      setSaving(false);
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Курсанты</Title>
        <Space>
          <Button icon={<ShoppingCartOutlined />} onClick={() => { subForm.resetFields(); setSubModalOpen(true); }}>
            Купить подписки
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Добавить курсанта
          </Button>
        </Space>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <Table
          dataSource={students}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          columns={[
            { title: 'Имя пользователя', dataIndex: 'username', key: 'username' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (v: string) => v || '—' },
            {
              title: 'Подписка',
              dataIndex: 'has_active_subscription',
              key: 'sub',
              render: (active: boolean) => active
                ? <Tag color="success">Активна</Tag>
                : <Tag color="default">Нет</Tag>,
            },
            {
              title: 'Дата регистрации',
              dataIndex: 'date_joined',
              key: 'date_joined',
              render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
            },
            {
              title: 'Действия',
              key: 'actions',
              render: (_: unknown, record: Student) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                  <Popconfirm title="Удалить курсанта?" onConfirm={() => handleDelete(record.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        title={editingStudent ? 'Редактировать курсанта' : 'Добавить курсанта'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="Имя пользователя" rules={[{ required: true, message: 'Введите имя' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Введите email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Телефон">
            <PhoneInput />
          </Form.Item>
          {!editingStudent && (
            <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}>
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Purchase Subscription Modal */}
      <Modal
        title="Купить подписки"
        open={subModalOpen}
        onOk={handlePurchase}
        onCancel={() => setSubModalOpen(false)}
        confirmLoading={saving}
        okText="Купить"
        cancelText="Отмена"
      >
        <Form form={subForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="plan_id" label="Тарифный план" rules={[{ required: true, message: 'Выберите план' }]}>
            <Select
              placeholder="Выберите план"
              options={plans.map((p) => ({
                label: `${p.name} — ${p.price_b2b} ₸ (${p.duration_days} дн.)`,
                value: p.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="student_ids" label="Курсанты" rules={[{ required: true, message: 'Выберите курсантов' }]}>
            <Select
              mode="multiple"
              placeholder="Выберите курсантов"
              options={students.map((s) => ({
                label: `${s.username} (${s.email})`,
                value: s.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
