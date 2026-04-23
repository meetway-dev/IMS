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
import { UnitOfMeasuresService } from './unit-of-measures.service';
import {
  UnitOfMeasureListQueryDto,
  CreateUnitOfMeasureDto,
  UpdateUnitOfMeasureDto,
} from './dto/unit-of-measure.dto';

@ApiTags('Units of Measure')
@ApiBearerAuth('access-token')
@Controller({ path: 'unit-of-measures', version: '1' })
export class UnitOfMeasuresController {
  constructor(private readonly unitOfMeasures: UnitOfMeasuresService) {}

  @Post()
  @Permissions('products.write')
  @ApiOperation({ summary: 'Create unit of measure' })
  @ApiBody({
    type: CreateUnitOfMeasureDto,
    examples: {
      basic: {
        summary: 'Basic unit',
        value: { name: 'Piece', slug: 'piece', symbol: 'pcs' },
      },
      withDescription: {
        summary: 'With description',
        value: {
          name: 'Meter',
          slug: 'meter',
          symbol: 'm',
          description: 'Length in meters',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'a1b2c3d4-e5f6-7890-abcd-123456789012',
        name: 'Piece',
        slug: 'piece',
        symbol: 'pcs',
        description: null,
        isActive: true,
      },
    },
  })
  async create(
    @Body() dto: CreateUnitOfMeasureDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.unitOfMeasures.create(dto, user, ip, userAgent);
  }

  @Get()
  @Permissions('products.read')
  @ApiOperation({ summary: 'List units of measure (paginated)' })
  async list(@Query() query: UnitOfMeasureListQueryDto) {
    return await this.unitOfMeasures.findAll(query);
  }

  @Get('active')
  @Permissions('products.read')
  @ApiOperation({
    summary: 'List all active units of measure (for dropdowns)',
  })
  async listActive() {
    return await this.unitOfMeasures.findAllActive();
  }

  @Get(':id')
  @Permissions('products.read')
  @ApiOperation({ summary: 'Get unit of measure by id' })
  async get(@Param('id') id: string) {
    return await this.unitOfMeasures.findOne(id);
  }

  @Patch(':id')
  @Permissions('products.write')
  @ApiOperation({ summary: 'Update unit of measure' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUnitOfMeasureDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.unitOfMeasures.update(id, dto, user, ip, userAgent);
  }

  @Delete(':id')
  @Permissions('products.write')
  @ApiOperation({ summary: 'Soft-delete unit of measure' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.unitOfMeasures.remove(id, user, ip, userAgent);
  }
}
