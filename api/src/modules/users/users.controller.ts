import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../types/express';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.write')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserEntity })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: AuthUser,
  ): Promise<UserEntity> {
    return this.usersService.create(createUserDto, user.id);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, type: [UserEntity] })
  async findAll(@Query() pagination: PaginationQueryDto) {
    const result = await this.usersService.findAll(pagination);
    // Use buildPaginatedResult to add meta field for FE compatibility
    // (imported from ../../common/dto/pagination.dto)
    const { buildPaginatedResult } = await import('../../common/dto/pagination.dto');
    return buildPaginatedResult(result.data, result.total, result.page, result.limit);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserEntity })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.write')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UserEntity })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ): Promise<UserEntity> {
    return this.usersService.update(id, updateUserDto, user.id);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.delete')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiResponse({ status: 200, type: UserEntity })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<UserEntity> {
    return this.usersService.remove(id, user.id);
  }

  @Post(':id/roles')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.write')
  @ApiOperation({ summary: 'Assign roles to user' })
  @ApiResponse({ status: 200 })
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { roleIds: string[] },
  ): Promise<void> {
    await this.usersService.assignRoles(id, body.roleIds);
  }

  @Post(':id/permissions')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Permissions('users.write')
  @ApiOperation({ summary: 'Assign direct permissions to user' })
  @ApiResponse({ status: 200 })
  async assignDirectPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { permissionIds: string[] },
  ): Promise<void> {
    await this.usersService.setDirectPermissions(id, body.permissionIds);
  }
}
