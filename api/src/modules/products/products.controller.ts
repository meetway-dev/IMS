import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import type { AuthUser } from '../../types/express';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Post()
  @Permissions('products.write')
  @ApiOperation({
    summary: 'Create product (optional variants); creates inventory rows',
  })
  @ApiBody({
    type: CreateProductDto,
    examples: {
      simple: {
        summary: 'Product without variants',
        value: {
          name: 'PVC Pipe',
          sku: 'PVC-PIPE-001',
          type: 'SANITARY',
          unit: 'METER',
          purchasePrice: '50.00',
          salePrice: '75.00',
          minStockAlert: 20,
        },
      },
      withVariants: {
        summary: 'Product with variants',
        value: {
          name: 'Cable',
          sku: 'CAB-001',
          type: 'ELECTRICAL',
          unit: 'METER',
          purchasePrice: '10.00',
          salePrice: '15.00',
          variants: [{ size: '1.5mm', sku: 'CAB-001-15' }],
        },
      },
    },
  })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.products.create(dto, user.id);
  }

  @Get()
  @Permissions('products.read')
  @ApiOperation({ summary: 'List products (paginated)' })
  findAll(@Query() q: PaginationQueryDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    return this.products.findPage(page, limit);
  }

  @Get(':id')
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get product by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.findOne(id);
  }

  @Patch(':id')
  @Permissions('products.write')
  @ApiOperation({ summary: 'Update product' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.products.update(id, dto, user.id);
  }

  @Delete(':id')
  @Permissions('products.write')
  @ApiOperation({ summary: 'Soft-delete product' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.products.remove(id, user.id);
  }
}
