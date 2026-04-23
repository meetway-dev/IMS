// DEPRECATED: This file is maintained for backward compatibility during migration.
// Import from the new Atomic Design location instead.
// TODO: Remove this file after migration is complete (Week 4).

if (process.env.NODE_ENV === 'development') {
  console.warn(
    'DEPRECATED: Import Label from "@/components/ui/label". ' +
    'Use "@/components/atoms/Label" instead.'
  );
}

export { Label, type LabelProps, labelVariants } from '@/components/atoms/Label';
