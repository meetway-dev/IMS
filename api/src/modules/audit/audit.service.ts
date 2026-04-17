import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditAction, AuditActorType } from '@prisma/client';

export interface AuditLogInput {
  actorUserId?: string | null;
  actorType?: AuditActorType;
  action: AuditAction | string;
  entityType?: string | null;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: any;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
}

export interface AuditQueryOptions {
  page?: number;
  limit?: number;
  actorUserId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an audit event with enhanced context
   */
  async log(input: AuditLogInput): Promise<string> {
    try {
      const auditLog = await this.prisma.auditLog.create({
        data: {
          actorType: input.actorType ?? 'USER',
          actorUserId: input.actorUserId ?? undefined,
          action: input.action as AuditAction,
          entityType: input.entityType ?? undefined,
          entityId: input.entityId ?? undefined,
          ip: input.ip ?? undefined,
          userAgent: input.userAgent ?? undefined,
          metadata: input.metadata ?? undefined,
          requestId: input.requestId ?? undefined,
          endpoint: input.endpoint ?? undefined,
          method: input.method ?? undefined,
          statusCode: input.statusCode ?? undefined,
        },
      });

      this.logger.debug(`Audit logged: ${input.action} by ${input.actorUserId}`);
      return auditLog.id;
    } catch (error) {
      this.logger.error('Failed to log audit event', error);
      throw error;
    }
  }

  /**
   * Log user authentication event
   */
  async logAuthEvent(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGED' | 'TOKEN_REFRESHED',
    ip?: string,
    userAgent?: string,
    metadata?: any,
  ): Promise<string> {
    return this.log({
      actorUserId: userId,
      actorType: 'USER',
      action: `USER_${action}` as AuditAction,
      entityType: 'User',
      entityId: userId,
      ip,
      userAgent,
      metadata,
    });
  }

  /**
   * Log RBAC permission change
   */
  async logPermissionChange(
    actorUserId: string,
    action: 'ASSIGNED' | 'REVOKED' | 'UPDATED',
    entityType: 'UserPermission' | 'RolePermission',
    entityId: string,
    targetUserId?: string,
    permissionId?: string,
    roleId?: string,
    metadata?: any,
  ): Promise<string> {
    return this.log({
      actorUserId,
      actorType: 'USER',
      action: `${entityType}_${action}` as AuditAction,
      entityType,
      entityId,
      ip: undefined,
      userAgent: undefined,
      metadata: {
        targetUserId,
        permissionId,
        roleId,
        ...metadata,
      },
    });
  }

  /**
   * Log role change
   */
  async logRoleChange(
    actorUserId: string,
    action: 'CREATED' | 'UPDATED' | 'DELETED' | 'CLONED',
    roleId: string,
    roleName: string,
    metadata?: any,
  ): Promise<string> {
    return this.log({
      actorUserId,
      actorType: 'USER',
      action: `ROLE_${action}` as AuditAction,
      entityType: 'Role',
      entityId: roleId,
      metadata: {
        roleName,
        ...metadata,
      },
    });
  }

  /**
   * Log user management event
   */
  async logUserManagement(
    actorUserId: string,
    action: 'CREATED' | 'UPDATED' | 'DELETED' | 'SUSPENDED' | 'ACTIVATED',
    targetUserId: string,
    metadata?: any,
  ): Promise<string> {
    return this.log({
      actorUserId,
      actorType: 'USER',
      action: `USER_${action}` as AuditAction,
      entityType: 'User',
      entityId: targetUserId,
      metadata,
    });
  }

  /**
   * Query audit logs with pagination and filtering
   */
  async queryAuditLogs(options: AuditQueryOptions): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 50,
      actorUserId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      search,
    } = options;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (actorUserId) {
      where.actorUserId = actorUserId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { ip: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actorUser: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get audit log statistics
   */
  async getAuditStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalLogs: number;
    byAction: Record<string, number>;
    byActorType: Record<string, number>;
    byEntityType: Record<string, number>;
    dailyCounts: Array<{ date: string; count: number }>;
  }> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        action: true,
        actorType: true,
        entityType: true,
        createdAt: true,
      },
    });

    const byAction: Record<string, number> = {};
    const byActorType: Record<string, number> = {};
    const byEntityType: Record<string, number> = {};
    const dailyCountsMap: Record<string, number> = {};

    logs.forEach(log => {
      // Count by action
      byAction[log.action] = (byAction[log.action] || 0) + 1;

      // Count by actor type
      byActorType[log.actorType] = (byActorType[log.actorType] || 0) + 1;

      // Count by entity type
      if (log.entityType) {
        byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;
      }

      // Count by day
      const dateStr = log.createdAt.toISOString().split('T')[0];
      dailyCountsMap[dateStr] = (dailyCountsMap[dateStr] || 0) + 1;
    });

    const dailyCounts = Object.entries(dailyCountsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalLogs: logs.length,
      byAction,
      byActorType,
      byEntityType,
      dailyCounts,
    };
  }

  /**
   * Export audit logs to CSV format
   */
  async exportAuditLogs(
    options: Omit<AuditQueryOptions, 'page' | 'limit'>,
  ): Promise<string> {
    const { data } = await this.queryAuditLogs({
      ...options,
      page: 1,
      limit: 10000, // Maximum export limit
    });

    const headers = [
      'Timestamp',
      'Action',
      'Actor Type',
      'Actor User ID',
      'Actor Email',
      'Entity Type',
      'Entity ID',
      'IP Address',
      'User Agent',
      'Request ID',
      'Endpoint',
      'Method',
      'Status Code',
    ];

    const rows = data.map(log => [
      log.createdAt.toISOString(),
      log.action,
      log.actorType,
      log.actorUserId || '',
      log.actorUser?.email || '',
      log.entityType || '',
      log.entityId || '',
      log.ip || '',
      log.userAgent || '',
      log.requestId || '',
      log.endpoint || '',
      log.method || '',
      log.statusCode || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} audit logs older than ${retentionDays} days`);
    return result.count;
  }

  /**
   * Log system event (no user actor)
   */
  async logSystemEvent(
    action: AuditAction,
    entityType?: string,
    entityId?: string,
    metadata?: any,
  ): Promise<string> {
    return this.log({
      actorType: 'SYSTEM',
      action,
      entityType,
      entityId,
      metadata,
    });
  }

  /**
   * Log API request for monitoring
   */
  async logApiRequest(
    requestId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    userId?: string,
    ip?: string,
    userAgent?: string,
    durationMs?: number,
  ): Promise<string> {
    return this.log({
      actorUserId: userId,
      actorType: userId ? 'USER' : 'API',
      action: AuditAction.API_REQUEST,
      entityType: 'API',
      entityId: requestId,
      ip,
      userAgent,
      requestId,
      endpoint,
      method,
      statusCode,
      metadata: {
        durationMs,
        timestamp: new Date().toISOString(),
      },
    });
  }
}