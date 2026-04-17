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
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useLogout } from '@/hooks/use-auth';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getInitials } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Categories', href: '/dashboard/categories', icon: Tag },
  { name: 'Companies', href: '/dashboard/companies', icon: Building },
  { name: 'Inventory', href: '/dashboard/inventory', icon: PackageOpen },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Suppliers', href: '/dashboard/suppliers', icon: Truck },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Audit Logs', href: '/dashboard/audit', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
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
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-l-4 border-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:shadow-sm'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                )} />
                {sidebarOpen && (
                  <span className={cn(
                    'font-medium transition-all duration-200',
                    isActive ? 'font-semibold' : 'group-hover:font-medium'
                  )}>
                    {item.name}
                  </span>
                )}
                {sidebarOpen && isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-6">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                  <span className="text-sm font-bold text-primary-foreground">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.roles?.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            className="mt-6 w-full justify-start transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground hover:shadow-sm"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </Button>
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
