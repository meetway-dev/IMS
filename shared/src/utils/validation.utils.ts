/**
 * Shared validation utilities.
 *
 * These helpers enforce the same rules on both client and server
 * so validation errors stay consistent across the stack.
 *
 * @module validation.utils
 */

import { ValidationError } from '../types/api.types';

// ---------------------------------------------------------------------------
// Regex patterns
// ---------------------------------------------------------------------------

/** RFC 5322-ish email pattern (good enough for UI validation). */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ---------------------------------------------------------------------------
// Password validation
// ---------------------------------------------------------------------------

export interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

export const DEFAULT_PASSWORD_OPTIONS: Readonly<PasswordValidationOptions> = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/** Validate a password against configurable strength rules. */
export function validatePassword(
  password: string,
  options: PasswordValidationOptions = DEFAULT_PASSWORD_OPTIONS,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const minLen = options.minLength ?? 8;

  if (password.length < minLen) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${minLen} characters long`,
    });
  }

  if (options.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    });
  }

  if (options.requireLowercase && !/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    });
  }

  if (options.requireNumbers && !/\d/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
    });
  }

  if (
    options.requireSpecialChars &&
    !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  ) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one special character',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Email validation
// ---------------------------------------------------------------------------

/** Validate an email address and return any errors. */
export function validateEmail(email: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!EMAIL_REGEX.test(email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a `ValidationError[]` to a `{ field: message }` map (first error wins). */
export function mapValidationErrors(
  errors: ValidationError[],
): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const error of errors) {
    if (!mapped[error.field]) {
      mapped[error.field] = error.message;
    }
  }

  return mapped;
}

/** Reusable validation message templates. */
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (field: string, length: number) =>
    `${field} must be at least ${length} characters`,
  MAX_LENGTH: (field: string, length: number) =>
    `${field} must not exceed ${length} characters`,
  INVALID_FORMAT: (field: string) => `${field} has an invalid format`,
  MUST_BE_NUMBER: (field: string) => `${field} must be a number`,
  MUST_BE_POSITIVE: (field: string) => `${field} must be a positive number`,
  MUST_BE_DATE: (field: string) => `${field} must be a valid date`,
} as const;
