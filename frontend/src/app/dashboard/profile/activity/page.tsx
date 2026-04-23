'use client';

import * as React from 'react';
import { useActivity } from '@/hooks/use-auth';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Filter,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Eye,
  Plus,
  Settings,
  User,
  Shield,
  Package,
  ShoppingCart,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ACTION_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  USER_LOGIN: { icon: LogIn, color: 'text-green-500 bg-green-500/10', label: 'Sign In' },
  USER_LOGOUT: { icon: LogOut, color: 'text-red-500 bg-red-500/10', label: 'Sign Out' },
  USER_CREATED: { icon: Plus, color: 'text-cyan-500 bg-cyan-500/10', label: 'User Created' },
  USER_UPDATED: { icon: User, color: 'text-blue-500 bg-blue-500/10', label: 'Profile Updated' },
  USER_DELETED: { icon: Trash2, color: 'text-red-500 bg-red-500/10', label: 'User Deleted' },
  USER_PASSWORD_CHANGED: { icon: Shield, color: 'text-orange-500 bg-orange-500/10', label: 'Password Changed' },
  SETTINGS_UPDATED: { icon: Settings, color: 'text-purple-500 bg-purple-500/10', label: 'Settings Updated' },
  PRODUCT_CREATED: { icon: Package, color: 'text-cyan-500 bg-cyan-500/10', label: 'Product Created' },
  PRODUCT_UPDATED: { icon: Edit, color: 'text-yellow-500 bg-yellow-500/10', label: 'Product Updated' },
  PRODUCT_DELETED: { icon: Trash2, color: 'text-red-500 bg-red-500/10', label: 'Product Deleted' },
  ORDER_CREATED: { icon: ShoppingCart, color: 'text-green-500 bg-green-500/10', label: 'Order Created' },
  ORDER_UPDATED: { icon: Edit, color: 'text-yellow-500 bg-yellow-500/10', label: 'Order Updated' },
  INVENTORY_ADJUSTED: { icon: Package, color: 'text-indigo-500 bg-indigo-500/10', label: 'Inventory Adjusted' },
};

const DEFAULT_CONFIG = { icon: Eye, color: 'text-muted-foreground bg-muted', label: 'Action' };

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ActivityLogPage() {
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useActivity({
    page,
    limit: 20,
    action: filter !== 'all' ? filter : undefined,
  });

  const activities = data?.data || [];
  const meta = data?.meta || { total: 0, page: 1, totalPages: 1 };

  const filteredActivities = search
    ? activities.filter((a: any) =>
        (a.action || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.entityType || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.ip || '').toLowerCase().includes(search.toLowerCase())
      )
    : activities;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Calendar}
        title="Activity Log"
        description="Track all your account activities and actions"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="USER_LOGIN">Sign In</SelectItem>
                <SelectItem value="USER_LOGOUT">Sign Out</SelectItem>
                <SelectItem value="USER_UPDATED">Profile Updated</SelectItem>
                <SelectItem value="USER_PASSWORD_CHANGED">Password Changed</SelectItem>
                <SelectItem value="PRODUCT_CREATED">Product Created</SelectItem>
                <SelectItem value="ORDER_CREATED">Order Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredActivities.map((activity: any) => {
              const config = ACTION_CONFIG[activity.action] || DEFAULT_CONFIG;
              const Icon = config.icon;
              return (
                <Card key={activity.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{config.label}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {activity.entityType && <span>{activity.entityType}</span>}
                        {activity.ip && (
                          <>
                            <span>•</span>
                            <span>{activity.ip}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="muted" className="mb-1">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatTime(activity.createdAt)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activities found.</p>
              </CardContent>
            </Card>
          )}

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
