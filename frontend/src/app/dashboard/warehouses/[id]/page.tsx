'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { warehouseService } from '@/services/warehouse.service';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard, StatsGrid } from '@/components/ui/stats-card';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Package,
  BarChart3,
  ThermometerSnowflake,
  Store,
  Container,
  Edit,
  Archive,
} from 'lucide-react';

const WAREHOUSE_TYPE_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  MAIN: { label: 'Main Warehouse', icon: Building2 },
  DISTRIBUTION: { label: 'Distribution Center', icon: Container },
  RETAIL: { label: 'Retail Store', icon: Store },
  COLD_STORAGE: { label: 'Cold Storage', icon: ThermometerSnowflake },
  BONDED: { label: 'Bonded Warehouse', icon: Package },
};

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const warehouseId = params.id as string;

  const { data: warehouse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: () => warehouseService.getWarehouse(warehouseId),
    enabled: !!warehouseId,
  });

  const { data: statistics } = useQuery({
    queryKey: ['warehouse-statistics', warehouseId],
    queryFn: () => warehouseService.getWarehouseStatistics(warehouseId),
    enabled: !!warehouseId,
  });

  if (isLoading) {
    return <LoadingState text="Loading warehouse details..." className="h-64" />;
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Warehouse Details" description="View warehouse information" />
        <ErrorState
          title="Failed to load warehouse"
          description={error instanceof Error ? error.message : 'An unexpected error occurred'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="space-y-6">
        <PageHeader title="Warehouse Not Found" description="The warehouse you are looking for does not exist" />
        <div className="flex justify-center py-12">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/warehouses">
              <ArrowLeft className="h-4 w-4" />
              Back to Warehouses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const typeInfo = WAREHOUSE_TYPE_LABELS[warehouse.type] || { label: warehouse.type, icon: Building2 };
  const TypeIcon = typeInfo.icon;

  return (
    <div className="space-y-6">
      <PageHeader
        title={warehouse.name}
        description={typeInfo.label}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          </div>
        }
      />

      {/* Back link */}
      <Button asChild variant="ghost" size="sm" className="gap-2 -mt-4">
        <Link href="/dashboard/warehouses">
          <ArrowLeft className="h-4 w-4" />
          Back to Warehouses
        </Link>
      </Button>

      {/* Statistics */}
      {statistics && (
        <StatsGrid>
          <StatsCard
            title="Total Locations"
            value={statistics.totalLocations}
            icon={MapPin}
            description={`${statistics.activeLocations} active`}
          />
          <StatsCard
            title="Stock Items"
            value={statistics.totalStockLevels}
            icon={Package}
            description={`${statistics.totalQuantity} total quantity`}
          />
          <StatsCard
            title="Available"
            value={statistics.availableQuantity}
            icon={BarChart3}
            description={`${statistics.totalReserved} reserved`}
          />
          <StatsCard
            title="Capacity"
            value={`${Math.round(statistics.capacityUtilization)}%`}
            icon={Building2}
            description={`${statistics.lowStockItems} low stock items`}
          />
        </StatsGrid>
      )}

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TypeIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{warehouse.name}</p>
                <p className="text-sm text-muted-foreground">
                  {warehouse.code && <span>Code: {warehouse.code} · </span>}
                  {typeInfo.label}
                </p>
              </div>
              <Badge variant={warehouse.isActive ? 'default' : 'secondary'} className="ml-auto">
                {warehouse.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              {warehouse.capacity && (
                <div>
                  <p className="text-muted-foreground">Capacity</p>
                  <p className="font-medium">{warehouse.capacity.toLocaleString()} units</p>
                </div>
              )}
              {warehouse.manager && (
                <div>
                  <p className="text-muted-foreground">Manager</p>
                  <p className="font-medium">{warehouse.manager.name}</p>
                  <p className="text-xs text-muted-foreground">{warehouse.manager.email}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{new Date(warehouse.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">{new Date(warehouse.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {warehouse.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{warehouse.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Contact & Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {warehouse.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{warehouse.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {[warehouse.city, warehouse.state, warehouse.country].filter(Boolean).join(', ')}
                    {warehouse.postalCode && ` · ${warehouse.postalCode}`}
                  </p>
                </div>
              </div>
            )}

            {warehouse.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm">{warehouse.phone}</p>
              </div>
            )}

            {warehouse.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`mailto:${warehouse.email}`} className="text-sm text-primary hover:underline">
                  {warehouse.email}
                </a>
              </div>
            )}

            {!warehouse.address && !warehouse.phone && !warehouse.email && (
              <p className="text-sm text-muted-foreground">No contact information available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Locations */}
      {warehouse.locations && warehouse.locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Locations ({warehouse.locations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {warehouse.locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.code || location.type}</p>
                  </div>
                  <Badge variant={location.isActive ? 'default' : 'secondary'} className="ml-auto text-[10px]">
                    {location.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
