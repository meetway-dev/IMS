'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronRight,
  Package,
  ShoppingCart,
  Mail,
  Shield,
  Calendar,
  ChevronDown,
  Home,
  Plus,
  Truck,
  FileText,
  type LucideIcon,
} from 'lucide-react';
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
import { usePermissions } from '@/hooks/use-permissions';
import { useToast } from '@/components/ui/use-toast';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/products': 'Products',
  '/dashboard/categories': 'Categories',
  '/dashboard/product-types': 'Product Types',
  '/dashboard/unit-of-measures': 'Units of Measure',
  '/dashboard/inventory': 'Inventory',
  '/dashboard/warehouses': 'Warehouses',
  '/dashboard/suppliers': 'Suppliers',
  '/dashboard/purchase-orders': 'Purchase Orders',
  '/dashboard/goods-receipts': 'Goods Receipts',
  '/dashboard/orders': 'Orders',
  '/dashboard/customers': 'Customers',
  '/dashboard/invoices': 'Invoices',
  '/dashboard/users': 'Users',
  '/dashboard/companies': 'Companies',
  '/dashboard/rbac': 'RBAC Dashboard',
  '/dashboard/roles': 'Roles',
  '/dashboard/permissions': 'Permissions',
  '/dashboard/audit': 'Audit Logs',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
  '/dashboard/integrations': 'Integrations',
  '/dashboard/profile': 'Profile',
  '/dashboard/profile/settings': 'Settings',
  '/dashboard/profile/security': 'Security',
  '/dashboard/profile/activity': 'Activity Log',
};

export function Topbar() {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { toast } = useToast();
  const { canWrite } = usePermissions();

  const router = useRouter();
  const pageTitle = pageTitles[pathname] || 'Dashboard';

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({ title: 'Logged out', description: 'You have been logged out successfully.', variant: 'success' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to logout.', variant: 'error' });
    }
  };

  // Breadcrumb segments
  const breadcrumbSegments = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => ({
      name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: '/' + segments.slice(0, index + 1).join('/'),
      isLast: index === segments.length - 1,
    }));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6">
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <nav className="flex items-center gap-1 text-sm">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
          {breadcrumbSegments.slice(1).map((segment) => (
            <React.Fragment key={segment.path}>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
              {segment.isLast ? (
                <span className="font-medium text-foreground text-sm">{segment.name}</span>
              ) : (
                <button
                  onClick={() => router.push(segment.path)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {segment.name}
                </button>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div className="relative hidden lg:flex">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search..."
            className="w-56 h-8 pl-8 pr-3 rounded-lg bg-muted/50 border-0 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:bg-background transition-all"
            aria-label="Search"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <kbd className="hidden xl:inline-flex items-center rounded border bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground">
              /
            </kbd>
          </div>
        </div>

        {/* Mobile search */}
        <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>

        {/* Quick actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="hidden md:flex">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canWrite('products') && (
              <DropdownMenuItem className="cursor-pointer gap-2 text-sm">
                <Package className="h-4 w-4" />
                New Product
              </DropdownMenuItem>
            )}
            {canWrite('orders') && (
              <DropdownMenuItem className="cursor-pointer gap-2 text-sm">
                <ShoppingCart className="h-4 w-4" />
                New Order
              </DropdownMenuItem>
            )}
            {canWrite('suppliers') && (
              <DropdownMenuItem className="cursor-pointer gap-2 text-sm">
                <Truck className="h-4 w-4" />
                New Supplier
              </DropdownMenuItem>
            )}
            {canWrite('purchase-orders') && (
              <DropdownMenuItem className="cursor-pointer gap-2 text-sm">
                <FileText className="h-4 w-4" />
                Purchase Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold">Notifications</span>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary/80">
                Mark all read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              <NotificationItem
                icon={Package}
                title="Low stock alert"
                description="LED Bulb 10W is running low (5 left)"
                time="2h ago"
                unread
              />
              <NotificationItem
                icon={ShoppingCart}
                title="New order received"
                description="Order #ORD-004 from Jane Smith"
                time="4h ago"
                unread
              />
              <NotificationItem
                icon={Mail}
                title="New message"
                description="Support ticket #CS-1234 needs attention"
                time="1d ago"
              />
              <NotificationItem
                icon={Shield}
                title="Security alert"
                description="Unusual login attempt detected"
                time="2d ago"
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center text-sm text-primary py-2.5">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-5 hidden sm:block" />

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 px-2 gap-2 rounded-lg"
                aria-label="User menu"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                  {getInitials(user.name)}
                </div>
                <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown className="hidden md:block h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile')} 
                className="cursor-pointer gap-2 py-2 text-sm"
              >
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile/settings')} 
                className="cursor-pointer gap-2 py-2 text-sm"
              >
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile/security')} 
                className="cursor-pointer gap-2 py-2 text-sm"
              >
                <Shield className="h-4 w-4" />
                Security
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile/activity')} 
                className="cursor-pointer gap-2 py-2 text-sm"
              >
                <Calendar className="h-4 w-4" />
                Activity Log
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logout.isPending}
                className="cursor-pointer gap-2 py-2 text-sm text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {logout.isPending ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

// ─── Notification Item ──────────────────────────────────────────────────────

function NotificationItem({
  icon: Icon,
  title,
  description,
  time,
  unread = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <div className={cn(
      'flex items-start gap-3 px-3 py-2.5 hover:bg-accent/50 transition-colors cursor-pointer',
      unread && 'bg-accent/30'
    )}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm truncate', unread ? 'font-medium' : 'text-muted-foreground')}>{title}</p>
          {unread && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{time}</p>
      </div>
    </div>
  );
}
