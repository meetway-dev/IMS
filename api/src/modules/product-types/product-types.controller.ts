import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../types/express';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { ProductTypesService } from './product-types.service';
import {
  ProductTypeListQueryDto,
  CreateProductTypeDto,
  UpdateProductTypeDto,
} from './dto/product-type.dto';

@ApiTags('Product Types')
@ApiBearerAuth('access-token')
@Controller({ path: 'product-types', version: '1' })
export class ProductTypesController {
  constructor(private readonly productTypes: ProductTypesService) {}

  @Post()
  @Permissions('products.write')
  @ApiOperation({ summary: 'Create product type' })
  @ApiBody({
    type: CreateProductTypeDto,
    examples: {
      basic: {
        summary: 'Basic product type',
        value: { name: 'Sanitary', slug: 'sanitary' },
      },
      withDescription: {
        summary: 'With description',
        value: {
          name: 'Electrical',
          slug: 'electrical',
          description: 'Electrical products and components',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
        name: 'Sanitary',
        slug: 'sanitary',
        description: null,
        isActive: true,
      },
    },
  })
  async create(
    @Body() dto: CreateProductTypeDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.productTypes.create(dto, user, ip, userAgent);
  }

  @Get()
  @Permissions('products.read')
  @ApiOperation({ summary: 'List product types (paginated)' })
  async list(@Query() query: ProductTypeListQueryDto) {
    return await this.productTypes.findAll(query);
  }

  @Get('active')
  @Permissions('products.read')
  @ApiOperation({ summary: 'List all active product types (for dropdowns)' })
  async listActive() {
    return await this.productTypes.findAllActive();
  }

  @Get(':id')
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get product type by id' })
  async get(@Param('id') id: string) {
    return await this.productTypes.findOne(id);
  }

  @Patch(':id')
  @Permissions('products.write')
  @ApiOperation({ summary: 'Update product type' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductTypeDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.productTypes.update(id, dto, user, ip, userAgent);
  }

  @Delete(':id')
  @Permissions('products.write')
  @ApiOperation({ summary: 'Soft-delete product type' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.productTypes.remove(id, user, ip, userAgent);
  }
}
