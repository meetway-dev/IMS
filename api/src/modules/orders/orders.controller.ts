import {
  Body,
  Controller,
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
import { CreateOrderDto, OrderListQueryDto } from './dto/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @Permissions('orders.write')
  @ApiOperation({
    summary:
      'Create order (DRAFT by default). CONFIRMED deducts stock immediately.',
  })
  @ApiBody({
    type: CreateOrderDto,
    examples: {
      draft: {
        summary: 'Draft POS order',
        value: {
          notes: 'Walk-in',
          items: [
            { productId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', quantity: 2 },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'e5f6a7b8-c9d0-1234-ef01-567890abcdef',
        orderNumber: 'ORD-m5x2-1a2b3c',
        status: 'DRAFT',
        subtotal: '150',
        total: '150',
      },
    },
  })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.orders.create(dto, user, ip, userAgent);
  }

  @Get()
  @Permissions('orders.read')
  @ApiOperation({ summary: 'List orders (paginated)' })
  async list(@Query() query: OrderListQueryDto) {
    return await this.orders.findAll(query);
  }

  @Get(':id')
  @Permissions('orders.read')
  @ApiOperation({ summary: 'Get order' })
  async get(@Param('id') id: string) {
    return await this.orders.findOne(id);
  }

  @Patch(':id/confirm')
  @Permissions('orders.write')
  @ApiOperation({ summary: 'Confirm DRAFT order (deducts inventory)' })
  async confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.orders.confirm(id, user, ip, userAgent);
  }

  @Patch(':id/pay')
  @Permissions('orders.write')
  @ApiOperation({ summary: 'Mark CONFIRMED order as PAID' })
  async pay(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.orders.pay(id, user, ip, userAgent);
  }

  @Patch(':id/cancel')
  @Permissions('orders.write')
  @ApiOperation({
    summary: 'Cancel order (restores stock if it was confirmed/paid)',
  })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.orders.cancel(id, user, ip, userAgent);
  }
}
