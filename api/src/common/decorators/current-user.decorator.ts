import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../../types/express';

/**
 * Extract the authenticated user from the request object.
 *
 * @example
 * ```ts
 * @Get('me')
 * getProfile(@CurrentUser() user: AuthUser) { ... }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    return request.user;
  },
);
