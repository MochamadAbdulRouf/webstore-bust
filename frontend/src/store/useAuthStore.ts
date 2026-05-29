'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isInitialized: false,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('bust_access_token', accessToken);
        localStorage.setItem('bust_refresh_token', refreshToken);
        set({ user, accessToken, refreshToken });
      },

      logout: () => {
        localStorage.removeItem('bust_access_token');
        localStorage.removeItem('bust_refresh_token');
        set({ user: null, accessToken: null, refreshToken: null });
      },

      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data });
        } catch {
          get().logout();
        }
      },

      initialize: async () => {
        const token = localStorage.getItem('bust_access_token');
        if (token) {
          set({ isLoading: true });
          try {
            const response = await api.get('/auth/me');
            set({ user: response.data.data, accessToken: token });
          } catch {
            localStorage.removeItem('bust_access_token');
            localStorage.removeItem('bust_refresh_token');
            set({ user: null, accessToken: null, refreshToken: null });
          } finally {
            set({ isLoading: false });
          }
        }
        set({ isInitialized: true });
      },
    }),
    {
      name: 'bust-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
