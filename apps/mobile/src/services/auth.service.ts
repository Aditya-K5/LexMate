import { apiClient } from '../lib/api-client';
import type { AuthResponse, LoginPayload, RegisterPayload, SafeUser, Organization } from '@lexmate/types';

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', payload);
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', payload);
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  },

  getProfile: async (): Promise<{ user: SafeUser; organization: Organization }> => {
    return apiClient.get<{ user: SafeUser; organization: Organization }>('/auth/me');
  },
};
