import { apiClient } from './client';
import type {
  LoginRequest,
  TokenResponse,
  RegisterRequest,
  RegisterResponse,
  ChangePasswordRequest,
} from '@/types';

export const authApi = {
  login(data: LoginRequest) {
    return apiClient.post<TokenResponse>('/users/login/', data);
  },

  register(data: RegisterRequest) {
    return apiClient.post<RegisterResponse>('/users/register/', data);
  },

  refreshToken(refresh: string) {
    return apiClient.post<TokenResponse>('/users/token/refresh/', { refresh });
  },

  changePassword(data: ChangePasswordRequest) {
    return apiClient.post<{ detail: string }>('/users/change-password/', data);
  },
};
