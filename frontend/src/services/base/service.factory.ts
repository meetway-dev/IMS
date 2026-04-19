import { CrudServiceBase } from './crud.service.base';
import { API_ENDPOINTS } from '@/lib/constants';

/**
 * Base entity interface for type safety
 */
export interface BaseEntity {
  id: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
}

/**
 * Factory for creating CRUD services with minimal boilerplate
 */
export class ServiceFactory {
  /**
   * Create a basic CRUD service for a given entity
   */
  static createCrudService<T extends BaseEntity, TCreateDto, TUpdateDto>(
    endpointKey: keyof typeof API_ENDPOINTS,
    options: {
      defaultLimit?: number;
      maxLimit?: number;
      customMethods?: Record<string, (...args: any[]) => any>;
    } = {}
  ): CrudServiceBase<T, TCreateDto, TUpdateDto> & (typeof options.customMethods extends Record<string, any> ? typeof options.customMethods : {}) {
    const endpoint = API_ENDPOINTS[endpointKey] as any;
    const baseEndpoint = typeof endpoint === 'object' && endpoint.LIST ? endpoint.LIST : endpoint;
    
    class GeneratedService extends CrudServiceBase<T, TCreateDto, TUpdateDto> {
      constructor() {
        super({
          endpoint: baseEndpoint,
          defaultLimit: options?.defaultLimit || 20,
          maxLimit: options?.maxLimit || 100,
        });
      }
    }

    // Add custom methods if provided
    const serviceInstance = new GeneratedService();
    
    if (options?.customMethods) {
      Object.entries(options.customMethods).forEach(([methodName, method]) => {
        (serviceInstance as any)[methodName] = method.bind(serviceInstance);
      });
    }

    return serviceInstance as any;
  }

  /**
   * Create a service with tree structure support
   */
  static createTreeService<T extends BaseEntity & { children?: T[] }, TCreateDto, TUpdateDto>(
    endpointKey: keyof typeof API_ENDPOINTS,
    options: {
      defaultLimit?: number;
      maxLimit?: number;
    } = {}
  ) {
    const baseService = this.createCrudService<T, TCreateDto, TUpdateDto>(endpointKey, options);
    const endpoint = API_ENDPOINTS[endpointKey] as any;
    
    return {
      ...baseService,
      async getTree(): Promise<T[]> {
        try {
          const apiClient = (await import('@/lib/api-client')).default;
          const treeEndpoint = endpoint.TREE || `${baseService.getEndpoint()}/tree`;
          const response = await apiClient.get<T[]>(treeEndpoint);
          return response.data;
        } catch (error) {
          const { ErrorHandler } = await import('@/lib/error-handler');
          throw ErrorHandler.handleApiError(error);
        }
      },
    };
  }

  /**
   * Create a service with search capabilities
   */
  static createSearchableService<T extends BaseEntity, TCreateDto, TUpdateDto>(
    endpointKey: keyof typeof API_ENDPOINTS,
    searchFields: string[],
    options: {
      defaultLimit?: number;
      maxLimit?: number;
    } = {}
  ) {
    const baseService = this.createCrudService<T, TCreateDto, TUpdateDto>(endpointKey, options);
    
    return {
      ...baseService,
      async search(
        query: string,
        params?: any
      ): Promise<{ data: T[]; meta: any }> {
        return baseService.search(query, searchFields, params);
      },
    };
  }
}

/**
 * Helper to create typed service instances
 */
export function createService<T extends BaseEntity, TCreateDto, TUpdateDto>(
  endpoint: string,
  options: {
    defaultLimit?: number;
    maxLimit?: number;
  } = {}
): CrudServiceBase<T, TCreateDto, TUpdateDto> {
  return new (class extends CrudServiceBase<T, TCreateDto, TUpdateDto> {
    constructor() {
      super({
        endpoint,
        defaultLimit: options?.defaultLimit || 20,
        maxLimit: options?.maxLimit || 100,
      });
    }
  })();
}