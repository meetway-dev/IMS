import {
  Body,
  Controller,
  Get,
  Ip,
  Param,
  ParseUUIDPipe,
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
import { AdjustStockDto, TransactionListQueryDto } from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@Controller({ path: 'inventory', version: '1' })
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Post('adjustments')
  @Permissions('inventory.write')
  @ApiOperation({ summary: 'Apply stock adjustment (creates transaction row)' })
  @ApiBody({
    type: AdjustStockDto,
    examples: {
      adjustment: {
        summary: 'Manual adjustment',
        value: {
          inventoryItemId: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
          quantityDelta: -3,
          type: 'ADJUSTMENT',
          note: 'Damaged',
        },
      },
      purchase: {
        summary: 'Receive stock (purchase)',
        value: {
          inventoryItemId: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
          quantityDelta: 50,
          type: 'PURCHASE',
          reference: 'PO-1001',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        item: { id: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210', stockQuantity: 97 },
        transaction: {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          type: 'ADJUSTMENT',
          quantityDelta: -3,
        },
      },
    },
  })
  async adjust(
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.inventory.adjust(dto, user, ip, userAgent);
  }

  @Get('transactions')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Inventory transaction history (paginated)' })
  async transactions(@Query() query: TransactionListQueryDto) {
    return await this.inventory.listTransactions(query);
  }

  @Get('alerts/low-stock')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Products/variants below min stock threshold' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        data: [
          {
            inventoryItemId: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
            stockQuantity: 5,
            minStockAlert: 20,
            productId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            variantId: null,
            sku: 'PVC-PIPE-001',
            name: 'PVC Pipe',
          },
        ],
      },
    },
  })
  async lowStock() {
    return await this.inventory.minStockAlerts();
  }

  @Get('items')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'List inventory items (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'variantId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated inventory items',
  })
  async listItems(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('productId') productId?: string,
    @Query('variantId') variantId?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return await this.inventory.findAllItems(
      pageNum,
      limitNum,
      productId,
      variantId,
      search,
    );
  }

  @Get('items/:id')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Inventory item details',
  })
  async getItem(@Param('id', ParseUUIDPipe) id: string) {
    return await this.inventory.findOneItem(id);
  }
}
