import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../types/express';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { WarehousesService } from './warehouses.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  WarehouseListQueryDto,
} from './dto/warehouse.dto';

@ApiTags('Warehouses')
@ApiBearerAuth('access-token')
@Controller({ path: 'warehouses', version: '1' })
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @Permissions('warehouses.write')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiBody({ type: CreateWarehouseDto })
  @ApiResponse({
    status: 201,
    description: 'Warehouse created successfully',
  })
  async create(
    @Body() dto: CreateWarehouseDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.warehousesService.create(dto, user, ip, userAgent);
  }

  @Get()
  @Permissions('warehouses.read')
  @ApiOperation({ summary: 'List all warehouses (paginated)' })
  @ApiQuery({ type: WarehouseListQueryDto })
  async findAll(@Query() query: WarehouseListQueryDto) {
    return await this.warehousesService.findAll(query);
  }

  @Get(':id')
  @Permissions('warehouses.read')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiParam({ name: 'id', type: String, example: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse details',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.warehousesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('warehouses.write')
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateWarehouseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.warehousesService.update(id, dto, user, ip, userAgent);
  }

  @Delete(':id')
  @Permissions('warehouses.write')
  @ApiOperation({ summary: 'Delete warehouse (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.warehousesService.remove(id, user, ip, userAgent);
  }

  @Post(':id/archive')
  @Permissions('warehouses.write')
  @ApiOperation({ summary: 'Archive warehouse (set inactive)' })
  @ApiParam({ name: 'id', type: String })
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.warehousesService.archive(id, user, ip, userAgent);
  }

  @Get(':id/statistics')
  @Permissions('warehouses.read')
  @ApiOperation({ summary: 'Get warehouse statistics' })
  @ApiParam({ name: 'id', type: String })
  async getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return await this.warehousesService.getStatistics(id);
  }
}