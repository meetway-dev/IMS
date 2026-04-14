import { Body, Controller, Delete, Get, Ip, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../types/express';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CategoriesService } from './categories.service';
import { CategoryListQueryDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Post()
  @Permissions('categories.write')
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      root: {
        summary: 'Root category',
        value: { name: 'Sanitary', slug: 'sanitary' },
      },
      child: {
        summary: 'Child category',
        value: { name: 'Pipes', parentId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        id: 'c1d2e3f4-a5b6-7890-cdef-123456789abc',
        name: 'Sanitary',
        slug: 'sanitary',
        parentId: null,
      },
    },
  })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.categories.create(dto, user, ip, userAgent);
  }

  @Get()
  @Permissions('categories.read')
  @ApiOperation({ summary: 'List categories (paginated)' })
  async list(@Query() query: CategoryListQueryDto) {
    return await this.categories.findAll(query);
  }

  @Get('tree')
  @Permissions('categories.read')
  @ApiOperation({ summary: 'Nested category tree' })
  @ApiResponse({
    status: 200,
    description: 'Tree of categories with children',
    schema: {
      example: [
        {
          id: 'c1',
          name: 'Sanitary',
          slug: 'sanitary',
          parentId: null,
          children: [{ id: 'c2', name: 'Pipes', slug: 'pipes', parentId: 'c1', children: [] }],
        },
      ],
    },
  })
  async tree() {
    return await this.categories.tree();
  }

  @Get(':id')
  @Permissions('categories.read')
  @ApiOperation({ summary: 'Get category' })
  async get(@Param('id') id: string) {
    return await this.categories.findOne(id);
  }

  @Patch(':id')
  @Permissions('categories.write')
  @ApiOperation({ summary: 'Update category' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.categories.update(id, dto, user, ip, userAgent);
  }

  @Delete(':id')
  @Permissions('categories.write')
  @ApiOperation({ summary: 'Soft-delete category' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'];
    return await this.categories.remove(id, user, ip, userAgent);
  }
}
