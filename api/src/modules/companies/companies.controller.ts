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
import { CompaniesService } from './companies.service';
import {
  CompanyListQueryDto,
  CreateCompanyDto,
  UpdateCompanyDto,
} from './dto/company.dto';

@ApiTags('Companies')
@ApiBearerAuth('access-token')
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Post()
  @Permissions('companies.write')
  @ApiOperation({ summary: 'Create company' })
  @ApiBody({
    type: CreateCompanyDto,
    examples: {
      sample: {
        value: { name: 'Generic Sanitary Co.', code: 'GSC' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'd4e5f6a7-b8c9-0123-def0-456789abcdef',
        name: 'Generic Sanitary Co.',
        code: 'GSC',
      },
    },
  })
  async create(
    @Body() dto: CreateCompanyDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.companies.create(dto, user, ip, userAgent);
  }

  @Get()
  @Permissions('companies.read')
  @ApiOperation({ summary: 'List companies (paginated)' })
  async list(@Query() query: CompanyListQueryDto) {
    return await this.companies.findAll(query);
  }

  @Get(':id')
  @Permissions('companies.read')
  @ApiOperation({ summary: 'Get company' })
  async get(@Param('id') id: string) {
    return await this.companies.findOne(id);
  }

  @Patch(':id')
  @Permissions('companies.write')
  @ApiOperation({ summary: 'Update company' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.companies.update(id, dto, user, ip, userAgent);
  }

  @Delete(':id')
  @Permissions('companies.write')
  @ApiOperation({ summary: 'Soft-delete company' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.companies.remove(id, user, ip, userAgent);
  }
}
