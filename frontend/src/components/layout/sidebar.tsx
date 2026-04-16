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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300 lg:static lg:inset-y-0',
          sidebarOpen ? 'w-64' : 'w-20',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">IMS</span>
              </div>
              <span className="text-lg font-semibold">Inventory</span>
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
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth hover-lift',
                  isActive
                    ? 'gradient-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-soft'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary shadow-soft">
                <span className="text-sm font-bold text-primary-foreground">
                  {getInitials(user.name)}
                </span>
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
            className="mt-4 w-full justify-start transition-smooth hover:bg-accent/50 hover:text-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </Button>
        </div>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-1/2 hidden h-6 w-6 rounded-full border bg-background lg:flex"
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
