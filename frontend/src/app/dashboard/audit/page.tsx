'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/tables/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auditService, AuditLog } from '@/services/audit.service';

export default function AuditPage() {
  const [search, setSearch] = React.useState('');
  const [entityFilter, setEntityFilter] = React.useState('all');
  const [actionFilter, setActionFilter] = React.useState('all');

  // Use real API call
  const { data: auditData, isLoading } = useQuery({
    queryKey: ['audit-logs', { search, entityFilter, actionFilter }],
    queryFn: () => auditService.getAuditLogs({
      search,
      entityType: entityFilter !== 'all' ? entityFilter : undefined,
      action: actionFilter !== 'all' ? actionFilter : undefined,
    }),
  });

  const auditLogs = auditData?.data || [];
  const filteredLogs = auditLogs.filter((log: AuditLog) => {
    const matchesSearch = 
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      log.actor?.name.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase());
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
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
            row.original.action.includes('CREATE') || row.original.action.includes('create')
              ? 'bg-green-100 text-green-800'
              : row.original.action.includes('UPDATE') || row.original.action.includes('update')
              ? 'bg-blue-100 text-blue-800'
              : row.original.action.includes('DELETE') || row.original.action.includes('delete')
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: 'entityType',
      header: 'Entity',
    },
    {
      accessorKey: 'entityId',
      header: 'Entity ID',
    },
    {
      accessorKey: 'actor.name',
      header: 'User',
      cell: ({ row }: any) => row.original.actor?.name || 'System',
    },
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      accessorKey: 'details',
      header: 'Details',
      cell: ({ row }: any) => (
        <div className="max-w-xs truncate" title={JSON.stringify(row.original.details)}>
          {typeof row.original.details === 'string' 
            ? row.original.details 
            : JSON.stringify(row.original.details)}
        </div>
      ),
    },
  ];

  const entities = Array.from(new Set(auditLogs.map((log: AuditLog) => log.entityType)));
  const actions = Array.from(new Set(auditLogs.map((log: AuditLog) => log.action)));

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
                  {entities.map((entity: string) => (
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
                  {actions.map((action: string) => (
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
            <DataTable columns={columns} data={filteredLogs} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}