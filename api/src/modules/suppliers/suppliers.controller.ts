import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../types/express';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { SuppliersService } from './suppliers.service';
import { SupplierListQueryDto, CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@ApiTags('Suppliers')
@ApiBearerAuth('access-token')
@Controller({ path: 'suppliers', version: '1' })
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Post()
  @Permissions('suppliers.write')
  @ApiOperation({ summary: 'Create supplier' })
  @ApiBody({
    type: CreateSupplierDto,
    examples: {
      example: {
        summary: 'Create supplier',
        value: {
          name: 'ABC Supplies',
          email: 'contact@abcsupplies.com',
          phone: '+1234567890',
          address: '123 Main St, City',
          contactPerson: 'John Doe',
          notes: 'Primary supplier for electrical items',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
        name: 'ABC Supplies',
        email: 'contact@abcsupplies.com',
        phone: '+1234567890',
        address: '123 Main St, City',
        contactPerson: 'John Doe',
        notes: 'Primary supplier for electrical items',
      },
    },
  })
  async create(
    @Body() dto: CreateSupplierDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.suppliers.create(dto, user, ip, userAgent);
  }

  @Get()
  @Permissions('suppliers.read')
  @ApiOperation({ summary: 'List suppliers (paginated)' })
  async list(@Query() query: SupplierListQueryDto) {
    return await this.suppliers.findAll(query);
  }

  @Get(':id')
  @Permissions('suppliers.read')
  @ApiOperation({ summary: 'Get supplier' })
  async get(@Param('id') id: string) {
    return await this.suppliers.findOne(id);
  }

  @Patch(':id')
  @Permissions('suppliers.write')
  @ApiOperation({ summary: 'Update supplier' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.suppliers.update(id, dto, user, ip, userAgent);
  }

  @Delete(':id')
  @Permissions('suppliers.write')
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Supplier deleted successfully',
      },
    },
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.suppliers.remove(id, user, ip, userAgent);
  }
}
