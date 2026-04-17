import apiClient from '@/lib/api-client';

export const roleService = {
  async getAllRoles(): Promise<{ id: string; name: string }[]> {
    const res = await apiClient.get<{ id: string; name: string }[]>('/roles');
    return res.data;
  },
};

export const permissionService = {
  async getAllPermissions(): Promise<{ id: string; key: string; name: string }[]> {
    const res = await apiClient.get<{ id: string; key: string; name: string }[]>('/permissions');
    return res.data;
  },
};
