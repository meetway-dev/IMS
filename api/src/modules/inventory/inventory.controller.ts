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
import {
  AdjustStockDto,
  StockMovementListQueryDto,
  LowStockQueryDto,
  StockLevelQueryDto
} from './dto/inventory.dto';
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
    return await this.inventory.adjustStockLevel(dto, user, ip, userAgent);
  }

  @Get('movements')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Stock movement history (paginated)' })
  async movements(@Query() query: StockMovementListQueryDto) {
    return await this.inventory.listStockMovements(query);
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
            stockLevelId: 'f1e2d3c4-b5a6-7890-fedc-ba9876543210',
            quantity: 5,
            minQuantity: 20,
            productId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            variantId: null,
            sku: 'PVC-PIPE-001',
            name: 'PVC Pipe',
            alertSeverity: 'HIGH',
          },
        ],
      },
    },
  })
  async lowStock(@Query() query: LowStockQueryDto) {
    return await this.inventory.getLowStockAlerts(query);
  }

  @Get('levels')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'List stock levels (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Paginated stock levels',
  })
  async listLevels(@Query() query: StockLevelQueryDto) {
    return await this.inventory.listStockLevels(query);
  }

  @Get('levels/:id')
  @Permissions('inventory.read')
  @ApiOperation({ summary: 'Get stock level by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Stock level details',
  })
  async getLevel(@Param('id', ParseUUIDPipe) id: string) {
    return await this.inventory.getStockLevel(id);
  }
}
