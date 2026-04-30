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
import { GoodsReceiptsService } from './goods-receipts.service';
import {
  GoodsReceiptListQueryDto,
  CreateGoodsReceiptDto,
  UpdateGoodsReceiptDto,
} from './dto/goods-receipt.dto';

@ApiTags('Goods Receipts')
@ApiBearerAuth('access-token')
@Controller({ path: 'goods-receipts', version: '1' })
export class GoodsReceiptsController {
  constructor(private readonly goodsReceipts: GoodsReceiptsService) {}

  @Post()
  @Permissions('goods-receipts.write')
  @ApiOperation({ summary: 'Create goods receipt note' })
  @ApiBody({
    type: CreateGoodsReceiptDto,
    examples: {
      basic: {
        summary: 'Basic goods receipt',
        value: {
          purchaseOrderId: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
          warehouseId: 'b2c3d4e5-f6g7-8901-bcde-234567890123',
          notes: 'Received in good condition',
          items: [
            {
              purchaseOrderItemId: 'c3d4e5f6-g7h8-9012-cdef-345678901234',
              quantityReceived: 10,
              unitPrice: 25.5,
              batchNumber: 'BATCH-001',
              expiryDate: '2025-12-31',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'd4e5f6g7-h8i9-0123-defg-456789012345',
        purchaseOrderId: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
        warehouseId: 'b2c3d4e5-f6g7-8901-bcde-234567890123',
        status: 'DRAFT',
        receiptDate: '2024-01-15T10:30:00.000Z',
        notes: 'Received in good condition',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  async create(
    @Body() dto: CreateGoodsReceiptDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.goodsReceipts.create(dto, user, ip, userAgent);
  }

  @Get()
  @Permissions('goods-receipts.read')
  @ApiOperation({ summary: 'List goods receipt notes (paginated)' })
  async list(@Query() query: GoodsReceiptListQueryDto) {
    return await this.goodsReceipts.findAll(query);
  }

  @Get(':id')
  @Permissions('goods-receipts.read')
  @ApiOperation({ summary: 'Get goods receipt note by id' })
  async get(@Param('id') id: string) {
    return await this.goodsReceipts.findOne(id);
  }

  @Patch(':id')
  @Permissions('goods-receipts.write')
  @ApiOperation({ summary: 'Update goods receipt note' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGoodsReceiptDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.goodsReceipts.update(id, dto, user, ip, userAgent);
  }

  @Delete(':id')
  @Permissions('goods-receipts.delete')
  @ApiOperation({ summary: 'Delete goods receipt note' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.goodsReceipts.remove(id, user, ip, userAgent);
  }

  @Post(':id/complete')
  @Permissions('goods-receipts.write')
  @ApiOperation({ summary: 'Complete goods receipt note' })
  async complete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.goodsReceipts.complete(id, user, ip, userAgent);
  }

  @Post(':id/cancel')
  @Permissions('goods-receipts.write')
  @ApiOperation({ summary: 'Cancel goods receipt note' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.goodsReceipts.cancel(id, user, ip, userAgent);
  }
}