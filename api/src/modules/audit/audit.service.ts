import { Injectable } from '@nestjs/common';
import type { AuditActorType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: {
    actorUserId?: string | null;
    actorType?: AuditActorType;
    action: string;
    entityType?: string | null;
    entityId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    metadata?: Prisma.InputJsonValue;
  }) {
    await this.prisma.auditLog.create({
      data: {
        actorType: input.actorType ?? 'USER',
        actorUserId: input.actorUserId ?? undefined,
        action: input.action,
        entityType: input.entityType ?? undefined,
        entityId: input.entityId ?? undefined,
        ip: input.ip ?? undefined,
        userAgent: input.userAgent ?? undefined,
        metadata: input.metadata ?? undefined,
      },
    });
  }
}
