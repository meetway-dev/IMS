import { Body, Controller, Get, Ip, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../types/express';
import { LoginDto, RefreshDto, SignupDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Signup with email/password' })
  @ApiResponse({
    status: 201,
    description: 'User created',
    schema: {
      example: {
        id: 'b3d1d2f2-4c6b-4a9f-9f8f-1f75a6c6f2a1',
        email: 'admin@ims.local',
        name: 'IMS Admin',
        createdAt: '2026-04-14T00:00:00.000Z',
      },
    },
  })
  async signup(@Body() dto: SignupDto) {
    return await this.auth.signup(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and receive access/refresh token pair' })
  @ApiResponse({
    status: 201,
    description: 'Token pair',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        tokenType: 'Bearer',
        expiresIn: 900,
        refreshTokenId: '2a2f0b3d-7a73-4e7b-9c6a-6b0c5b3f7a11',
        sessionId: '3c7d2e7b-8d4d-4e41-9bb6-8f1b6f8c2a3a',
      },
    },
  })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Ip() ip: string) {
    const userAgent = req.headers['user-agent'];
    return await this.auth.login({ ...dto, userAgent, ip });
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and get new token pair' })
  async refresh(@Body() dto: RefreshDto, @Req() req: Request, @Ip() ip: string) {
    const userAgent = req.headers['user-agent'];
    return await this.auth.refresh({ refreshToken: dto.refreshToken, userAgent, ip });
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Invalidate refresh token (logout)' })
  async logout(@Body() dto: RefreshDto) {
    await this.auth.logout({ refreshToken: dto.refreshToken });
    return { ok: true };
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Current user profile and role names' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 'b3d1d2f2-4c6b-4a9f-9f8f-1f75a6c6f2a1',
        email: 'admin@ims.local',
        name: 'IMS Admin',
        status: 'ACTIVE',
        roles: ['Admin'],
      },
    },
  })
  async me(@CurrentUser() user: AuthUser) {
    return await this.auth.getProfile(user.id);
  }
}
