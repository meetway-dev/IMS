/**
 * Centralised Prisma error handling.
 *
 * Maps Prisma client errors to NestJS HTTP exceptions so that
 * controllers never need to import Prisma-specific types.
 *
 * @module error-handler
 */

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export class ErrorHandler {
  /**
   * Translate a `PrismaClientKnownRequestError` into the appropriate
   * NestJS exception. Always throws -- the return type is `never`.
   */
  static handlePrismaError(error: Prisma.PrismaClientKnownRequestError): never {
    switch (error.code) {
      case 'P2002':
        throw new ConflictException('Record already exists');
      case 'P2025':
        throw new NotFoundException('Record not found');
      case 'P2003':
        throw new BadRequestException('Related record not found');
      default:
        throw new BadRequestException('Database error');
    }
  }

  /**
   * Extract the human-readable field name from a P2002 unique-constraint
   * violation using a caller-supplied constraint-to-label map.
   *
   * @example
   * ```ts
   * const field = ErrorHandler.getUniqueConstraintField(err, {
   *   'Category_slug_parentId_key': 'slug',
   * });
   * ```
   */
  static getUniqueConstraintField(
    error: Prisma.PrismaClientKnownRequestError,
    uniqueConstraints: Record<string, string>,
  ): string {
    const target = error.meta?.target as string;
    return uniqueConstraints[target] || 'field';
  }

  /**
   * Type-guard: returns `true` when `error` is a Prisma P2002
   * unique-constraint violation.
   */
  static isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    );
  }
}
