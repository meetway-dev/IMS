import { Module } from '@nestjs/common';
import { UnitOfMeasuresController } from './unit-of-measures.controller';
import { UnitOfMeasuresService } from './unit-of-measures.service';

@Module({
  controllers: [UnitOfMeasuresController],
  providers: [UnitOfMeasuresService],
  exports: [UnitOfMeasuresService],
})
export class UnitOfMeasuresModule {}
