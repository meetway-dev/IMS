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
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}
      >
        <group.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-foreground')} />
        {sidebarOpen && <span>{group.title}</span>}
        {sidebarOpen && isActive && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />
        )}
      </Link>
    );
  }

  // Collapsed sidebar — just the icon
  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center gap-1 py-1">
        <button
          onClick={() => toggleGroup(group.id)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150',
            isExpanded ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
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
                    'flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
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

  // Expanded sidebar — full group
  return (
    <div className="space-y-0.5">
      <button
        onClick={() => toggleGroup(group.id)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-150"
      >
        <span>{group.title}</span>
        <ChevronRight
          className={cn(
            'h-3 w-3 transition-transform duration-150',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      {isExpanded && group.items && (
        <div className="space-y-0.5 pl-2">
          {group.items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between rounded-lg px-3 py-1.5 text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-foreground')} />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="ml-2 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {item.badge}
                  </span>
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

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-200 lg:static lg:inset-y-0',
          sidebarOpen ? 'w-60' : 'w-[68px]',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo area */}
        <div className={cn('flex h-14 items-center border-b px-4', sidebarOpen ? 'justify-between' : 'justify-center')}>
          {sidebarOpen ? (
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                <span className="text-xs font-bold text-background">IM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight">Inventory</span>
                <span className="text-[10px] text-muted-foreground leading-none">Management</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                <span className="text-xs font-bold text-background">IM</span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-1">
            {navigationGroups.map((group) => (
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
        <div className="border-t p-3">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              {user && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{user.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.roles?.[0] || 'User'}</p>
                  </div>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                className="hidden lg:flex shrink-0"
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
                className="hidden lg:flex"
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
