import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  MinLength,
} from 'class-validator';
import { UserStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'User email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'User password', required: false, minLength: 8 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiProperty({ description: 'User full name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: UserStatus,
    description: 'User account status',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({
    description: 'Role IDs to assign to user',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];

  @ApiProperty({
    description: 'Permission IDs to assign directly to user',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}
