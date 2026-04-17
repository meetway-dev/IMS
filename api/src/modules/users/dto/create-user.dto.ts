import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  IsEnum,
} from 'class-validator';
import { UserStatus } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ description: 'User full name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    enum: UserStatus,
    description: 'User account status',
    default: UserStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus = UserStatus.ACTIVE;

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
    description: 'Whether to skip email verification',
    default: false,
  })
  @IsOptional()
  skipEmailVerification?: boolean = false;
}
