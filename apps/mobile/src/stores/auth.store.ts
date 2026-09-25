import { create } from 'zustand';
import type { User } from '@lexmate/types';
import { SecureStorage } from '../lib/secure-store';

const TOKEN_KEY = 'lexmate_auth_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, token) => {
    await SecureStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStorage.deleteItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  initializeAuth: async () => {
    try {
      const token = await SecureStorage.getItem(TOKEN_KEY);
      if (token) {
        set({ token, isAuthenticated: true, isLoading: false });
      } else {
        set({ token: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
