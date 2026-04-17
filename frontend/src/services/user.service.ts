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
    // Temporary mock data until UsersController is implemented
    console.warn('Using mock user data - UsersController not implemented');
    
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@ims.local',
        name: 'IMS Admin',
        roles: ['ADMIN'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'manager@ims.local',
        name: 'IMS Manager',
        roles: ['MANAGER'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'staff@ims.local',
        name: 'IMS Staff',
        roles: ['STAFF'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Filter by search if provided
    let filteredUsers = mockUsers;
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredUsers = mockUsers.filter(
        user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Simple pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      meta: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    };
  },

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    // Temporary mock implementation
    console.warn('Using mock user data - UsersController not implemented');
    
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@ims.local',
        name: 'IMS Admin',
        roles: ['ADMIN'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        email: 'manager@ims.local',
        name: 'IMS Manager',
        roles: ['MANAGER'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        email: 'staff@ims.local',
        name: 'IMS Staff',
        roles: ['STAFF'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return user;
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    // Temporary mock implementation
    console.warn('Using mock user creation - UsersController not implemented');
    
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      email: data.email,
      name: data.name || data.email.split('@')[0],
      roles: ['STAFF'], // Default role
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newUser;
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    // Temporary mock implementation
    console.warn('Using mock user update - UsersController not implemented');
    
    const mockUser: User = {
      id,
      email: data.email || 'updated@example.com',
      name: data.name || 'Updated User',
      roles: ['STAFF'], // Default role
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return mockUser;
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    // Temporary mock implementation
    console.warn('Using mock user deletion - UsersController not implemented');
    // No-op for now
  },
};
