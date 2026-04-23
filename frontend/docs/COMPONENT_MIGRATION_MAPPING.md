# Component Migration Mapping

## Overview
This document provides a mapping of existing components to the new Atomic Design structure. It serves as a guide for migrating components from the old structure to the new standardized organization.

## Migration Strategy

### Phase 1: Foundation (Current)
- Create Atomic Design folder structure
- Establish component patterns and templates
- Create documentation standards
- Set up migration mapping

### Phase 2: Component Migration (Next)
- Migrate UI primitives (Atoms)
- Migrate simple combinations (Molecules)
- Migrate complex components (Organisms)
- Update import paths gradually

### Phase 3: Cleanup (Final)
- Remove old component directories
- Update all import references
- Verify backward compatibility
- Update documentation

## Component Mapping Table

### Current Location → New Atomic Design Location

#### UI Primitives (Atoms)
| Current Path | Component | Atomic Level | New Path | Status | Notes |
|--------------|-----------|--------------|----------|--------|-------|
| `components/ui/button.tsx` | Button | Atom | `components/atoms/Button/Button.tsx` | ✅ Created | Enhanced with variants |
| `components/ui/input.tsx` | Input | Atom | `components/atoms/Input/Input.tsx` | ✅ Created | Enhanced with validation |
| `components/ui/badge.tsx` | Badge | Atom | `components/atoms/Badge/Badge.tsx` | ✅ Migrated | Enhanced with backward compatibility |
| `components/ui/card.tsx` | Card | Molecule | `components/molecules/Card/Card.tsx` | ⏳ Pending | Reclassify as Molecule |
| `components/ui/checkbox.tsx` | Checkbox | Atom | `components/atoms/Checkbox/Checkbox.tsx` | ✅ Migrated | Enhanced with backward compatibility |
| `components/ui/dialog.tsx` | Dialog | Organism | `components/organisms/Dialog/Dialog.tsx` | ⏳ Pending | Reclassify as Organism |
| `components/ui/dropdown-menu.tsx` | DropdownMenu | Molecule | `components/molecules/DropdownMenu/DropdownMenu.tsx` | ⏳ Pending | Reclassify as Molecule |
| `components/ui/form.tsx` | Form | Organism | `components/organisms/Form/Form.tsx` | ⏳ Pending | Reclassify as Organism |
| `components/ui/label.tsx` | Label | Atom | `components/atoms/Label/Label.tsx` | ✅ Migrated | Enhanced with backward compatibility |
| `components/ui/popover.tsx` | Popover | Molecule | `components/molecules/Popover/Popover.tsx` | ⏳ Pending | Reclassify as Molecule |
| `components/ui/progress.tsx` | Progress | Atom | `components/atoms/Progress/Progress.tsx` | ⏳ Pending | Needs enhancement |
| `components/ui/scroll-area.tsx` | ScrollArea | Atom | `components/atoms/ScrollArea/ScrollArea.tsx` | ⏳ Pending | Needs enhancement |
| `components/ui/select.tsx` | Select | Molecule | `components/molecules/Select/Select.tsx` | ⏳ Pending | Reclassify as Molecule |
| `components/ui/separator.tsx` | Separator | Atom | `components/atoms/Separator/Separator.tsx` | ⏳ Pending | Needs enhancement |
| `components/ui/spinner.tsx` | Spinner | Atom | `components/atoms/Spinner/Spinner.tsx` | ✅ Migrated | Enhanced with backward compatibility |
| `components/ui/switch.tsx` | Switch | Atom | `components/atoms/Switch/Switch.tsx` | ⏳ Pending | Needs enhancement |
| `components/ui/table.tsx` | Table | Organism | `components/organisms/Table/Table.tsx` | ⏳ Pending | Reclassify as Organism |
| `components/ui/tabs.tsx` | Tabs | Molecule | `components/molecules/Tabs/Tabs.tsx` | ⏳ Pending | Reclassify as Molecule |
| `components/ui/textarea.tsx` | Textarea | Atom | `components/atoms/Textarea/Textarea.tsx` | ⏳ Pending | Needs enhancement |
| `components/ui/toast.tsx` | Toast | Molecule | `components/molecules/Toast/Toast.tsx` | ⏳ Pending | Reclassify as Molecule |
| `components/ui/toaster.tsx` | Toaster | Organism | `components/organisms/Toaster/Toaster.tsx` | ⏳ Pending | Reclassify as Organism |

#### Layout Components
| Current Path | Component | Atomic Level | New Path | Status | Notes |
|--------------|-----------|--------------|----------|--------|-------|
| `components/layout/sidebar.tsx` | Sidebar | Organism | `components/organisms/Sidebar/Sidebar.tsx` | ⏳ Pending | Business logic present |
| `components/layout/topbar.tsx` | Topbar | Organism | `components/organisms/Topbar/Topbar.tsx` | ⏳ Pending | Business logic present |

#### Inventory Components
| Current Path | Component | Atomic Level | New Path | Status | Notes |
|--------------|-----------|--------------|----------|--------|-------|
| `components/inventory/AdvancedDataTable.tsx` | AdvancedDataTable | Organism | `components/features/inventory/AdvancedDataTable.tsx` | ⏳ Pending | Feature-specific |
| `components/inventory/InventoryDashboard.tsx` | InventoryDashboard | Organism | `components/features/inventory/InventoryDashboard.tsx` | ⏳ Pending | Feature-specific |
| `components/inventory/ProductVariantSelector.tsx` | ProductVariantSelector | Organism | `components/features/inventory/ProductVariantSelector.tsx` | ⏳ Pending | Feature-specific |
| `components/inventory/StockMovementTimeline.tsx` | StockMovementTimeline | Organism | `components/features/inventory/StockMovementTimeline.tsx` | ⏳ Pending | Feature-specific |
| `components/ui/inventory/StockBadge.tsx` | StockBadge | Molecule | `components/features/inventory/StockBadge.tsx` | ⏳ Pending | Feature-specific |

#### Table Components
| Current Path | Component | Atomic Level | New Path | Status | Notes |
|--------------|-----------|--------------|----------|--------|-------|
| `components/tables/data-table.tsx` | DataTable | Organism | `components/organisms/DataTable/DataTable.tsx` | ✅ Created | Enhanced version |
| `components/tables/table-skeleton.tsx` | TableSkeleton | Molecule | `components/molecules/TableSkeleton/TableSkeleton.tsx` | ⏳ Pending | Needs migration |

#### Modal Components
| Current Path | Component | Atomic Level | New Path | Status | Notes |
|--------------|-----------|--------------|----------|--------|-------|
| `components/ui/responsive-modal.tsx` | ResponsiveModal | Organism | `components/organisms/Modal/Modal.tsx` | ⏳ Pending | Consolidate modal system |
| `components/ui/modal-factory.tsx` | ModalFactory | Organism | `components/organisms/Modal/ModalFactory.tsx` | ⏳ Pending | Deprecate in favor of unified system |
| `components/ui/modal-renderer.tsx` | ModalRenderer | Organism | `components/organisms/Modal/ModalRenderer.tsx` | ⏳ Pending | Consolidate with Modal |

#### Provider Components
| Current Path | Component | Atomic Level | New Path | Status | Notes |
|--------------|-----------|--------------|----------|--------|-------|
| `components/providers/query-provider.tsx` | QueryProvider | Template | `components/templates/QueryProvider/QueryProvider.tsx` | ⏳ Pending | Reclassify as Template |
| `components/providers/theme-provider.tsx` | ThemeProvider | Template | `components/templates/ThemeProvider/ThemeProvider.tsx` | ⏳ Pending | Reclassify as Template |

## Migration Priority

### High Priority (Week 1)
1. **UI Primitives (Atoms)**
   - Button (✅ Done)
   - Input (✅ Done)
   - Badge
   - Checkbox
   - Label
   - Spinner

2. **Common Molecules**
   - SearchBar (✅ Done)
   - Card
   - DropdownMenu
   - Tabs

### Medium Priority (Week 2)
1. **Complex Organisms**
   - DataTable (✅ Created as enhanced version)
   - Modal (consolidate modal system)
   - Form
   - Sidebar
   - Topbar

2. **Feature Components**
   - Inventory components to features directory
   - Update import paths

### Low Priority (Week 3)
1. **Templates**
   - DashboardLayout
   - AuthLayout
   - QueryProvider
   - ThemeProvider

2. **Cleanup**
   - Remove old component directories
   - Update all import references
   - Verify backward compatibility

## Migration Steps for Each Component

### Step 1: Analysis
1. Determine Atomic Design level (Atom/Molecule/Organism/Template)
2. Identify dependencies and imports
3. Assess enhancement opportunities
4. Check for business logic that should be extracted

### Step 2: Preparation
1. Create new directory structure
2. Copy component to new location
3. Update import paths within component
4. Add JSDoc documentation

### Step 3: Enhancement
1. Add TypeScript improvements
2. Implement variant system with CVA
3. Add accessibility features
4. Improve error handling

### Step 4: Integration
1. Create barrel export (`index.ts`)
2. Update import references in consuming files
3. Test component in isolation
4. Test component in context

### Step 5: Verification
1. Run unit tests
2. Check Storybook stories
3. Verify accessibility
4. Test in different browsers

## Backward Compatibility

### Temporary Re-exports
Create re-export files in old locations during transition:
```typescript
// components/ui/button.tsx (temporary)
export { Button, type ButtonProps } from '@/components/atoms/Button/Button';
```

### Deprecation Warnings
Add console warnings for deprecated imports:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'DEPRECATED: Import Button from "@/components/ui/button". ' +
    'Use "@/components/atoms/Button" instead.'
  );
}
```

### Migration Timeline
- **Week 1-2**: Migrate with backward compatibility
- **Week 3**: Update majority of imports
- **Week 4**: Remove deprecated exports
- **Week 5**: Final cleanup and verification

## Import Path Updates

### Old Import Pattern
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/tables/data-table';
```

### New Import Pattern
```typescript
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
```

### Feature-specific Components
```typescript
// Old
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';

// New
import { InventoryDashboard } from '@/components/features/inventory/InventoryDashboard';
```

## Testing Strategy

### Unit Tests
- Maintain existing test coverage
- Add tests for new features
- Test all variant combinations
- Test accessibility attributes

### Integration Tests
- Test component interactions
- Test with different data states
- Test error scenarios
- Test loading states

### Visual Regression
- Use Storybook for visual testing
- Test all component variants
- Test responsive behavior
- Test dark/light themes

## Common Migration Issues and Solutions

### Issue 1: Circular Dependencies
**Solution**: Use barrel exports and careful import ordering

### Issue 2: Type Conflicts
**Solution**: Use `Omit<>` or intersection types to resolve conflicts

### Issue 3: Styling Inconsistencies
**Solution**: Use design tokens and CVA for consistent variants

### Issue 4: Missing Documentation
**Solution**: Follow JSDoc template in COMPONENT_STANDARDS.md

### Issue 5: Performance Regression
**Solution**: Use React.memo, useMemo, useCallback appropriately

## Success Metrics

### Code Quality
- 100% TypeScript coverage for migrated components
- 90%+ unit test coverage
- All components have JSDoc documentation
- All components have Storybook stories

### Performance
- No increase in bundle size
- Maintain or improve render performance
- Accessibility score 90%+

### Developer Experience
- Consistent import patterns
- Clear component documentation
- Easy component discovery
- Reduced cognitive load

## Tools and Scripts

### Migration Helper Script
Create a script to automate common migration tasks:
```bash
# Generate component scaffolding
npm run generate:component --name=Button --level=atom

# Update import paths
npm run migrate:imports --old=ui/button --new=atoms/Button

# Verify migration
npm run verify:migration --component=Button
```

### Linting Rules
Add ESLint rules to enforce new patterns:
- Import path validation
- JSDoc requirement
- Atomic Design level validation
- Prop naming conventions

## Next Steps

### Immediate Actions
1. Review this mapping with the team
2. Prioritize components for migration
3. Set up migration environment
4. Create migration scripts

### Short-term Goals
1. Migrate all Atoms (Week 1)
2. Migrate all Molecules (Week 2)
3. Migrate critical Organisms (Week 3)

### Long-term Goals
1. Complete all migrations (Month 1)
2. Establish component library (Month 2)
3. Implement design system (Month 3)

---

*Last Updated: 2026-04-19*  
*Version: 1.0.0*  
*Status: Mapping Complete - Ready for Migration*