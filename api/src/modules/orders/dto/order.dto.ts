import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class OrderLineInputDto {
  @ApiPropertyOptional({
    description: 'Exactly one of productId or variantId required',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({
    description: 'Defaults to product/variant sale price',
  })
  @IsOptional()
  @IsString()
  unitPrice?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'DRAFT (default) or CONFIRMED (stock moves immediately)',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ type: [OrderLineInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineInputDto)
  items!: OrderLineInputDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: '0' })
  @IsOptional()
  @IsString()
  discountTotal?: string;

  @ApiPropertyOptional({ default: '0' })
  @IsOptional()
  @IsString()
  taxTotal?: string;
}

export class OrderListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Search order number or notes' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
