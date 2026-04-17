import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { PermissionType, PermissionEffect } from '@prisma/client';

export class CreatePermissionDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PermissionType)
  type?: PermissionType;

  @IsOptional()
  @IsEnum(PermissionEffect)
  effect?: PermissionEffect;

  @IsString()
  module!: string;

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

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}