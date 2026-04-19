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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { RbacGuard } from '../rbac/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../types/express';

@Controller('permissions')
@UseGuards(RbacGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('permissions.create')
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.permissionsService.create(createPermissionDto, user.id);
  }

  @Get()
  @Permissions('permissions.read')
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.permissionsService.findAll(pagination);
  }

  @Get('module/:module')
  @Permissions('permissions.read')
  findByModule(@Param('module') module: string) {
    return this.permissionsService.findByModule(module);
  }

  @Get(':id')
  @Permissions('permissions.read')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('permissions.update')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.permissionsService.update(id, updatePermissionDto, user.id);
  }

  @Delete(':id')
  @Permissions('permissions.delete')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.permissionsService.remove(id, user.id);
  }
}
