import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
  imports: [AuditModule],
})
export class PermissionsModule {}