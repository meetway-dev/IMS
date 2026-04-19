import { IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { PermissionType, PermissionEffect } from '@prisma/client';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PermissionType)
  type?: PermissionType;

  @IsOptional()
  @IsEnum(PermissionEffect)
  effect?: PermissionEffect;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;
}
