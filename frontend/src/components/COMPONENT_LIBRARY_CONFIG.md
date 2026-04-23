# Component Library Configuration

## Overview
This document outlines the configuration and setup for the component library based on Atomic Design principles.

## Directory Structure
```
frontend/src/components/
├── atoms/                    # Basic UI elements
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Input/
│   │   └── ...
│   └── index.ts              # Barrel export for all atoms
├── molecules/               # Simple combinations
│   ├── SearchBar/
│   │   ├── SearchBar.tsx
│   │   ├── SearchBar.stories.tsx
│   │   ├── SearchBar.test.tsx
│   │   └── index.ts
│   └── index.ts             # Barrel export for all molecules
├── organisms/               # Complex components
│   ├── DataTable/
│   │   ├── DataTable.tsx
│   │   ├── DataTable.stories.tsx
│   │   ├── DataTable.test.tsx
│   │   ├── DataTable.types.ts
│   │   └── index.ts
│   └── index.ts             # Barrel export for all organisms
├── templates/               # Page layouts
│   ├── DashboardLayout/
│   │   └── ...
│   └── index.ts             # Barrel export for all templates
├── features/                # Feature-specific components
│   ├── inventory/
│   │   └── ...
│   ├── users/
│   │   └── ...
│   └── index.ts             # Barrel export for all features
└── index.ts                 # Main component library export
```

## Barrel Exports

### Level-specific Barrel Exports
Each Atomic Design level has its own barrel export:

```typescript
// atoms/index.ts
export { Button } from './Button';
export { Input } from './Input';
// ... all atoms

// molecules/index.ts
export { SearchBar } from './SearchBar';
// ... all molecules

// organisms/index.ts
export { DataTable } from './DataTable';
// ... all organisms
```

### Main Library Export
```typescript
// components/index.ts
// Atoms
export { Button, type ButtonProps } from './atoms/Button';
export { Input, type InputProps } from './atoms/Input';

// Molecules
export { SearchBar, type SearchBarProps } from './molecules/SearchBar';

// Organisms
export { DataTable, type DataTableProps } from './organisms/DataTable';

// Features
export * as Inventory from './features/inventory';
export * as Users from './features/users';
```

## Configuration Files

### TypeScript Configuration
Ensure `tsconfig.json` includes proper path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/components/atoms/*": ["./src/components/atoms/*"],
      "@/components/molecules/*": ["./src/components/molecules/*"],
      "@/components/organisms/*": ["./src/components/organisms/*"]
    }
  }
}
```

### ESLint Configuration
Add rules for component organization:
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../ui/*'],
            message: 'Use Atomic Design imports instead: @/components/atoms/* or @/components/molecules/*'
          }
        ]
      }
    ]
  }
};
```

## Development Setup

### Storybook Configuration
Create `.storybook/main.js`:
```javascript
module.exports = {
  stories: [
    '../src/components/atoms/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/components/molecules/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/components/organisms/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};
```

### Testing Configuration
Create `jest.config.js` for component testing:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/src/components/**/*.test.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

## Component Generation

### Script for Generating Components
Create `scripts/generate-component.js`:
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const name = args.find(arg => arg.startsWith('--name='))?.split('=')[1];
const level = args.find(arg => arg.startsWith('--level='))?.split('=')[1];

if (!name || !level) {
  console.error('Usage: node generate-component.js --name=ComponentName --level=atom|molecule|organism');
  process.exit(1);
}

const componentDir = path.join(__dirname, '..', 'src', 'components', `${level}s`, name);
const template = generateTemplate(name, level);

// Create directory
fs.mkdirSync(componentDir, { recursive: true });

// Create component file
fs.writeFileSync(path.join(componentDir, `${name}.tsx`), template.component);

// Create index file
fs.writeFileSync(path.join(componentDir, 'index.ts'), template.index);

// Create story file
fs.writeFileSync(path.join(componentDir, `${name}.stories.tsx`), template.story);

console.log(`✅ Generated ${level}: ${name} at ${componentDir}`);
```

## Import Patterns

### Recommended Import Patterns
```typescript
// Import specific component
import { Button } from '@/components/atoms/Button';

// Import with type
import { Button, type ButtonProps } from '@/components/atoms/Button';

// Import from level barrel
import { Button, Input } from '@/components/atoms';

// Import from main library
import { Button, SearchBar, DataTable } from '@/components';

// Feature-specific imports
import { InventoryDashboard } from '@/components/features/inventory';
```

### Deprecated Patterns (to avoid)
```typescript
// ❌ Avoid old UI imports
import { Button } from '@/components/ui/button';

// ❌ Avoid relative imports that bypass structure
import Button from '../ui/button';
```

## Migration Support

### Temporary Re-exports
During migration, maintain backward compatibility:
```typescript
// components/ui/button.tsx (temporary)
export { Button, type ButtonProps } from '@/components/atoms/Button';

if (process.env.NODE_ENV === 'development') {
  console.warn(
    'DEPRECATED: Import Button from "@/components/ui/button". ' +
    'Use "@/components/atoms/Button" instead. This will be removed in v2.0.0.'
  );
}
```

### Migration Script
Create `scripts/migrate-imports.js` to update import paths:
```javascript
#!/usr/bin/env node
// Script to update import paths from old to new structure
```

## Quality Gates

### Pre-commit Hooks
Add Husky hooks to enforce standards:
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/components/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### CI/CD Pipeline
Add component library checks to CI:
```yaml
# .github/workflows/components.yml
name: Component Library
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:components
      - run: npm run build:storybook
      - run: npm run lint:components
```

## Documentation

### Component Documentation
Each component must include:
1. JSDoc comments with `@component` annotation
2. Prop documentation with `@param`
3. Usage examples with `@example`
4. Storybook stories for all variants
5. Unit tests for core functionality

### Living Documentation
- Storybook for component catalog
- TypeScript for API documentation
- JSDoc for inline documentation
- Migration guides for updates

## Performance Considerations

### Bundle Optimization
- Use dynamic imports for heavy components
- Implement code splitting by feature
- Tree-shake unused components
- Optimize component exports

### Build Configuration
```javascript
// next.config.js
module.exports = {
  experimental: {
    // Enable component-level code splitting
    granularChunks: true,
  },
};
```

## Maintenance

### Versioning
- Follow semantic versioning for component library
- Maintain changelog for breaking changes
- Provide migration guides between versions

### Deprecation Policy
1. Mark deprecated components with console warnings
2. Maintain backward compatibility for one major version
3. Provide migration path in documentation
4. Remove deprecated components in next major version

## Getting Started

### For New Developers
1. Read `COMPONENT_STANDARDS.md`
2. Review existing component patterns
3. Use component generation script
4. Follow import patterns
5. Add documentation and tests

### For Component Updates
1. Check migration mapping for affected components
2. Update component following standards
3. Update documentation
4. Update tests
5. Verify backward compatibility

---

*Last Updated: 2026-04-19*  
*Version: 1.0.0*