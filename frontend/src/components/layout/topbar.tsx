'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Package,
  ShoppingCart,
  Mail,
  Shield,
  Calendar,
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
};

export function Topbar() {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { toast } = useToast();

  const pageTitle = pageTitles[pathname] || 'Dashboard';

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({ title: 'Logged out', description: 'You have been logged out successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to logout.', variant: 'destructive' });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile menu + Title */}
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

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm font-semibold tracking-tight truncate">{pageTitle}</h1>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>Dashboard</span>
            {pathname !== '/dashboard' && (
              <>
                <ChevronDown className="h-2.5 w-2.5 rotate-270" />
                <span className="capitalize">{pathname.split('/').pop()}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center: Search */}
      <div className="relative hidden md:flex flex-1 max-w-md mx-6">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full h-8 pl-9 pr-4 rounded-lg bg-muted/50 border-0 text-sm focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Search"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search */}
        <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon-sm" className="hidden sm:flex" aria-label="Help">
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel className="flex items-center justify-between text-sm">
              <span>Notifications</span>
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary">
                Mark all read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto scrollbar-thin p-1">
              <NotificationItem
                icon={Package}
                iconColor="text-primary"
                title="Low stock alert"
                description="LED Bulb 10W is running low (5 left)"
                time="2h ago"
                badge="Inventory"
              />
              <NotificationItem
                icon={ShoppingCart}
                iconColor="text-success"
                title="New order received"
                description="Order #ORD-004 from Jane Smith"
                time="4h ago"
                badge="Order"
              />
              <NotificationItem
                icon={Mail}
                iconColor="text-info"
                title="New message"
                description="Support ticket #CS-1234 needs attention"
                time="1d ago"
                badge="Support"
              />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer justify-center text-xs font-medium text-primary py-2">
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
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-[11px] font-medium text-background">
                  {getInitials(user.name)}
                </div>
                <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                  {user.name?.split(' ')[0]}
                </span>
                <ChevronDown className="hidden md:block h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer py-2 text-sm">
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 text-sm">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 text-sm">
                <Shield className="mr-2 h-4 w-4" /> Security
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 text-sm">
                <Calendar className="mr-2 h-4 w-4" /> Activity Log
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logout.isPending}
                className="cursor-pointer py-2 text-sm text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
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
  iconColor,
  title,
  description,
  time,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  badge: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-accent/50 transition-colors cursor-pointer">
      <div className={cn('flex h-7 w-7 items-center justify-center rounded-full bg-muted shrink-0')}>
        <Icon className={cn('h-3.5 w-3.5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium truncate">{title}</p>
          <Badge variant="muted" className="text-[10px] shrink-0">{badge}</Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{description}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  );
}
