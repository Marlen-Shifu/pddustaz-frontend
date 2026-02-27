import { apiClient } from './client';
import type {
  DrivingSchoolListItem,
  DrivingSchoolDetail,
  Student,
  StudentCreateRequest,
  BalanceResponse,
  PurchaseSubscriptionRequest,
  UserSubscription,
} from '@/types';

export const schoolsApi = {
  getSchools() {
    return apiClient.get<DrivingSchoolListItem[]>('/schools/');
  },

  getSchool(slug: string) {
    return apiClient.get<DrivingSchoolDetail>(`/schools/${slug}/`);
  },

  // --- My School (school_owner) ---
  getMySchool() {
    return apiClient.get<DrivingSchoolDetail>('/my-school/');
  },

  createMySchool(data: FormData | Record<string, string>) {
    const isFormData = data instanceof FormData;
    return apiClient.post<DrivingSchoolDetail>('/my-school/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  updateMySchool(data: FormData | Record<string, string>) {
    const isFormData = data instanceof FormData;
    return apiClient.patch<DrivingSchoolDetail>('/my-school/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  getStudents() {
    return apiClient.get<Student[]>('/my-school/students/');
  },

  getStudent(id: number) {
    return apiClient.get<Student>(`/my-school/students/${id}/`);
  },

  createStudent(data: StudentCreateRequest) {
    return apiClient.post<Student>('/my-school/students/', data);
  },

  updateStudent(id: number, data: Partial<StudentCreateRequest>) {
    return apiClient.patch<Student>(`/my-school/students/${id}/`, data);
  },

  deleteStudent(id: number) {
    return apiClient.delete(`/my-school/students/${id}/`);
  },

  getBalance() {
    return apiClient.get<BalanceResponse>('/my-school/balance/');
  },

  purchaseSubscriptions(data: PurchaseSubscriptionRequest) {
    return apiClient.post<UserSubscription[]>('/my-school/purchase-subscription/', data);
  },
};
