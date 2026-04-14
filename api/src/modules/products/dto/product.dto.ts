import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType, UnitOfMeasure } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateVariantDto {
  @ApiPropertyOptional({ example: '50mm' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  size?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  material?: string;

  @ApiPropertyOptional({ example: 'PVC-PIPE-001-50' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  barcode?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'PVC Pipe' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'PVC-PIPE-001' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  sku!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  barcode?: string;

  @ApiProperty({ enum: ProductType, example: ProductType.SANITARY })
  @IsEnum(ProductType)
  type!: ProductType;

  @ApiProperty({ enum: UnitOfMeasure, example: UnitOfMeasure.METER })
  @IsEnum(UnitOfMeasure)
  unit!: UnitOfMeasure;

  @ApiProperty({ example: '50.00' })
  @IsString()
  purchasePrice!: string;

  @ApiProperty({ example: '75.00' })
  @IsString()
  salePrice!: string;

  @ApiPropertyOptional({ example: 20, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStockAlert?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional({ type: [CreateVariantDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  barcode?: string;

  @ApiPropertyOptional({ enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional({ enum: UnitOfMeasure })
  @IsOptional()
  @IsEnum(UnitOfMeasure)
  unit?: UnitOfMeasure;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  purchasePrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salePrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  minStockAlert?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  companyId?: string | null;
}
