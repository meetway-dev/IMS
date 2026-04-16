'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/tables/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for audit logs - replace with actual API
const mockAuditLogs = [
  {
    id: '1',
    action: 'CREATE',
    entity: 'Product',
    entityId: 'PROD-001',
    user: 'John Doe',
    timestamp: '2024-01-15T10:30:00Z',
    details: 'Created new product "LED Bulb 10W"',
  },
  {
    id: '2',
    action: 'UPDATE',
    entity: 'Inventory',
    entityId: 'INV-005',
    user: 'Jane Smith',
    timestamp: '2024-01-15T09:15:00Z',
    details: 'Updated stock quantity from 50 to 45',
  },
  {
    id: '3',
    action: 'DELETE',
    entity: 'Category',
    entityId: 'CAT-003',
    user: 'Admin User',
    timestamp: '2024-01-14T16:45:00Z',
    details: 'Deleted category "Electrical Fittings"',
  },
  {
    id: '4',
    action: 'LOGIN',
    entity: 'User',
    entityId: 'USR-001',
    user: 'John Doe',
    timestamp: '2024-01-14T08:20:00Z',
    details: 'User logged in from IP 192.168.1.100',
  },
  {
    id: '5',
    action: 'EXPORT',
    entity: 'Report',
    entityId: 'REP-2024-01',
    user: 'Jane Smith',
    timestamp: '2024-01-13T14:10:00Z',
    details: 'Exported inventory report as CSV',
  },
];

export default function AuditPage() {
  const [search, setSearch] = React.useState('');
  const [entityFilter, setEntityFilter] = React.useState('all');
  const [actionFilter, setActionFilter] = React.useState('all');

  // In a real app, you would use useQuery with an audit service
  const { data: auditLogs = mockAuditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAuditLogs;
    },
  });

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.entity.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesEntity && matchesAction;
  });

  const columns = [
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.original.action === 'CREATE'
              ? 'bg-green-100 text-green-800'
              : row.original.action === 'UPDATE'
              ? 'bg-blue-100 text-blue-800'
              : row.original.action === 'DELETE'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: 'entity',
      header: 'Entity',
    },
    {
      accessorKey: 'entityId',
      header: 'Entity ID',
    },
    {
      accessorKey: 'user',
      header: 'User',
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }: any) => new Date(row.original.timestamp).toLocaleString(),
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate" title={row.original.details}>
          {row.original.details}
        </div>
      ),
    },
  ];

  const entities = Array.from(new Set(auditLogs.map(log => log.entity)));
  const actions = Array.from(new Set(auditLogs.map(log => log.action)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track all system activities and changes
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search logs..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entities.map(entity => (
                    <SelectItem key={entity} value={entity}>
                      {entity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <DataTable columns={columns} data={filteredLogs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}