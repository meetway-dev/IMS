# Generic Modal System - Architecture & Usage Guide

## Overview

The new generic modal system provides a scalable, type-safe, and centralized way to manage modals across the entire application. It replaces the previous fragmented modal implementations with a unified architecture that supports:

- **Programmatic modal control** - Open/close modals from anywhere
- **Type-safe modal definitions** - Full TypeScript support
- **Modal registry/factory** - Register and reuse modal components
- **Responsive design** - Built-in responsive sizing
- **Multiple modal types** - Confirm, prompt, alert, form, detail modals
- **Global state management** - Centralized modal state

## Architecture

### Core Components

1. **Modal Context/Provider** (`modal.context.tsx`)
   - Global state management for modals
   - Reducer-based state updates
   - Maximum modal limit enforcement

2. **Modal Hooks** (`use-modal.ts`)
   - `useModal()` - Main hook for all modal operations
   - `useConfirm()` - Specialized for confirmation modals
   - `usePrompt()` - Specialized for prompt modals
   - `useComponentModal()` - For component-based modals

3. **Modal Renderer** (`modal-renderer.tsx`)
   - Renders all active modals
   - Handles different modal types (component, content, confirm, prompt)
   - Manages modal lifecycle

4. **Modal Factory** (`modal-factory.tsx`)
   - Registry for reusable modal components
   - Type-based modal instantiation
   - Provider for modal registration

5. **Enhanced ResponsiveModal** (`responsive-modal.tsx`)
   - Base modal component with responsive design
   - Pre-configured variants (DataRichModal, FormModal, DetailModal)

## Installation & Setup

### 1. Wrap your app with providers

```tsx
// app/layout.tsx or app/providers.tsx
import { ModalProvider } from '@/context/modal.context';
import { ModalFactoryProvider } from '@/components/ui/modal-factory';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <ModalFactoryProvider>
        {children}
      </ModalFactoryProvider>
    </ModalProvider>
  );
}
```

### 2. Register modal components (optional)

```tsx
// In your component initialization
import { useModalFactory } from '@/components/ui/modal-factory';
import { UserFormModal } from './UserFormModal';
import { ProductDetailsModal } from './ProductDetailsModal';

function AppInitializer() {
  const { registerModal } = useModalFactory();
  
  React.useEffect(() => {
    registerModal('user-form', UserFormModal);
    registerModal('product-details', ProductDetailsModal);
  }, [registerModal]);
  
  return null;
}
```

## Usage Examples

### Basic Usage

```tsx
import { useModal } from '@/hooks/use-modal';

function MyComponent() {
  const { openComponentModal, openContentModal, confirm, prompt, alert } = useModal();

  const handleOpenForm = () => {
    // Open a component modal
    openComponentModal({
      component: UserFormModal,
      componentProps: { userId: '123' },
      title: 'Edit User',
      size: 'lg',
      onClose: () => console.log('Modal closed'),
    });
  };

  const handleConfirm = async () => {
    // Open a confirmation modal
    const modalId = confirm('Are you sure you want to delete this item?', {
      title: 'Confirm Deletion',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
      onConfirm: async () => {
        await deleteItem();
      },
    });
  };

  const handlePrompt = async () => {
    // Open a prompt modal
    const modalId = prompt('Enter your name:', {
      title: 'User Name',
      defaultValue: 'John',
      placeholder: 'Enter name...',
      onSubmit: async (value) => {
        await updateName(value);
      },
    });
  };

  const handleAlert = () => {
    // Open an alert modal
    alert('Operation completed successfully!', {
      title: 'Success',
      buttonText: 'OK',
    });
  };

  const handleContentModal = () => {
    // Open a modal with simple content
    openContentModal({
      title: 'Information',
      content: (
        <div className="space-y-4">
          <p>This is a simple content modal.</p>
          <p>You can put any React content here.</p>
        </div>
      ),
      size: 'md',
    });
  };

  return (
    <div>
      <button onClick={handleOpenForm}>Open Form Modal</button>
      <button onClick={handleConfirm}>Confirm Action</button>
      <button onClick={handlePrompt}>Prompt Input</button>
      <button onClick={handleAlert}>Show Alert</button>
      <button onClick={handleContentModal}>Open Content Modal</button>
    </div>
  );
}
```

### Using Modal Factory

```tsx
import { useRegisteredModal } from '@/components/ui/modal-factory';

function MyComponent() {
  const { openForm, openDetails } = useRegisteredModal();

  const handleOpenUserForm = () => {
    // Open a registered form modal
    openForm('user-form', {
      userId: '123',
      mode: 'edit',
    }, {
      title: 'Edit User Profile',
      size: 'lg',
    });
  };

  const handleOpenProductDetails = () => {
    // Open a registered details modal
    openDetails('product-details', {
      productId: '456',
      showInventory: true,
    }, {
      title: 'Product Information',
      size: 'xl',
    });
  };

  return (
    <div>
      <button onClick={handleOpenUserForm}>Edit User</button>
      <button onClick={handleOpenProductDetails}>View Product</button>
    </div>
  );
}
```

### Creating Custom Modal Components

```tsx
// components/modals/UserFormModal.tsx
interface UserFormModalProps {
  userId?: string;
  mode?: 'create' | 'edit';
  onSuccess?: () => void;
}

export function UserFormModal({ userId, mode = 'create', onSuccess }: UserFormModalProps) {
  const [loading, setLoading] = React.useState(false);
  
  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        await createUser(data);
      } else {
        await updateUser(userId!, data);
      }
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {mode === 'create' ? 'Create New User' : 'Edit User'}
      </h3>
      {/* Form content */}
    </div>
  );
}
```

## API Reference

### `useModal()` Hook

| Method | Description | Parameters |
|--------|-------------|------------|
| `openComponentModal` | Open modal with React component | `ComponentModalOptions<T>` |
| `openContentModal` | Open modal with simple content | `ContentModalOptions` |
| `openConfirmModal` | Open confirmation modal | `ConfirmModalOptions` |
| `openPromptModal` | Open prompt modal | `PromptModalOptions` |
| `confirm` | Quick confirmation helper | `message: string, options?` |
| `prompt` | Quick prompt helper | `message: string, options?` |
| `alert` | Quick alert helper | `message: string, options?` |
| `openFormModal` | Open form-optimized modal | `component, props, options?` |
| `openDetailModal` | Open detail-optimized modal | `component, props, options?` |
| `closeModal` | Close modal by ID | `id: string` |
| `closeAllModals` | Close all open modals | - |
| `updateModal` | Update modal options | `id: string, options: Partial<ModalOptions>` |
| `isModalOpen` | Check if modal is open | `id: string` |
| `getOpenModals` | Get all open modals | - |

### Modal Options

#### BaseModalOptions
```typescript
interface BaseModalOptions {
  title?: ReactNode;
  description?: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full' | 'auto';
  maxHeight?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto' | string;
  scrollable?: boolean;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  onClose?: () => void;
}
```

#### ComponentModalOptions
```typescript
interface ComponentModalOptions<T = any> extends BaseModalOptions {
  component: React.ComponentType<T>;
  componentProps?: T;
}
```

#### ConfirmModalOptions
```typescript
interface ConfirmModalOptions extends BaseModalOptions {
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showCancel?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}
```

## Migration Guide

### From Old Modal System

#### Before (Old way):
```tsx
const [isModalOpen, setIsModalOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsModalOpen(true)}>Open Modal</button>
    <ResponsiveModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="My Modal"
    >
      <MyComponent />
    </ResponsiveModal>
  </>
);
```

#### After (New way):
```tsx
import { useModal } from '@/hooks/use-modal';

function MyComponent() {
  const { openComponentModal } = useModal();

  const handleOpen = () => {
    openComponentModal({
      component: MyComponent,
      title: 'My Modal',
    });
  };

  return <button onClick={handleOpen}>Open Modal</button>;
}
```

### Backward Compatibility

The system maintains backward compatibility with the existing `ResponsiveModal` component. You can still use it directly:

```tsx
import { ResponsiveModal } from '@/components/ui/responsive-modal';

function LegacyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <ResponsiveModal
      open={open}
      onClose={() => setOpen(false)}
      title="Legacy Modal"
    >
      Content
    </ResponsiveModal>
  );
}
```

## Best Practices

1. **Use hooks for programmatic control** - Prefer `useModal()` hooks over local state for modals
2. **Register reusable modals** - Use `ModalFactoryProvider` for modals used across the app
3. **Type safety** - Always define TypeScript interfaces for modal props
4. **Error handling** - Handle async operations in modals with try/catch
5. **Accessibility** - Modal system includes proper ARIA attributes and keyboard navigation
6. **Responsive design** - Use appropriate `size` and `maxHeight` options for different content types

## Performance Considerations

- **Modal limit**: Default maximum of 5 simultaneous modals (configurable)
- **Lazy loading**: Consider code-splitting for large modal components
- **Memoization**: Use `React.memo` for modal components that re-render frequently
- **Cleanup**: Ensure proper cleanup in `onClose` callbacks

## Testing

```tsx
// Example test with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalProvider } from '@/context/modal.context';
import { useModal } from '@/hooks/use-modal';

function TestComponent() {
  const { alert } = useModal();
  
  return (
    <button onClick={() => alert('Test message')}>
      Show Alert
    </button>
  );
}

test('opens alert modal', () => {
  render(
    <ModalProvider>
      <TestComponent />
    </ModalProvider>
  );
  
  fireEvent.click(screen.getByText('Show Alert'));
  expect(screen.getByText('Test message')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Modal not opening**: Ensure `ModalProvider` is wrapping your component tree
2. **Type errors**: Check that modal props match the expected TypeScript interfaces
3. **Multiple modals**: Use `closeAllModals()` to reset state if needed
4. **Memory leaks**: Ensure `onClose` callbacks don't create circular references

### Debugging

```tsx
// Add debug logging
const { getOpenModals } = useModal();

React.useEffect(() => {
  console.log('Open modals:', getOpenModals());
}, [getOpenModals]);
```

## Future Enhancements

1. **Modal stacking** - Z-index management for multiple modals
2. **Animation customization** - Custom enter/exit animations
3. **Modal queues** - Sequential modal display
4. **Persistent modals** - Modals that survive route changes
5. **Modal templates** - Pre-styled modal layouts

---

*Last updated: April 2026*