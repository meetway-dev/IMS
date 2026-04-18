'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, Menu, LogOut, User, Settings, HelpCircle, ChevronDown, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { useLogout } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/products': 'Products',
  '/dashboard/categories': 'Categories',
  '/dashboard/inventory': 'Inventory',
  '/dashboard/orders': 'Orders',
  '/dashboard/suppliers': 'Suppliers',
  '/dashboard/users': 'Users',
  '/dashboard/companies': 'Companies',
  '/dashboard/audit': 'Audit Logs',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/security': 'Security',
};

export function Topbar() {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { toast } = useToast();

  const pageTitle = pageTitles[pathname] || 'Dashboard';
  const breadcrumbs = pathname.split('/').filter(Boolean);

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
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-6 lg:px-8">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title & breadcrumb */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-xl font-semibold tracking-tight truncate">{pageTitle}</h1>
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">Dashboard</span>
          {breadcrumbs.slice(1).map((crumb, idx) => (
            <React.Fragment key={crumb}>
              <ChevronDown className="h-3 w-3 rotate-270" />
              <span className="truncate capitalize">{crumb}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xl ml-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products, orders, suppliers..."
          className="w-full pl-10 pr-4 py-2 rounded-full border bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-shadow"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Help */}
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="font-semibold flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-xs font-normal text-primary cursor-pointer">Mark all as read</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="rounded-lg bg-accent/30 p-3 mb-2 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-muted-foreground">LED Bulb 10W is running low (5 left)</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-accent/30 p-3 mb-2 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-muted-foreground">Order #ORD-004 from Jane Smith</p>
                    <p className="text-xs text-muted-foreground mt-1">4 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-center text-sm font-medium text-primary">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                asChild={false}
                className="relative h-9 w-9 rounded-full p-0 md:h-10 md:w-10 md:rounded-lg md:px-2 md:gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-md">
                  <span className="text-sm font-semibold text-primary-foreground">
                    {getInitials(user.name)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                <span className="hidden md:inline text-sm font-medium truncate max-w-[100px]">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="hidden md:block h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate max-w-[180px]">
                      {user.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      {user.roles?.map((role) => (
                        <span key={role} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span className="text-sm">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span className="text-sm">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-muted-foreground">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span className="text-sm">Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logout.isPending}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm">{logout.isPending ? 'Logging out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
