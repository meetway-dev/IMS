import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import crypto from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

type JwtAccessPayload = { sub: string; email: string };
type JwtRefreshPayload = { sub: string; sid: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(input: { email: string; password: string; name?: string }) {
    const passwordHash = await argon2.hash(input.password);

    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        isEmailVerified: false,
        status: 'ACTIVE',
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return user;
  }

  async login(input: {
    email: string;
    password: string;
    userAgent?: string;
    ip?: string;
  }) {
    const user = await this.prisma.user.findFirst({
      where: { email: input.email.toLowerCase(), deletedAt: null },
    });
    if (!user?.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await argon2.verify(user.passwordHash, input.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokenPair({
      userId: user.id,
      email: user.email,
      userAgent: input.userAgent,
      ip: input.ip,
    });
  }

  async refresh(input: {
    refreshToken: string;
    userAgent?: string;
    ip?: string;
  }) {
    const decoded = await this.verifyRefreshToken(input.refreshToken);

    const tokenRow = await this.prisma.refreshToken.findUnique({
      where: { id: decoded.jti },
      include: { user: true },
    });
    if (!tokenRow || tokenRow.revokedAt)
      throw new UnauthorizedException('Refresh token revoked');
    if (tokenRow.expiresAt.getTime() <= Date.now())
      throw new UnauthorizedException('Refresh token expired');

    const isValid = await argon2.verify(tokenRow.tokenHash, input.refreshToken);
    if (!isValid) {
      // Token reuse / theft: revoke the entire session
      await this.prisma.refreshToken.updateMany({
        where: {
          userId: tokenRow.userId,
          sessionId: tokenRow.sessionId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    // Rotation: revoke old, issue new
    const newPair = await this.issueTokenPair({
      userId: tokenRow.userId,
      email: tokenRow.user.email,
      userAgent: input.userAgent,
      ip: input.ip,
      sessionId: tokenRow.sessionId,
      replaceTokenId: tokenRow.id,
    });

    await this.prisma.refreshToken.update({
      where: { id: tokenRow.id },
      data: { revokedAt: new Date(), replacedById: newPair.refreshTokenId },
    });

    return newPair;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        isEmailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        roles: {
          include: {
            role: { select: { id: true, name: true, description: true } },
          },
        },
      },
    });
    if (!user) throw new UnauthorizedException();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roles: user.roles.map((ur) => ur.role.name),
    };
  }

  async logout(input: { refreshToken: string }) {
    const decoded = await this.verifyRefreshToken(input.refreshToken);
    const tokenRow = await this.prisma.refreshToken.findUnique({
      where: { id: decoded.jti },
    });
    if (!tokenRow) return;
    await this.prisma.refreshToken.update({
      where: { id: tokenRow.id },
      data: { revokedAt: new Date() },
    });
  }

  private accessTtlSeconds(): number {
    return Number(this.config.get('JWT_ACCESS_TTL_SECONDS') ?? 900);
  }

  private refreshTtlDays(): number {
    return Number(this.config.get('JWT_REFRESH_TTL_DAYS') ?? 30);
  }

  private accessSecret(): string {
    return String(this.config.get('JWT_ACCESS_SECRET'));
  }

  private refreshSecret(): string {
    return String(this.config.get('JWT_REFRESH_SECRET'));
  }

  private async issueTokenPair(input: {
    userId: string;
    email: string;
    userAgent?: string;
    ip?: string;
    sessionId?: string;
    replaceTokenId?: string;
  }) {
    const sessionId = input.sessionId ?? crypto.randomUUID();

    const accessPayload: JwtAccessPayload = {
      sub: input.userId,
      email: input.email,
    };
    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.accessSecret(),
      expiresIn: this.accessTtlSeconds(),
    });

    const refreshTokenId = crypto.randomUUID();
    const refreshPayload: JwtRefreshPayload = {
      sub: input.userId,
      sid: sessionId,
    };
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.refreshSecret(),
      expiresIn: `${this.refreshTtlDays()}d`,
      jwtid: refreshTokenId,
    });

    const tokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date(
      Date.now() + this.refreshTtlDays() * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId: input.userId,
        tokenHash,
        sessionId,
        userAgent: input.userAgent,
        ip: input.ip,
        expiresAt,
        replacedById: input.replaceTokenId ? null : null,
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer' as const,
      expiresIn: this.accessTtlSeconds(),
      refreshTokenId,
      sessionId,
    };
  }

  private async verifyRefreshToken(
    token: string,
  ): Promise<{ sub: string; sid: string; jti: string }> {
    try {
      const payload = await this.jwt.verifyAsync<
        JwtRefreshPayload & { jti: string }
      >(token, {
        secret: this.refreshSecret(),
      });
      if (!payload?.sub || !payload?.sid || !payload?.jti)
        throw new Error('Invalid payload');
      return { sub: payload.sub, sid: payload.sid, jti: payload.jti };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
