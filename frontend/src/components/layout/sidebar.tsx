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
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';

const navigationGroups = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    type: 'single',
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    icon: Package,
    type: 'group',
    defaultExpanded: true,
    items: [
      {
        name: 'Products',
        href: '/dashboard/products',
        icon: Package,
        description: 'Manage product catalog',
        permissions: ['products:read']
      },
      {
        name: 'Categories',
        href: '/dashboard/categories',
        icon: Tag,
        description: 'Product categories & taxonomy',
        permissions: ['categories:read']
      },
      {
        name: 'Inventory',
        href: '/dashboard/inventory',
        icon: PackageOpen,
        description: 'Stock levels & adjustments',
        permissions: ['inventory:read']
      },
      {
        name: 'Suppliers',
        href: '/dashboard/suppliers',
        icon: Truck,
        description: 'Vendor & supplier management',
        permissions: ['suppliers:read']
      },
    ],
  },
  {
    id: 'sales',
    title: 'Sales & Orders',
    icon: ShoppingCart,
    type: 'group',
    defaultExpanded: true,
    items: [
      {
        name: 'Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
        description: 'Customer orders & transactions',
        permissions: ['orders:read']
      },
      {
        name: 'Customers',
        href: '/dashboard/customers',
        icon: Users,
        description: 'Customer management',
        permissions: ['customers:read'],
        badge: 'Coming Soon'
      },
      {
        name: 'Invoices',
        href: '/dashboard/invoices',
        icon: FileText,
        description: 'Billing & invoicing',
        permissions: ['invoices:read'],
        badge: 'Coming Soon'
      },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    icon: Settings,
    type: 'group',
    defaultExpanded: true,
    items: [
      {
        name: 'Users',
        href: '/dashboard/users',
        icon: Users,
        description: 'User accounts & access',
        permissions: ['users:read']
      },
      {
        name: 'Roles',
        href: '/dashboard/roles',
        icon: Shield,
        description: 'Role-based access control',
        permissions: ['roles:read']
      },
      {
        name: 'Permissions',
        href: '/dashboard/permissions',
        icon: Settings,
        description: 'System permissions',
        permissions: ['permissions:read']
      },
      {
        name: 'Companies',
        href: '/dashboard/companies',
        icon: Building,
        description: 'Organization settings',
        permissions: ['companies:read']
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: BarChart3,
    type: 'group',
    defaultExpanded: false,
    items: [
      {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        description: 'Business intelligence',
        permissions: ['analytics:read'],
        badge: 'Beta'
      },
      {
        name: 'Audit Logs',
        href: '/dashboard/audit',
        icon: FileText,
        description: 'System activity logs',
        permissions: ['audit:read']
      },
      {
        name: 'Reports',
        href: '/dashboard/reports',
        icon: FileText,
        description: 'Custom reports',
        permissions: ['reports:read'],
        badge: 'Coming Soon'
      },
    ],
  },
  {
    id: 'system',
    title: 'System',
    icon: Settings,
    type: 'group',
    defaultExpanded: false,
    items: [
      {
        name: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        description: 'System configuration',
        permissions: ['settings:read'],
        badge: 'Coming Soon'
      },
      {
        name: 'Integrations',
        href: '/dashboard/integrations',
        icon: Settings,
        description: 'Third-party integrations',
        permissions: ['integrations:read'],
        badge: 'Coming Soon'
      },
      {
        name: 'Backup',
        href: '/dashboard/backup',
        icon: Settings,
        description: 'Data backup & restore',
        permissions: ['backup:read'],
        badge: 'Coming Soon'
      },
    ],
  },
];

// Helper component for collapsible navigation groups
function NavigationGroup({
  group,
  pathname,
  sidebarOpen,
  expandedGroups,
  toggleGroup,
}: {
  group: any;
  pathname: string;
  sidebarOpen: boolean;
  expandedGroups: Record<string, boolean>;
  toggleGroup: (groupId: string) => void;
}) {
  const isExpanded = expandedGroups[group.id] ?? group.defaultExpanded;
  
  // Single item (non-group)
  if (group.type === 'single') {
    const isActive = pathname === group.href || pathname.startsWith(group.href + '/');
    return (
      <div className="space-y-1">
        <Link
          href={group.href}
          className={cn(
            'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-primary/10 text-primary shadow-sm'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
          )}
        >
          <div className="relative flex items-center justify-center">
            <group.icon
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-primary'
              )}
            />
            {isActive && (
              <div className="absolute -left-2 h-6 w-1 rounded-full bg-primary" />
            )}
          </div>
          {sidebarOpen && (
            <span
              className={cn(
                'ml-3 transition-all duration-200',
                isActive ? 'font-semibold' : 'font-medium'
              )}
            >
              {group.title}
            </span>
          )}
          {sidebarOpen && isActive && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </Link>
      </div>
    );
  }

  // Group with items
  return (
    <div className="space-y-1">
      {sidebarOpen ? (
        <>
          <button
            onClick={() => toggleGroup(group.id)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200"
          >
            <div className="flex items-center">
              <group.icon className="h-5 w-5 flex-shrink-0 mr-3" />
              <span>{group.title}</span>
            </div>
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isExpanded ? 'rotate-90' : ''
              )}
            />
          </button>
          
          {isExpanded && (
            <div className="ml-7 space-y-1 border-l pl-3">
              {group.items.map((item: any) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                // TODO: Implement permission-based filtering
                const hasPermission = true; // Placeholder for permission check
                
                if (!hasPermission) return null;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200',
                      isActive
                        ? 'bg-primary/5 text-primary'
                        : 'text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-4 w-4 flex-shrink-0 mr-3" />
                      <div className="flex flex-col">
                        <span className={cn('font-medium', isActive ? 'font-semibold' : '')}>
                          {item.name}
                        </span>
                        {sidebarOpen && item.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        // Collapsed sidebar view
        <div className="space-y-2">
          <div className="flex justify-center">
            <button
              onClick={() => toggleGroup(group.id)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            >
              <group.icon className="h-5 w-5" />
            </button>
          </div>
          {isExpanded && (
            <div className="space-y-1">
              {group.items.map((item: any) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const hasPermission = true; // Placeholder
                
                if (!hasPermission) return null;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex justify-center"
                    title={item.name}
                  >
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent/30 hover:text-accent-foreground'
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  
  // State for expanded/collapsed groups
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(() => {
    // Initialize with default expanded states
    const initialState: Record<string, boolean> = {};
    navigationGroups.forEach(group => {
      if (group.type === 'group' && group.defaultExpanded !== undefined) {
        initialState[group.id] = group.defaultExpanded;
      }
    });
    return initialState;
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background/95 backdrop-blur-sm transition-all duration-300 lg:static lg:inset-y-0',
          sidebarOpen ? 'w-72' : 'w-20',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b px-6">
          {sidebarOpen ? (
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <span className="text-base font-bold text-primary-foreground">IMS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">Inventory</span>
                <span className="text-xs text-muted-foreground">Management System</span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <span className="text-base font-bold text-primary-foreground">IMS</span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
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
        </nav>


        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-1/2 hidden h-6 w-6 rounded-full border bg-background shadow-md lg:flex"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </aside>
    </>
  );
}
