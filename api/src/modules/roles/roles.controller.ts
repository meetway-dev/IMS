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
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { CloneRoleDto } from './dto/clone-role.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../types/express';

@Controller('roles')
@UseGuards(RbacGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('roles.create')
  create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() user: AuthUser) {
    return this.rolesService.create(createRoleDto, user.id);
  }

  @Get()
  @Permissions('roles.read')
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.rolesService.findAll(pagination);
  }

  @Get(':id')
  @Permissions('roles.read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('roles.update')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rolesService.update(id, updateRoleDto, user.id);
  }

  @Delete(':id')
  @Permissions('roles.delete')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.rolesService.remove(id, user.id);
  }

  @Post(':id/permissions')
  @Permissions('roles.update')
  assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rolesService.assignPermissions(
      id,
      assignPermissionsDto.permissionIds,
      user.id,
    );
  }

  @Post(':id/clone')
  @Permissions('roles.create')
  cloneRole(
    @Param('id') id: string,
    @Body() cloneRoleDto: CloneRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rolesService.cloneRole(id, cloneRoleDto.name, user.id);
  }
}