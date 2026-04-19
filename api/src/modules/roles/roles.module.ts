import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
  imports: [AuditModule],
})
export class RolesModule {}
