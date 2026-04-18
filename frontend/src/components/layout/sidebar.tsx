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
import { getInitials } from '@/lib/utils';

const navigationSections = [
  {
    title: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { name: 'Products', href: '/dashboard/products', icon: Package },
      { name: 'Categories', href: '/dashboard/categories', icon: Tag },
      { name: 'Inventory', href: '/dashboard/inventory', icon: PackageOpen },
      { name: 'Suppliers', href: '/dashboard/suppliers', icon: Truck },
    ],
  },
  {
    title: 'Management',
    items: [
      { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Companies', href: '/dashboard/companies', icon: Building },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Audit Logs', href: '/dashboard/audit', icon: FileText },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Security', href: '/dashboard/security', icon: Shield },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

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
          <div className="space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-2">
                {sidebarOpen && (
                  <div className="px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary/10 text-primary shadow-sm'
                            : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                        )}
                      >
                        <div className="relative flex items-center justify-center">
                          <item.icon
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
                            {item.name}
                          </span>
                        )}
                        {sidebarOpen && isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t p-6">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-md">
                  <span className="text-sm font-bold text-primary-foreground">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.roles?.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

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
