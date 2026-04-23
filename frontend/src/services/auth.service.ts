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

interface UpdateProfileData {
  name?: string;
  email?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ActivityLogParams {
  page?: number;
  limit?: number;
  action?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await axiosInstance.post<TokenResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await axiosInstance.post<User>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await axiosInstance.post<TokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return response.data;
  },

  async logout(refreshToken: string): Promise<{ ok: boolean }> {
    const response = await axiosInstance.post<{ ok: boolean }>(
      API_ENDPOINTS.AUTH.LOGOUT,
      { refreshToken }
    );
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await axiosInstance.patch<User>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      data
    );
    return response.data;
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );
    return response.data;
  },

  async getActivity(params?: ActivityLogParams): Promise<any> {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ACTIVITY, {
      params,
    });
    return response.data;
  },
};
