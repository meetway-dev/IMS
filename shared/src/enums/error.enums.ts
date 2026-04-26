/**
 * Standardised error codes and messages.
 *
 * Backend error filters map exceptions to these codes; the frontend
 * error handler uses them for user-facing messages.
 *
 * @module error.enums
 */

// ---------------------------------------------------------------------------
// Application-level error codes
// ---------------------------------------------------------------------------

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

/** Default human-readable message for each error code. */
export const ERROR_MESSAGES: Readonly<Record<ErrorCode, string>> = {
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',
  [ErrorCode.NOT_FOUND]: 'Resource not found',
  [ErrorCode.CONFLICT]: 'Resource already exists',
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access',
  [ErrorCode.FORBIDDEN]: 'Access forbidden',
  [ErrorCode.INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.BAD_REQUEST]: 'Bad request',
};

// ---------------------------------------------------------------------------
// Prisma-specific error codes (P-series)
// ---------------------------------------------------------------------------

export enum PrismaErrorCode {
  UNIQUE_CONSTRAINT = 'P2002',
  RECORD_NOT_FOUND = 'P2025',
  FOREIGN_KEY_CONSTRAINT = 'P2003',
  QUERY_INTERPRETATION_ERROR = 'P2005',
}

/** User-friendly descriptions of common Prisma errors. */
export const PRISMA_ERROR_MESSAGES: Readonly<Record<PrismaErrorCode, string>> = {
  [PrismaErrorCode.UNIQUE_CONSTRAINT]: 'A record with this value already exists',
  [PrismaErrorCode.RECORD_NOT_FOUND]: 'Record not found',
  [PrismaErrorCode.FOREIGN_KEY_CONSTRAINT]: 'Related record not found',
  [PrismaErrorCode.QUERY_INTERPRETATION_ERROR]: 'Invalid query parameters',
};
