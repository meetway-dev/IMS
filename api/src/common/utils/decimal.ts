export function decToString(d: { toString(): string } | null | undefined): string | null {
  if (d == null) return null;
  return d.toString();
}

export function decToNumber(d: { toString(): string } | null | undefined): number | null {
  if (d == null) return null;
  return Number(d.toString());
}
