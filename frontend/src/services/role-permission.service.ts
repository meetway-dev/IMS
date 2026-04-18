import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Role, Permission, PaginatedResponse, PaginationParams } from '@/types';

interface CreateRoleData {
  name: string;
  description?: string;
  isSystem?: boolean;
  isDefault?: boolean;
  priority?: number;
  parentRoleId?: string;
  permissionIds?: string[];
}

interface UpdateRoleData extends Partial<CreateRoleData> {}

interface CreatePermissionData {
  key: string;
  name: string;
  description?: string;
  type?: 'API' | 'UI' | 'DATA';
  effect?: 'ALLOW' | 'DENY';
  module: string;
  resource?: string;
  action?: string;
  scope?: string;
  isSystem?: boolean;
}

interface UpdatePermissionData extends Partial<CreatePermissionData> {}

export const roleService = {
  async getAllRoles(params?: PaginationParams): Promise<PaginatedResponse<Role>> {
    return apiClient.getPaginated<Role>(API_ENDPOINTS.ROLES.LIST, params);
  },

  async getRole(id: string): Promise<Role> {
    const res = await apiClient.get<Role>(API_ENDPOINTS.ROLES.DETAIL(id));
    return res.data;
  },

  async createRole(data: CreateRoleData): Promise<Role> {
    const res = await apiClient.post<Role>(API_ENDPOINTS.ROLES.CREATE, data);
    return res.data;
  },

  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    const res = await apiClient.patch<Role>(API_ENDPOINTS.ROLES.UPDATE(id), data);
    return res.data;
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ROLES.DELETE(id));
  },

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    await apiClient.post(API_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(roleId), { permissionIds });
  },

  async cloneRole(roleId: string, name: string): Promise<Role> {
    const res = await apiClient.post<Role>(API_ENDPOINTS.ROLES.CLONE(roleId), { name });
    return res.data;
  },
};

export const permissionService = {
  async getAllPermissions(params?: PaginationParams): Promise<PaginatedResponse<Permission>> {
    return apiClient.getPaginated<Permission>(API_ENDPOINTS.PERMISSIONS.LIST, params);
  },

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    const res = await apiClient.get<Permission[]>(API_ENDPOINTS.PERMISSIONS.BY_MODULE(module));
    return res.data;
  },

  async getPermission(id: string): Promise<Permission> {
    const res = await apiClient.get<Permission>(API_ENDPOINTS.PERMISSIONS.DETAIL(id));
    return res.data;
  },

  async createPermission(data: CreatePermissionData): Promise<Permission> {
    const res = await apiClient.post<Permission>(API_ENDPOINTS.PERMISSIONS.CREATE, data);
    return res.data;
  },

  async updatePermission(id: string, data: UpdatePermissionData): Promise<Permission> {
    const res = await apiClient.patch<Permission>(API_ENDPOINTS.PERMISSIONS.UPDATE(id), data);
    return res.data;
  },

  async deletePermission(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PERMISSIONS.DELETE(id));
  },
};
