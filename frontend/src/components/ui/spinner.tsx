// DEPRECATED: This file is maintained for backward compatibility during migration.
// Import from the new Atomic Design location instead.
// TODO: Remove this file after migration is complete (Week 4).

if (process.env.NODE_ENV === 'development') {
  console.warn(
    'DEPRECATED: Import Spinner from "@/components/ui/spinner". ' +
    'Use "@/components/atoms/Spinner" instead.'
  );
}

export { Spinner, type SpinnerProps } from '@/components/atoms/Spinner';