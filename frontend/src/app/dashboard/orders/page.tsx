'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/tables/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { orderService } from '@/services/order.service';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useServerSearch } from '@/hooks/use-server-search';

const statusVariantMap: Record<string, 'success' | 'info' | 'warning' | 'destructive' | 'secondary'> = {
  completed: 'success',
  processing: 'info',
  pending: 'warning',
  cancelled: 'destructive',
  refunded: 'secondary',
};

export default function OrdersPage() {
  const {
    search,
    debouncedSearch,
    setSearch,
    sortBy,
    sortOrder,
    setSort,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useServerSearch();

  const {
    data: ordersResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'orders',
      {
        search: debouncedSearch,
        sortBy,
        sortOrder,
        page,
        pageSize,
      },
    ],
    queryFn: () => orderService.getOrders({
      search: debouncedSearch || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
      page,
      limit: pageSize,
    }),
  });

  const orders = ordersResponse?.data || [];

  const columns = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: ({ row }: any) => (
        <span className="font-mono text-sm">{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }: any) => (
        <span className="font-medium">{row.original.customerName || '-'}</span>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }: any) => (
        <span className="font-medium">
          {formatCurrency(row.original.totalAmount || 0)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status || 'pending';
        return (
          <Badge variant={statusVariantMap[status] || 'secondary'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: any) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt
            ? formatDate(row.original.createdAt, 'MMM dd, yyyy')
            : '-'}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={ShoppingCart}
          title="Orders"
          description="Manage and track customer orders"
        />
        <ErrorState
          title="Failed to load orders"
          description="There was an error loading your orders. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <PageHeader
          icon={ShoppingCart}
          title="Orders"
          description="Manage and track customer orders"
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
              {ordersResponse?.meta?.total ?? orders.length} total orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={orders}
              isLoading={isLoading}
              searchKey="customerName"
              searchPlaceholder="Search orders..."
              onSearchChange={setSearch}
              searchValue={search}
              totalCount={ordersResponse?.meta?.total}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={setSort}
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              emptyState={{
                icon: <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />,
                title: 'No orders found',
                description: 'Orders will appear here once they are created.',
              }}
            />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
