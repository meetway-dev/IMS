import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, AuditAction } from '@prisma/client';
import { paginationMeta } from '../../common/dto/pagination.dto';
import { decToString } from '../../common/utils/decimal';
import { ErrorHandler } from '../../common/errors/error-handler';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { CreateProductDto, UpdateProductDto } from './dto/product.dto';

const productInclude = {
  type: true,
  unit: true,
  category: true,
  company: true,
  stockLevels: true,
  variants: { where: { deletedAt: null }, include: { stockLevels: true } },
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
    // Validate typeId references an existing ProductType
    const productType = await this.prisma.productType.findFirst({
      where: { id: dto.typeId, deletedAt: null },
    });
    if (!productType) throw new BadRequestException('Product type not found');

    // Validate unitId references an existing UnitOfMeasure
    const unitOfMeasure = await this.prisma.unitOfMeasure.findFirst({
      where: { id: dto.unitId, deletedAt: null },
    });
    if (!unitOfMeasure)
      throw new BadRequestException('Unit of measure not found');

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
            typeId: dto.typeId,
            unitId: dto.unitId,
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
            // TODO: Create stock level for variant - requires warehouseId
            // await tx.stockLevel.create({
            //   data: {
            //     variantId: variant.id,
            //     quantity: 0,
            //     warehouseId: 'TODO', // Need to get default warehouse
            //     minQuantity: 0,
            //     maxQuantity: 1000,
            //   },
            // });
          }
        } else {
          // TODO: Create stock level for product - requires warehouseId
          // await tx.stockLevel.create({
          //   data: {
          //     productId: product.id,
          //     quantity: 0,
          //     warehouseId: 'TODO', // Need to get default warehouse
          //     minQuantity: 0,
          //     maxQuantity: 1000,
          //   },
          // });
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
      if (ErrorHandler.isUniqueViolation(e)) {
        throw new ConflictException('SKU or barcode already exists');
      }
      throw e;
    }
  }

  async findPage(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

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

    if (dto.typeId) {
      const pt = await this.prisma.productType.findFirst({
        where: { id: dto.typeId, deletedAt: null },
      });
      if (!pt) throw new BadRequestException('Product type not found');
    }
    if (dto.unitId) {
      const uom = await this.prisma.unitOfMeasure.findFirst({
        where: { id: dto.unitId, deletedAt: null },
      });
      if (!uom) throw new BadRequestException('Unit of measure not found');
    }
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
          ...(dto.sku !== undefined ? { sku: dto.sku } : {}),
          ...(dto.barcode !== undefined ? { barcode: dto.barcode } : {}),
          ...(dto.typeId != null ? { typeId: dto.typeId } : {}),
          ...(dto.unitId != null ? { unitId: dto.unitId } : {}),
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
      if (ErrorHandler.isUniqueViolation(e)) {
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
}
