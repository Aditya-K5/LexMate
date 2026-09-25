import { create } from 'zustand';
import type {
  AuthResponse,
  LoginPayload,
  Organization,
  RegisterPayload,
  SafeUser,
} from '@lexmate/types';
import { SecureStorage } from '../lib/secure-store';
import { authService } from '../services/auth.service';

const TOKEN_KEY = 'lexmate_auth_token';
const REFRESH_TOKEN_KEY = 'lexmate_refresh_token';

interface AuthState {
  user: SafeUser | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (response: AuthResponse) => Promise<void>;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organization: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (response: AuthResponse) => {
    await SecureStorage.setItem(TOKEN_KEY, response.tokens.accessToken);
    if (response.tokens.refreshToken) {
      await SecureStorage.setItem(REFRESH_TOKEN_KEY, response.tokens.refreshToken);
    }
    set({
      user: response.user,
      organization: response.organization,
      token: response.tokens.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  login: async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    await SecureStorage.setItem(TOKEN_KEY, response.tokens.accessToken);
    if (response.tokens.refreshToken) {
      await SecureStorage.setItem(REFRESH_TOKEN_KEY, response.tokens.refreshToken);
    }
    set({
      user: response.user,
      organization: response.organization,
      token: response.tokens.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
    return response;
  },

  register: async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    await SecureStorage.setItem(TOKEN_KEY, response.tokens.accessToken);
    if (response.tokens.refreshToken) {
      await SecureStorage.setItem(REFRESH_TOKEN_KEY, response.tokens.refreshToken);
    }
    set({
      user: response.user,
      organization: response.organization,
      token: response.tokens.accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
    return response;
  },

  logout: async () => {
    await SecureStorage.deleteItem(TOKEN_KEY);
    await SecureStorage.deleteItem(REFRESH_TOKEN_KEY);
    set({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  initializeAuth: async () => {
    try {
      const token = await SecureStorage.getItem(TOKEN_KEY);
      if (token) {
        set({ token, isLoading: true });
        const profile = await authService.getProfile();
        set({
          user: profile.user,
          organization: profile.organization,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          organization: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      await SecureStorage.deleteItem(TOKEN_KEY);
      await SecureStorage.deleteItem(REFRESH_TOKEN_KEY);
      set({
        user: null,
        organization: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
