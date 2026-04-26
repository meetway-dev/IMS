'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Truck,
  Tag,
  Building,
  PackageOpen,
  ShoppingCart,
  FileText,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
  Shield,
  Type,
  Ruler,
  Warehouse,
  PackageCheck,
  Key,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// ─── Navigation config ──────────────────────────────────────────────────────

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  permissions?: string[];
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  href?: string;
  type: 'single' | 'group';
  defaultExpanded?: boolean;
  items?: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    type: 'single',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: Package,
    type: 'group',
    defaultExpanded: true,
    items: [
      { name: 'Products', href: '/dashboard/products', icon: Package, description: 'Product catalog', permissions: ['products.read'] },
      { name: 'Categories', href: '/dashboard/categories', icon: Tag, description: 'Product taxonomy', permissions: ['categories.read'] },
      { name: 'Product Types', href: '/dashboard/product-types', icon: Type, description: 'Product classification', permissions: ['product-types.read'] },
      { name: 'Units of Measure', href: '/dashboard/unit-of-measures', icon: Ruler, description: 'Measurement units', permissions: ['unit-of-measures.read'] },
      { name: 'Inventory', href: '/dashboard/inventory', icon: PackageOpen, description: 'Stock levels', permissions: ['inventory.read'] },
      { name: 'Warehouses', href: '/dashboard/warehouses', icon: Warehouse, description: 'Storage locations', permissions: ['warehouses.read'] },
      { name: 'Suppliers', href: '/dashboard/suppliers', icon: Truck, description: 'Vendor management', permissions: ['suppliers.read'] },
      { name: 'Purchase Orders', href: '/dashboard/purchase-orders', icon: FileText, description: 'Procurement orders', permissions: ['purchase-orders.read'] },
      { name: 'Goods Receipts', href: '/dashboard/goods-receipts', icon: PackageCheck, description: 'Incoming shipments', permissions: ['goods-receipts.read'] },
    ],
  },
  {
    id: 'sales',
    title: 'Sales',
    icon: ShoppingCart,
    type: 'group',
    defaultExpanded: true,
    items: [
      { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart, description: 'Customer orders', permissions: ['orders.read'] },
      { name: 'Customers', href: '/dashboard/customers', icon: Users, description: 'Customer management', permissions: ['customers.read'], badge: 'Soon' },
      { name: 'Invoices', href: '/dashboard/invoices', icon: FileText, description: 'Billing', permissions: ['invoices.read'], badge: 'Soon' },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    icon: Shield,
    type: 'group',
    defaultExpanded: true,
    items: [
      { name: 'RBAC Dashboard', href: '/dashboard/rbac', icon: Shield, description: 'Access control overview', permissions: ['roles.read'] },
      { name: 'Users', href: '/dashboard/users', icon: Users, description: 'User accounts & roles', permissions: ['users.read'] },
      { name: 'Roles', href: '/dashboard/roles', icon: Shield, description: 'Role management', permissions: ['roles.read'] },
      { name: 'Permissions', href: '/dashboard/permissions', icon: Key, description: 'Permission control', permissions: ['permissions.read'] },
      { name: 'Companies', href: '/dashboard/companies', icon: Building, description: 'Organization setup', permissions: ['companies.read'] },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: BarChart3,
    type: 'group',
    defaultExpanded: false,
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Business intelligence', permissions: ['analytics.read'], badge: 'Beta' },
      { name: 'Audit Logs', href: '/dashboard/audit', icon: FileText, description: 'Activity logs', permissions: ['audit.read'] },
      { name: 'Reports', href: '/dashboard/reports', icon: FileText, description: 'Custom reports', permissions: ['reports.read'], badge: 'Soon' },
    ],
  },
  {
    id: 'system',
    title: 'System',
    icon: Settings,
    type: 'group',
    defaultExpanded: false,
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'Configuration', permissions: ['settings.read'], badge: 'Soon' },
      { name: 'Integrations', href: '/dashboard/integrations', icon: Settings, description: 'Third-party', permissions: ['integrations.read'], badge: 'Soon' },
    ],
  },
];

// ─── Navigation Group Component ─────────────────────────────────────────────

function NavigationGroup({
  group,
  pathname,
  sidebarOpen,
  expandedGroups,
  toggleGroup,
}: {
  group: NavGroup;
  pathname: string;
  sidebarOpen: boolean;
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupId: string) => void;
}) {
  const isExpanded = expandedGroups[group.id] ?? group.defaultExpanded;

  // Single link (Dashboard)
  if (group.type === 'single' && group.href) {
    const isActive = pathname === group.href;
    return (
      <Link
        href={group.href}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <group.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-primary-foreground')} />
        {sidebarOpen && <span>{group.title}</span>}
      </Link>
    );
  }

  // Collapsed sidebar - just the icon
  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center gap-0.5 py-1">
        <button
          onClick={() => toggleGroup(group.id)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150',
            isExpanded ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          title={group.title}
        >
          <group.icon className="h-4 w-4" />
        </button>
        {isExpanded && group.items && (
          <div className="flex flex-col items-center gap-0.5 pt-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Expanded sidebar - full group
  return (
    <div className="space-y-0.5">
      <button
        onClick={() => toggleGroup(group.id)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-150"
      >
        <span>{group.title}</span>
        <ChevronRight
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      {isExpanded && group.items && (
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group/item flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground/70 group-hover/item:text-accent-foreground')} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <Badge variant="muted" className="ml-2 text-[10px] font-medium px-1.5 py-0 h-[18px] rounded-full">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar Component ──────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();
  const { hasAnyPermission } = usePermissions();

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      if (group.type === 'group' && group.defaultExpanded !== undefined) {
        initial[group.id] = group.defaultExpanded;
      }
    });
    return initial;
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Filter navigation groups based on user permissions
  const filteredGroups = React.useMemo(() => {
    return navigationGroups
      .map((group) => {
        // Single links (Dashboard) are always visible
        if (group.type === 'single') return group;

        // Filter items within groups by their required read permission
        const filteredItems = group.items?.filter((item) => {
          if (!item.permissions || item.permissions.length === 0) return true;
          return hasAnyPermission(item.permissions);
        });

        // Hide the entire group if no items are visible
        if (!filteredItems || filteredItems.length === 0) return null;

        return { ...group, items: filteredItems };
      })
      .filter(Boolean) as NavGroup[];
  }, [hasAnyPermission]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar-background transition-all duration-300 ease-out lg:static lg:inset-y-0',
          sidebarOpen ? 'w-60' : 'w-[68px]',
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className={cn('flex h-14 items-center border-b border-sidebar-border px-4', sidebarOpen ? 'justify-between' : 'justify-center')}>
          {sidebarOpen ? (
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <span className="text-xs font-bold tracking-tight">IM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-foreground leading-none">IMS</span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5">Inventory System</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <span className="text-xs font-bold tracking-tight">IM</span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-1">
            {filteredGroups.map((group) => (
              <NavigationGroup
                key={group.id}
                group={group}
                pathname={pathname}
                sidebarOpen={sidebarOpen}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Footer / collapse toggle */}
        <div className="border-t border-sidebar-border p-3">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              {user && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-foreground leading-none">{user.name?.split(' ')[0]}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.roles?.[0] || 'User'}</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                className="hidden lg:flex shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                className="hidden lg:flex text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
