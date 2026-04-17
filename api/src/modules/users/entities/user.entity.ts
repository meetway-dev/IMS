import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  @ApiProperty({ description: 'User ID (UUID)' })
  id!: string;

  @ApiProperty({ description: 'User email address' })
  email!: string;

  @Exclude()
  passwordHash?: string;

  @Exclude()
  googleSubject?: string;

  @ApiProperty({ description: 'User full name', required: false })
  name?: string;

  @ApiProperty({ enum: UserStatus, description: 'User account status' })
  status!: UserStatus;

  @ApiProperty({ description: 'Whether email is verified' })
  isEmailVerified!: boolean;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Soft delete timestamp', required: false })
  deletedAt?: Date;

  @ApiProperty({ description: 'User roles', type: [String] })
  roles!: string[];

  @ApiProperty({ description: 'User direct permissions', type: [String] })
  permissions!: string[];

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
