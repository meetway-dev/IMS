import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, IsArray } from 'class-validator';

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

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsUUID()
  parentRoleId?: string;
}

export class AssignPermissionsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  permissionIds!: string[];
}

export class CloneRoleDto {
  @IsString()
  name!: string;
}