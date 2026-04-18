
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { User, PaginatedResponse, PaginationParams } from '@/types';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  roleIds?: string[];
}

interface UpdateUserData extends Partial<CreateUserData> {
  password?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roleIds?: string[];
  permissionIds?: string[];
}


export const userService = {
  /**
   * Get all users with pagination
   */
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return apiClient.getPaginated<User>(API_ENDPOINTS.USERS.LIST, params);
  },


  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    const res = await apiClient.get<User>(API_ENDPOINTS.USERS.DETAIL(id));
    return res.data;
  },


  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    const res = await apiClient.post<User>(API_ENDPOINTS.USERS.CREATE, data);
    return res.data;
  },


  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const res = await apiClient.patch<User>(API_ENDPOINTS.USERS.UPDATE(id), data);
    return res.data;
  },

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete<User>(API_ENDPOINTS.USERS.DELETE(id));
  },

  /**
   * Assign roles to user
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    await apiClient.post(API_ENDPOINTS.USERS.DETAIL(userId) + '/roles', { roleIds });
  },

  /**
   * Assign direct permissions to user
   */
  async assignPermissions(userId: string, permissionIds: string[]): Promise<void> {
    await apiClient.post(API_ENDPOINTS.USERS.DETAIL(userId) + '/permissions', { permissionIds });
  },
};
