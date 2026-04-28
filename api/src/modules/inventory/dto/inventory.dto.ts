import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockMovementType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  IsPositive,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class AdjustStockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  stockLevelId!: string;

  @ApiProperty({
    example: -2,
    description: 'Negative reduces stock; positive increases',
  })
  @Type(() => Number)
  @IsInt()
  quantityDelta!: number;

  @ApiPropertyOptional({
    enum: StockMovementType,
    default: StockMovementType.ADJUSTMENT,
  })
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;

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

export class CreateStockMovementDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  stockLevelId!: string;

  @ApiProperty({ enum: StockMovementType })
  @IsEnum(StockMovementType)
  type!: StockMovementType;

  @ApiProperty({ example: 10, description: 'Positive quantity for IN, negative for OUT' })
  @Type(() => Number)
  @IsInt()
  quantity!: number;

  @ApiPropertyOptional({ example: 'ORDER', description: 'Reference type: ORDER, PURCHASE_ORDER, ADJUSTMENT, TRANSFER' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenceType?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  referenceId?: string;

  @ApiPropertyOptional({ example: 'Received from supplier' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}

export class StockMovementListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  stockLevelId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ enum: StockMovementType })
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class LowStockQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ example: 10, description: 'Threshold percentage (default: below minQuantity)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  threshold?: number;
}

export class StockLevelQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({ example: 'low', description: 'Filter by stock level: low, out, normal' })
  @IsOptional()
  @IsString()
  filter?: string;
}

export class TransferStockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fromStockLevelId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  toStockLevelId!: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quantity!: number;

  @ApiPropertyOptional({ example: 'Transfer between warehouses' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
