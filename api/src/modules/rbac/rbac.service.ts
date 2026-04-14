import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { RequestRbac } from './rbac.types';

@Injectable()
export class RbacService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserRbac(userId: string): Promise<RequestRbac> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, status: 'ACTIVE' },
    });
    if (!user) {
      return { roleNames: [], permissionKeys: [] };
    }

    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const roleNames: string[] = [];
    const permissionKeys = new Set<string>();

    for (const ur of rows) {
      const { role } = ur;
      if (role.deletedAt) continue;
      roleNames.push(role.name);
      for (const rp of role.permissions) {
        if (rp.permission.deletedAt) continue;
        permissionKeys.add(rp.permission.key);
      }
    }

    return { roleNames, permissionKeys: [...permissionKeys] };
  }
}
