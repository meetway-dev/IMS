import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsArray,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsUUID()
  parentRoleId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  permissionIds?: string[];
}
