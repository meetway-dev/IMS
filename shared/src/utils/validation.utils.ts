// Shared Validation Utilities

import { ValidationError } from '../types/api.types';

/**
 * Common validation patterns that can be shared between BE and FE
 */

// Email validation regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation rules
export interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordValidationOptions = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  options: PasswordValidationOptions = DEFAULT_PASSWORD_OPTIONS
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password.length < (options.minLength || 8)) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${options.minLength || 8} characters long`,
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

  if (options.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one special character',
    });
  }

  return errors;
}

/**
 * Validate email format
 */
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

/**
 * Convert validation errors to field-error mapping
 */
export function mapValidationErrors(errors: ValidationError[]): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const error of errors) {
    if (!mapped[error.field]) {
      mapped[error.field] = error.message;
    }
  }

  return mapped;
}

/**
 * Common validation messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: (field: string) => `${field} is required`,
  INVALID_EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (field: string, length: number) => `${field} must be at least ${length} characters`,
  MAX_LENGTH: (field: string, length: number) => `${field} must not exceed ${length} characters`,
  INVALID_FORMAT: (field: string) => `${field} has an invalid format`,
  MUST_BE_NUMBER: (field: string) => `${field} must be a number`,
  MUST_BE_POSITIVE: (field: string) => `${field} must be a positive number`,
  MUST_BE_DATE: (field: string) => `${field} must be a valid date`,
};