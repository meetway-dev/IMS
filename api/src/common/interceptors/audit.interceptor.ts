// Audit Interceptor

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly action: string,
    private readonly entityType?: string,
    private readonly extractEntityId?: (result: any, args: any[]) => string | undefined
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const auditService = this.getAuditService(context);
          if (!auditService) return;

          const entityId = this.extractEntityId
            ? this.extractEntityId(result, context.getArgs())
            : undefined;

          await auditService.log({
            actorUserId: user?.id,
            actorType: user ? 'USER' : 'SYSTEM',
            action: this.action,
            entityType: this.entityType,
            entityId,
            ip,
            userAgent,
            metadata: this.extractMetadata(result, context.getArgs()),
          });
        } catch (error) {
          // Don't throw error in audit logging to avoid breaking the main request
          console.error('Audit logging failed:', error);
        }
      })
    );
  }

  private getAuditService(context: ExecutionContext): AuditService | null {
    try {
      const auditService = context.switchToHttp().getRequest().auditService;
      if (auditService) return auditService;

      // Try to get from module
      const moduleRef = context.getClass();
      const reflector = new Reflector();
      // This is a simplified approach - in a real implementation,
      // you'd need proper dependency injection
      return null;
    } catch {
      return null;
    }
  }

  private extractMetadata(result: any, args: any[]): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Extract relevant information from result
    if (result && typeof result === 'object') {
      // Don't include sensitive data
      const { password, token, refreshToken, ...safeResult } = result;
      metadata.result = safeResult;
    }

    // Extract relevant information from arguments
    if (args && args.length > 0) {
      const safeArgs = args.map(arg => {
        if (arg && typeof arg === 'object') {
          const { password, token, refreshToken, ...safeArg } = arg;
          return safeArg;
        }
        return arg;
      });
      metadata.args = safeArgs;
    }

    return metadata;
  }
}