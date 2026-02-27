import { apiClient } from './client';
import type { User } from '@/types';

export const usersApi = {
  getMe() {
    return apiClient.get<User>('/users/me/');
  },

  getProfile() {
    return apiClient.get<User>('/users/profile/');
  },

  updateProfile(data: FormData | Record<string, string>) {
    const isFormData = data instanceof FormData;
    return apiClient.patch<User>('/users/profile/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },
};
