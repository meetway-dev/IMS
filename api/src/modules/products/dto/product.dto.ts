import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
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

  @ApiProperty({
    description: 'Product type ID (references ProductType table)',
    example: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
  })
  @IsUUID()
  typeId!: string;

  @ApiProperty({
    description: 'Unit of measure ID (references UnitOfMeasure table)',
    example: 'b2c3d4e5-f6a7-8901-bcde-234567890123',
  })
  @IsUUID()
  unitId!: string;

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
  @MinLength(1)
  @MaxLength(128)
  sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  barcode?: string;

  @ApiPropertyOptional({ description: 'Product type ID' })
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional({ description: 'Unit of measure ID' })
  @IsOptional()
  @IsUUID()
  unitId?: string;

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
