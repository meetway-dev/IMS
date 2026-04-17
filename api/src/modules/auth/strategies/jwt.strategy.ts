import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

type JwtPayload = { sub: string; email: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) throw new UnauthorizedException();

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null, status: 'ACTIVE' },
      include: {
        roles: {
          where: { role: { deletedAt: null } },
          include: {
            role: {
              include: {
                permissions: {
                  where: { permission: { deletedAt: null } },
                  include: { permission: true },
                },
              },
            },
          },
        },
        directPermissions: {
          where: {
            permission: { deletedAt: null },
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          include: {
            permission: true,
          },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!user) throw new UnauthorizedException();

    const roles: string[] = [];
    const permissions = new Set<string>();

    // Add role-based permissions
    for (const ur of user.roles) {
      if (!ur.role) continue;
      roles.push(ur.role.name);
      for (const rp of ur.role.permissions) {
        permissions.add(rp.permission.key);
      }
    }

    // Add direct permissions (override role permissions)
    for (const up of (user as any).directPermissions) {
      permissions.add(up.permission.key);
    }

    // SUPER_ADMIN override: if user has SUPER_ADMIN role, grant all permissions
    if (roles.includes('SUPER_ADMIN')) {
      return {
        id: user.id,
        email: user.email,
        roles,
        permissions: ['*'], // Wildcard for all permissions
      };
    }

    return {
      id: user.id,
      email: user.email,
      roles,
      permissions: [...permissions],
    };
  }
}
