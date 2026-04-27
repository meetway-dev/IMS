/**
 * Pagination DTO and helpers.
 *
 * All list endpoints accept `PaginationQueryDto` as their query
 * parameter class. The `buildPaginatedResult` helper constructs the
 * response envelope consumed by the frontend.
 *
 * @module pagination.dto
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Default rows per page when the caller does not specify `limit`. */
export const DEFAULT_PAGE_SIZE = 20;

/** Hard ceiling for `limit` to prevent unbounded queries. */
export const MAX_PAGE_SIZE = 100;

/** Allowed page-size options (for UI dropdowns). */
export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;

// ---------------------------------------------------------------------------
// DTO
// ---------------------------------------------------------------------------

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    default: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number = DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'name',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc',
    required: false,
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Compute pagination metadata from raw counts. */
export function paginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginatedMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/** Wrap data + counts into the standard paginated response shape. */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    data,
    meta: paginationMeta(total, page, limit),
  };
}
