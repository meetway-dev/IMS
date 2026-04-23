import { axiosInstance } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { User, TokenResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await axiosInstance.post<TokenResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<User> {
    const response = await axiosInstance.post<User>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await axiosInstance.post<TokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<{ ok: boolean }> {
    const response = await axiosInstance.post<{ ok: boolean }>(
      API_ENDPOINTS.AUTH.LOGOUT,
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
