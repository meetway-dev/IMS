'use client';

import * as React from 'react';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
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

export function Topbar() {
  const { setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();
  const logout = useLogout();
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-64 pl-9"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* User menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                  <span className="text-sm font-medium text-primary-foreground">
                    {getInitials(user.name)}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.roles?.join(', ')}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending}>
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
