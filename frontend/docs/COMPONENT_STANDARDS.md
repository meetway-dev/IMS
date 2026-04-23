# Component Standards and Documentation

## Overview
This document establishes the standards and patterns for component development in the Next.js frontend application. It follows Atomic Design principles and provides guidelines for creating consistent, maintainable, and scalable components.

## Atomic Design Hierarchy

### 1. Atoms
**Definition**: Basic building blocks of the UI. Smallest possible components that cannot be broken down further.

**Characteristics**:
- Single responsibility
- No business logic
- Pure presentation
- Configurable via props
- No external dependencies (except design tokens)

**Examples**:
- `Button`, `Input`, `Badge`, `Icon`, `Avatar`

**File Structure**:
```
atoms/ComponentName/
├── ComponentName.tsx          # Main component
├── ComponentName.stories.tsx  # Storybook stories
├── ComponentName.test.tsx     # Unit tests
└── index.ts                   # Barrel export
```

**Template**:
```typescript
/**
 * ComponentName Component - Atom Level
 * 
 * Brief description of the component's purpose.
 * 
 * @component
 * @example
 * ```tsx
 * <ComponentName prop1="value" prop2={value} />
 * ```
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentNameVariants = cva(
  'base-styles',
  {
    variants: {
      variant: {
        primary: 'primary-styles',
        secondary: 'secondary-styles',
      },
      size: {
        sm: 'small-styles',
        md: 'medium-styles',
        lg: 'large-styles',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentNameVariants> {
  /** Description of prop */
  propName?: string;
  /** Description of another prop */
  anotherProp?: boolean;
}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant, size, propName, anotherProp, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentNameVariants({ variant, size, className }))}
        {...props}
      >
        {/* Component content */}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';

export { ComponentName, componentNameVariants };
```

### 2. Molecules
**Definition**: Combinations of atoms that form simple UI components.

**Characteristics**:
- Combine 2-3 atoms
- Limited business logic
- Focused on specific UI interactions
- Reusable across features

**Examples**:
- `SearchBar`, `FormField`, `Card`, `Alert`

**File Structure**:
```
molecules/ComponentName/
├── ComponentName.tsx
├── ComponentName.stories.tsx
├── ComponentName.test.tsx
└── index.ts
```

**Template**:
```typescript
/**
 * ComponentName Component - Molecule Level
 * 
 * Description of the molecule's purpose and composition.
 * 
 * @component
 * @example
 * ```tsx
 * <ComponentName
 *   value={value}
 *   onChange={handleChange}
 *   error={error}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/atoms/Input/Input';
import { Button } from '@/components/atoms/Button/Button';
import { Label } from '@/components/atoms/Label/Label';

export interface ComponentNameProps {
  /** Current value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Error message */
  error?: string;
  /** Additional CSS classes */
  className?: string;
}

const ComponentName = React.forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ value, onChange, error, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        <Label htmlFor="input-id">Label</Label>
        <div className="flex gap-2">
          <Input
            id="input-id"
            value={value}
            onChange={handleChange}
            error={error}
          />
          <Button variant="primary">Action</Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';

export { ComponentName };
```

### 3. Organisms
**Definition**: Complex UI components composed of molecules and/or atoms.

**Characteristics**:
- Combine multiple molecules/atoms
- May contain business logic
- Often feature-specific but reusable
- Handle complex interactions

**Examples**:
- `DataTable`, `Modal`, `Sidebar`, `Form`

**File Structure**:
```
organisms/ComponentName/
├── ComponentName.tsx
├── ComponentName.stories.tsx
├── ComponentName.test.tsx
├── ComponentName.types.ts     # Type definitions
└── index.ts
```

### 4. Templates
**Definition**: Page layouts and scaffolding components.

**Characteristics**:
- Define overall page structure
- Handle responsive design
- Composition of organisms
- No business data

**Examples**:
- `DashboardLayout`, `AuthLayout`, `PageContainer`

### 5. Pages
**Definition**: Next.js page components that combine templates and organisms.

**Characteristics**:
- Route-specific
- Data fetching
- Business logic
- Combine templates with organisms

## Component Development Standards

### 1. TypeScript
- Use strict TypeScript configuration
- Define prop interfaces with JSDoc comments
- Use generics for reusable components
- Export all types from component files

### 2. Styling
- Use Tailwind CSS with class-variance-authority for variants
- Follow design token system (`@/lib/design-tokens`)
- Use `cn()` utility for conditional classes
- Mobile-first responsive design

### 3. Props Design
- Use descriptive, consistent prop names
- Provide default values where appropriate
- Use discriminated unions for complex props
- Document all props with JSDoc comments

### 4. Accessibility
- Include proper ARIA attributes
- Support keyboard navigation
- Ensure color contrast compliance
- Provide screen reader support

### 5. Error Handling
- Validate props with TypeScript
- Provide helpful error messages
- Handle edge cases gracefully
- Use error boundaries where appropriate

### 6. Performance
- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers
- Implement virtualization for large lists
- Lazy load heavy components

## Documentation Requirements

### 1. JSDoc Comments
Every component must include:
- Brief description
- Component level (Atom/Molecule/Organism/Template)
- @component annotation
- @example with code snippet
- Prop documentation with @param

### 2. Storybook Stories
- Create stories for all variants
- Include interactive controls
- Document usage examples
- Show edge cases

### 3. Unit Tests
- Test component rendering
- Test user interactions
- Test prop variations
- Test accessibility features

### 4. Usage Examples
- Provide basic usage
- Show advanced configurations
- Include integration examples
- Document common pitfalls

## File Organization

### Component Directory Structure
```
components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── Input/
│       └── ...
├── molecules/
│   ├── SearchBar/
│   │   ├── SearchBar.tsx
│   │   ├── SearchBar.stories.tsx
│   │   ├── SearchBar.test.tsx
│   │   └── index.ts
│   └── Card/
│       └── ...
├── organisms/
│   ├── DataTable/
│   │   ├── DataTable.tsx
│   │   ├── DataTable.stories.tsx
│   │   ├── DataTable.test.tsx
│   │   ├── DataTable.types.ts
│   │   └── index.ts
│   └── Modal/
│       └── ...
├── templates/
│   ├── DashboardLayout/
│   │   └── ...
│   └── AuthLayout/
│       └── ...
└── features/          # Feature-specific components
    ├── inventory/
    │   └── ...
    └── users/
        └── ...
```

### Barrel Exports
Each component directory should have an `index.ts` file:
```typescript
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

## Migration Guidelines

### 1. From Old Structure to Atomic Design
1. **Identify component level** (Atom/Molecule/Organism)
2. **Move to appropriate directory**
3. **Update imports** to use new paths
4. **Add proper documentation**
5. **Create stories and tests**

### 2. Backward Compatibility
- Maintain old export paths during transition
- Use re-exports for compatibility
- Add deprecation warnings
- Provide migration timeline

### 3. Component Refactoring Checklist
- [ ] Move to correct Atomic Design level
- [ ] Add JSDoc documentation
- [ ] Implement proper TypeScript types
- [ ] Add Storybook stories
- [ ] Write unit tests
- [ ] Update all import references
- [ ] Verify accessibility
- [ ] Test in different browsers

## Quality Gates

### 1. Code Review Checklist
- [ ] Follows Atomic Design hierarchy
- [ ] Proper TypeScript types
- [ ] Comprehensive JSDoc comments
- [ ] Accessibility compliance
- [ ] Performance considerations
- [ ] Error handling
- [ ] Unit test coverage
- [ ] Storybook stories

### 2. Testing Requirements
- Unit tests for all components
- Integration tests for complex interactions
- Accessibility tests
- Visual regression tests
- Cross-browser testing

### 3. Performance Metrics
- Bundle size impact
- Render performance
- Memory usage
- Lighthouse scores

## Examples

### Complete Atom Example
See `components/atoms/Button/Button.tsx`

### Complete Molecule Example
See `components/molecules/SearchBar/SearchBar.tsx`

### Complete Organism Example
See `components/organisms/DataTable/DataTable.tsx`

## Resources

### Design System
- [Design Tokens](/frontend/src/lib/design-tokens.ts)
- [Theme Configuration](/frontend/src/lib/theme-config.ts)
- [Tailwind Config](/frontend/tailwind.config.ts)

### Development Tools
- [Storybook Configuration](/frontend/.storybook)
- [Testing Setup](/frontend/jest.config.js)
- [TypeScript Config](/frontend/tsconfig.json)

### References
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

---

*Last Updated: 2026-04-19*  
*Version: 1.0.0*