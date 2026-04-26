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
  Filter,
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
  '/dashboard/inventory': 'Inventory',
  '/dashboard/orders': 'Orders',
  '/dashboard/suppliers': 'Suppliers',
  '/dashboard/users': 'Users',
  '/dashboard/companies': 'Companies',
  '/dashboard/audit': 'Audit Logs',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/security': 'Security',
  '/dashboard/roles': 'Roles',
  '/dashboard/permissions': 'Permissions',
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
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + segments.slice(0, index + 1).join('/'),
      isLast: index === segments.length - 1,
    }));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile menu + Title + Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-accent"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-foreground truncate">{pageTitle}</h1>
            {pathname !== '/dashboard' && (
              <Badge variant="outline" className="hidden sm:inline-flex text-xs font-medium px-2 py-0.5 h-5">
                {breadcrumbSegments.length - 1} sections
              </Badge>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
            <Home className="h-3.5 w-3.5" />
            {breadcrumbSegments.map((segment, index) => (
              <React.Fragment key={segment.path}>
                <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                {segment.isLast ? (
                  <span className="font-medium text-foreground">{segment.name}</span>
                ) : (
                  <button
                    onClick={() => router.push(segment.path)}
                    className="hover:text-foreground transition-colors"
                  >
                    {segment.name}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="relative hidden lg:flex flex-1 max-w-xl mx-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="search"
          placeholder="Search products, orders, suppliers..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/40 border border-input/50 text-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all"
          aria-label="Search"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Mobile search */}
        <Button variant="ghost" size="icon" className="lg:hidden hover:bg-accent" aria-label="Search">
          <Search className="h-5 w-5" />
        </Button>

        {/* Quick actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:flex gap-1.5 h-9 px-3 rounded-lg">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Create</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2.5 text-sm">
              <Package className="mr-2.5 h-4 w-4" />
              New Product
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2.5 text-sm">
              <ShoppingCart className="mr-2.5 h-4 w-4" />
              New Order
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2.5 text-sm">
              <Truck className="mr-2.5 h-4 w-4" />
              New Supplier
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-2.5 text-sm">
              <FileText className="mr-2.5 h-4 w-4" />
              New Purchase Order
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer py-2.5 text-sm text-primary font-medium">
              View all actions
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Help */}
        <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-accent" aria-label="Help">
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-accent" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive border border-background" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-88" align="end">
            <DropdownMenuLabel className="flex items-center justify-between p-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Notifications</span>
                <span className="text-xs text-muted-foreground mt-0.5">You have 3 unread notifications</span>
              </div>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary">
                Mark all read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
              <NotificationItem
                icon={Package}
                iconColor="text-primary"
                title="Low stock alert"
                description="LED Bulb 10W is running low (5 left)"
                time="2h ago"
                badge="Inventory"
                unread
              />
              <NotificationItem
                icon={ShoppingCart}
                iconColor="text-success"
                title="New order received"
                description="Order #ORD-004 from Jane Smith"
                time="4h ago"
                badge="Order"
                unread
              />
              <NotificationItem
                icon={Mail}
                iconColor="text-info"
                title="New message"
                description="Support ticket #CS-1234 needs attention"
                time="1d ago"
                badge="Support"
              />
              <NotificationItem
                icon={Shield}
                iconColor="text-warning"
                title="Security alert"
                description="Unusual login attempt detected"
                time="2d ago"
                badge="Security"
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center text-sm font-medium text-primary py-3 hover:bg-accent/50">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 px-2.5 gap-3 rounded-xl hover:bg-accent"
                aria-label="User menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-medium text-primary-foreground shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="hidden md:flex flex-col items-start min-w-0">
                  <span className="text-sm font-semibold max-w-[120px] truncate text-foreground">
                    {user.name?.split(' ')[0]}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{user.roles?.[0] || 'User'}</span>
                </div>
                <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-medium text-primary-foreground">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    <Badge variant="outline" className="mt-1.5 text-[10px] px-1.5 py-0 h-5 w-fit">
                      {user.roles?.[0] || 'User'}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile')} 
                className="cursor-pointer py-3 text-sm hover:bg-accent/50"
              >
                <User className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Profile</span>
                  <span className="text-xs text-muted-foreground">View your profile</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile/settings')} 
                className="cursor-pointer py-3 text-sm hover:bg-accent/50"
              >
                <Settings className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Settings</span>
                  <span className="text-xs text-muted-foreground">Manage preferences</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile/security')} 
                className="cursor-pointer py-3 text-sm hover:bg-accent/50"
              >
                <Shield className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Security</span>
                  <span className="text-xs text-muted-foreground">Password & 2FA</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/dashboard/profile/activity')} 
                className="cursor-pointer py-3 text-sm hover:bg-accent/50"
              >
                <Calendar className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Activity Log</span>
                  <span className="text-xs text-muted-foreground">Recent activities</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logout.isPending}
                className="cursor-pointer py-3 text-sm text-destructive focus:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{logout.isPending ? 'Logging out...' : 'Log out'}</span>
                  <span className="text-xs text-muted-foreground">Sign out of your account</span>
                </div>
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
  iconColor,
  title,
  description,
  time,
  badge,
  unread = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  badge: string;
  unread?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-3 hover:bg-accent/50 transition-colors cursor-pointer group">
      {unread && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
      )}
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 shrink-0 group-hover:bg-muted')}>
        <Icon className={cn('h-4.5 w-4.5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate text-foreground">{title}</p>
          <Badge variant="outline" className="text-[10px] shrink-0 px-1.5 py-0 h-5">{badge}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1 truncate">{description}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">{time}</p>
          {unread && (
            <span className="text-xs font-medium text-primary">New</span>
          )}
        </div>
      </div>
    </div>
  );
}
