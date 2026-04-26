/**
 * Decimal conversion helpers.
 *
 * Prisma returns `Decimal` objects for numeric(p,s) columns.
 * These helpers convert them to plain JS primitives for JSON
 * serialisation.
 *
 * @module decimal
 */

import { Prisma } from '@prisma/client';

/** Convert a Prisma Decimal (or string/number) to a `Prisma.Decimal`. */
export function toDecimal(
  value: string | number | Prisma.Decimal,
): Prisma.Decimal {
  return new Prisma.Decimal(value.toString());
}

/** Safely convert a Decimal-like value to its string representation. */
export function decToString(
  d: { toString(): string } | null | undefined,
): string | null {
  if (d == null) return null;
  return d.toString();
}

/** Safely convert a Decimal-like value to a `number`. */
export function decToNumber(
  d: { toString(): string } | null | undefined,
): number | null {
  if (d == null) return null;
  return Number(d.toString());
}
