import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateSupplierDto {
  @ApiProperty({ example: 'ABC Supplies' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'contact@abcsupplies.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St, City' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactPerson?: string;

  @ApiPropertyOptional({ example: 'Primary supplier for electrical items' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactPerson?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class SupplierListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, email, phone, or contact person' })
  @IsString()
  @IsOptional()
  q?: string;
}
