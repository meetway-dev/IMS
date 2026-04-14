import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export class ErrorHandler {
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

  static getUniqueConstraintField(
    error: Prisma.PrismaClientKnownRequestError,
    uniqueConstraints: Record<string, string>,
  ): string {
    const target = error.meta?.target as string;
    return uniqueConstraints[target] || 'field';
  }
}
