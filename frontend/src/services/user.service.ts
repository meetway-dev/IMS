import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { User, PaginatedResponse, PaginationParams } from '@/types';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

interface UpdateUserData extends Partial<CreateUserData> {
  password?: string;
}

export const userService = {
  /**
   * Get all users with pagination
   */
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.getPaginated<User>(
      API_ENDPOINTS.USERS.LIST,
      params
    );
    return response;
  },

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id));
    return response.data;
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<User>(API_ENDPOINTS.USERS.CREATE, data);
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put<User>(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  },
};
