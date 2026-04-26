/**
 * Shared formatting utilities.
 *
 * Pure functions for currency, date, text, and number formatting
 * used by both the API serializers and frontend display components.
 *
 * @module format.utils
 */

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

/** Format a numeric or string amount as a locale-aware currency string. */
export function formatCurrency(
  amount: number | string,
  currency = 'USD',
  locale = 'en-US',
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(numAmount) ? 0 : numAmount);
}

// ---------------------------------------------------------------------------
// Date / time
// ---------------------------------------------------------------------------

/** Format a date using Intl with a named preset. */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale = 'en-US',
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
    day: 'numeric',
  };

  if (format === 'full') {
    options.weekday = 'long';
  }

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/** Format a date including hours and minutes. */
export function formatDateTime(date: Date | string, locale = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// ---------------------------------------------------------------------------
// Numbers / sizes
// ---------------------------------------------------------------------------

/** Human-readable byte-size string (e.g. "1.5 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/** Format a number as a percentage string. */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------

/** Truncate text at `maxLength`, appending an ellipsis if trimmed. */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis = '...',
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/** Format a US/international phone number for display. */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
  }

  return phoneNumber;
}

/** Extract up to two initials from a full name. */
export function getInitials(name: string): string {
  if (!name) return '';

  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Convert a string to a URL-safe slug.
 *
 * Example: `"Hello World!"` -> `"hello-world"`
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/** Capitalise the first letter of every word. */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
