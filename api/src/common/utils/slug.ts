/**
 * Generate a URL-safe slug from arbitrary text.
 *
 * @example
 * ```ts
 * slugify('Hello World!'); // "hello-world"
 * slugify('  ');           // "item"
 * ```
 *
 * @module slug
 */
export function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s.length > 0 ? s : 'item';
}
