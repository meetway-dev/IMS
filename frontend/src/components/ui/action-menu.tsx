import * as React from 'react';
import {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem as DropdownMenuItemPrimitive,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type MenuItemType = 'item' | 'separator' | 'checkbox' | 'submenu' | 'label';

export interface MenuItemBase {
  type?: MenuItemType;
  label?: string;
  icon?: LucideIcon | React.ReactNode;
  iconPosition?: 'start' | 'end';
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive';
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export interface MenuItem extends MenuItemBase {
  type?: 'item';
  checked?: never;
  children?: never;
}

export interface MenuCheckboxItem extends MenuItemBase {
  type: 'checkbox';
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export interface MenuSeparator extends MenuItemBase {
  type: 'separator';
}

export interface MenuLabel extends MenuItemBase {
  type: 'label';
}

export interface MenuSubmenu extends MenuItemBase {
  type: 'submenu';
  children: MenuItemConfig[];
}

export type MenuItemConfig =
  | MenuItem
  | MenuCheckboxItem
  | MenuSeparator
  | MenuLabel
  | MenuSubmenu;

export interface ActionMenuProps {
  /** Trigger element. Can be a ReactNode or a button config object */
  trigger?: React.ReactNode | {
    label?: string;
    icon?: LucideIcon | React.ReactNode;
    iconPosition?: 'start' | 'end';
    variant?: ButtonProps['variant'];
    size?: ButtonProps['size'];
    className?: string;
  };
  /** Array of menu items */
  items?: MenuItemConfig[];
  /** Alignment of the dropdown content */
  align?: 'start' | 'center' | 'end';
  /** Side offset in pixels */
  sideOffset?: number;
  /** Additional class name for the dropdown content */
  className?: string;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the dropdown is modal (default true) */
  modal?: boolean;
}

/**
 * A generic dropdown menu component that can be configured via JSON-like items.
 * Supports icons, separators, checkboxes, submenus, and destructive variants.
 */
export const ActionMenu = React.forwardRef<HTMLDivElement, ActionMenuProps>(
  (
    {
      trigger,
      items = [],
      align = 'end',
      sideOffset = 4,
      className,
      open,
      onOpenChange,
      modal = true,
    },
    ref
  ) => {
    const renderTrigger = () => {
      if (React.isValidElement(trigger)) {
        return trigger;
      }
      if (trigger && typeof trigger === 'object' && 'label' in trigger) {
        const { label, icon, iconPosition = 'start', variant = 'outline', size, className } = trigger;
        const Icon = icon as React.ElementType;
        return (
          <Button variant={variant} size={size} className={className}>
            {iconPosition === 'start' && Icon && <Icon className="mr-2 h-4 w-4" />}
            {label}
            {iconPosition === 'end' && Icon && <Icon className="ml-2 h-4 w-4" />}
          </Button>
        );
      }
      // Default trigger: a simple button with ellipsis icon
      return (
        <Button variant="ghost" size="icon-sm">
          <span className="sr-only">Open menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </Button>
      );
    };

    const renderMenuItem = (item: MenuItemConfig, index: number) => {
      const { type = 'item', label, icon, iconPosition = 'start', disabled, className, variant, onClick } = item;

      if (type === 'separator') {
        return <DropdownMenuSeparator key={`separator-${index}`} />;
      }

      if (type === 'label') {
        return (
          <DropdownMenuLabel key={`label-${index}`} className={className}>
            {label}
          </DropdownMenuLabel>
        );
      }

      const itemKey = `item-${index}`;
      const itemClassName = cn(
        variant === 'destructive' && 'text-destructive focus:text-destructive',
        className
      );

      const Icon = icon as React.ElementType;
      const iconElement = Icon && (
        <Icon className={cn('h-4 w-4', iconPosition === 'start' ? 'mr-2' : 'ml-2')} />
      );

      const children = (
        <>
          {iconPosition === 'start' && iconElement}
          {label}
          {iconPosition === 'end' && iconElement}
        </>
      );

      if (type === 'checkbox') {
        const { checked, onCheckedChange } = item as MenuCheckboxItem;
        return (
          <DropdownMenuCheckboxItem
            key={itemKey}
            disabled={disabled}
            className={itemClassName}
            onClick={onClick}
            checked={checked}
            onCheckedChange={onCheckedChange}
          >
            {children}
          </DropdownMenuCheckboxItem>
        );
      }

      if (type === 'submenu') {
        const { children: subItems } = item as MenuSubmenu;
        return (
          <DropdownMenuSub key={itemKey}>
            <DropdownMenuSubTrigger className={itemClassName}>
              {children}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {subItems.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      }

      // Default item
      return (
        <DropdownMenuItemPrimitive
          key={itemKey}
          disabled={disabled}
          className={itemClassName}
          onClick={onClick}
        >
          {children}
        </DropdownMenuItemPrimitive>
      );
    };

    return (
      <DropdownMenuPrimitive open={open} onOpenChange={onOpenChange} modal={modal}>
        <DropdownMenuTrigger asChild>
          {renderTrigger()}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} sideOffset={sideOffset} className={className} ref={ref}>
          {items.map((item, index) => renderMenuItem(item, index))}
        </DropdownMenuContent>
      </DropdownMenuPrimitive>
    );
  }
);

ActionMenu.displayName = 'ActionMenu';

/**
 * Helper function to create menu items in a type-safe way.
 */
export const menuItem = (config: Omit<MenuItem, 'type'>): MenuItem => ({
  type: 'item',
  ...config,
});

export const menuCheckboxItem = (config: Omit<MenuCheckboxItem, 'type'>): MenuCheckboxItem => ({
  type: 'checkbox',
  ...config,
});

export const menuSeparator = (config?: Omit<MenuSeparator, 'type'>): MenuSeparator => ({
  type: 'separator',
  ...config,
});

export const menuLabel = (config: Omit<MenuLabel, 'type'>): MenuLabel => ({
  type: 'label',
  ...config,
});

export const menuSubmenu = (config: Omit<MenuSubmenu, 'type'>): MenuSubmenu => ({
  type: 'submenu',
  ...config,
});