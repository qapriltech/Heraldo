import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  requestOtp: (email: string) => Promise<{ devCode?: string }>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  requestOtp: async (email: string) => {
    const res = await api.post<{ success: boolean; devCode?: string }>('/auth/request-otp', {
      email,
      role: 'JOURNALIST',
    });
    return { devCode: res.devCode };
  },

  verifyOtp: async (email: string, code: string) => {
    const res = await api.post<{ success: boolean; user: User; accessToken: string; refreshToken: string }>(
      '/auth/verify-otp',
      { email, code },
    );
    await SecureStore.setItemAsync('heraldo_access_token', res.accessToken);
    await SecureStore.setItemAsync('heraldo_refresh_token', res.refreshToken);
    set({ user: res.user });
    return true;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('heraldo_access_token');
    await SecureStore.deleteItemAsync('heraldo_refresh_token');
    set({ user: null });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('heraldo_access_token');
      if (!token) { set({ loading: false }); return; }
      const user = await api.get<User>('/auth/me');
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
