import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '@/types';
import { authApi } from '@/api/auth';
import { usersApi } from '@/api/users';
import { setTokens, clearTokens, getAccessToken } from '@/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!getAccessToken(),
  loading: false,

  login: async (data) => {
    const { data: tokens } = await authApi.login(data);
    setTokens(tokens);
    set({ isAuthenticated: true });
    const { data: user } = await usersApi.getMe();
    set({ user });
  },

  register: async (data) => {
    const { data: res } = await authApi.register(data);
    setTokens(res.tokens);
    set({ user: res.user, isAuthenticated: true });
  },

  fetchUser: async () => {
    set({ loading: true });
    try {
      const { data: user } = await usersApi.getMe();
      set({ user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
      clearTokens();
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },
}));
