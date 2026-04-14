import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryTransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class AdjustStockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  inventoryItemId!: string;

  @ApiProperty({ example: -2, description: 'Negative reduces stock; positive increases' })
  @Type(() => Number)
  @IsInt()
  quantityDelta!: number;

  @ApiPropertyOptional({ enum: InventoryTransactionType, default: InventoryTransactionType.ADJUSTMENT })
  @IsOptional()
  @IsEnum(InventoryTransactionType)
  type?: InventoryTransactionType;

  @ApiPropertyOptional({ example: 'PO-1001' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  reference?: string;

  @ApiPropertyOptional({ example: 'Damaged goods write-off' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class TransactionListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  inventoryItemId?: string;

  @ApiPropertyOptional({ enum: InventoryTransactionType })
  @IsOptional()
  @IsEnum(InventoryTransactionType)
  type?: InventoryTransactionType;
}
