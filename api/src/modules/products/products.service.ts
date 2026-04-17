import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, AuditAction } from '@prisma/client';
import { paginationMeta } from '../../common/dto/pagination.dto';
import { decToString } from '../../common/utils/decimal';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateProductDto, UpdateProductDto } from './dto/product.dto';

const productInclude = {
  category: true,
  company: true,
  inventory: true,
  variants: { where: { deletedAt: null }, include: { inventory: true } },
} as const;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private async requireProduct(id: string): Promise<ProductRow> {
    const row = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
    if (!row) throw new NotFoundException('Product not found');
    return row;
  }

  async create(dto: CreateProductDto, actorUserId?: string) {
    if (dto.categoryId) {
      const c = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, deletedAt: null },
      });
      if (!c) throw new BadRequestException('Category not found');
    }
    if (dto.companyId) {
      const c = await this.prisma.company.findFirst({
        where: { id: dto.companyId, deletedAt: null },
      });
      if (!c) throw new BadRequestException('Company not found');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: dto.name,
            sku: dto.sku,
            barcode: dto.barcode,
            type: dto.type,
            unit: dto.unit,
            purchasePrice: new Prisma.Decimal(dto.purchasePrice),
            salePrice: new Prisma.Decimal(dto.salePrice),
            minStockAlert: dto.minStockAlert ?? 0,
            categoryId: dto.categoryId,
            companyId: dto.companyId,
          },
        });

        if (dto.variants?.length) {
          for (const v of dto.variants) {
            const variant = await tx.productVariant.create({
              data: {
                productId: product.id,
                size: v.size,
                color: v.color,
                material: v.material,
                sku: v.sku,
                barcode: v.barcode,
              },
            });
            await tx.inventoryItem.create({
              data: { variantId: variant.id, stockQuantity: 0 },
            });
          }
        } else {
          await tx.inventoryItem.create({
            data: { productId: product.id, stockQuantity: 0 },
          });
        }

        return tx.product.findUniqueOrThrow({
          where: { id: product.id },
          include: productInclude,
        });
      });

      await this.audit.log({
        actorUserId,
        action: AuditAction.PRODUCT_CREATED,
        entityType: 'Product',
        entityId: result.id,
        metadata: { sku: result.sku },
      });

      return this.serializeProduct(result);
    } catch (e: unknown) {
      if (this.isUniqueViolation(e)) {
        throw new ConflictException('SKU or barcode already exists');
      }
      throw e;
    }
  }

  async findPage(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: productInclude,
      }),
    ]);
    return {
      data: rows.map((p) => this.serializeProduct(p)),
      meta: paginationMeta(total, page, limit),
    };
  }

  async findOne(id: string) {
    const row = await this.requireProduct(id);
    return this.serializeProduct(row);
  }

  async update(id: string, dto: UpdateProductDto, actorUserId?: string) {
    await this.requireProduct(id);
    if (dto.categoryId) {
      const c = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, deletedAt: null },
      });
      if (!c) throw new BadRequestException('Category not found');
    }
    if (dto.companyId) {
      const c = await this.prisma.company.findFirst({
        where: { id: dto.companyId, deletedAt: null },
      });
      if (!c) throw new BadRequestException('Company not found');
    }

    try {
      const row = await this.prisma.product.update({
        where: { id },
        data: {
          ...(dto.name != null ? { name: dto.name } : {}),
          ...(dto.barcode !== undefined ? { barcode: dto.barcode } : {}),
          ...(dto.type != null ? { type: dto.type } : {}),
          ...(dto.unit != null ? { unit: dto.unit } : {}),
          ...(dto.purchasePrice != null
            ? { purchasePrice: new Prisma.Decimal(dto.purchasePrice) }
            : {}),
          ...(dto.salePrice != null
            ? { salePrice: new Prisma.Decimal(dto.salePrice) }
            : {}),
          ...(dto.minStockAlert != null
            ? { minStockAlert: dto.minStockAlert }
            : {}),
          ...(dto.categoryId !== undefined
            ? { categoryId: dto.categoryId }
            : {}),
          ...(dto.companyId !== undefined ? { companyId: dto.companyId } : {}),
        },
        include: productInclude,
      });
      await this.audit.log({
        actorUserId,
        action: AuditAction.PRODUCT_UPDATED,
        entityType: 'Product',
        entityId: id,
        metadata: { fields: Object.keys(dto) } as Prisma.InputJsonValue,
      });
      return this.serializeProduct(row);
    } catch (e: unknown) {
      if (this.isUniqueViolation(e)) {
        throw new ConflictException('SKU or barcode already exists');
      }
      throw e;
    }
  }

  async remove(id: string, actorUserId?: string) {
    await this.requireProduct(id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      actorUserId,
      action: AuditAction.PRODUCT_DELETED,
      entityType: 'Product',
      entityId: id,
    });
    return { ok: true as const };
  }

  private serializeProduct(p: ProductRow) {
    return {
      ...p,
      purchasePrice: decToString(p.purchasePrice),
      salePrice: decToString(p.salePrice),
    };
  }

  private isUniqueViolation(e: unknown): boolean {
    return (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as { code: string }).code === 'P2002'
    );
  }
}
