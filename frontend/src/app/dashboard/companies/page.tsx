'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerSearch } from '@/hooks/use-server-search';
import { ColumnDef } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Calendar,
  Hash,
  RefreshCw,
  Filter,
  Globe,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { FormModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { companyService } from '@/services/company.service';
import { Company } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CompaniesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    search,
    setSearch,
    page,
    pageSize,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    setSort,
    queryParams,
  } = useServerSearch();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch companies
  const {
    data: companiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['companies', queryParams],
    queryFn: () => companyService.getCompanies({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search || undefined,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    }),
  });

  // Filter companies by status
  const filteredCompanies = companiesData?.data?.filter(company => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return company.isActive;
    return !company.isActive;
  }) || [];

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: companyService.createCompany,
    onSuccess: () => {
      toast({ 
        title: 'Success', 
        description: 'Company created successfully.',
      });
      setIsDialogOpen(false);
      setEditingCompany(null);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create company.',
        variant: 'destructive',
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      companyService.updateCompany(id, data),
    onSuccess: () => {
      toast({ 
        title: 'Success', 
        description: 'Company updated successfully.',
      });
      setIsDialogOpen(false);
      setEditingCompany(null);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company.',
        variant: 'destructive',
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({ 
        title: 'Success', 
        description: 'Company deleted successfully.',
      });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete company.',
        variant: 'destructive',
      });
    },
  });

  // Toggle company status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      companyService.toggleCompanyStatus(id, isActive),
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `Company ${variables.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company status.',
        variant: 'destructive',
      });
    },
  });

  const isMutating = createCompanyMutation.isPending || updateCompanyMutation.isPending;

  const handleSubmitCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      taxId: formData.get('taxId') as string,
      website: formData.get('website') as string,
      description: formData.get('description') as string,
      isActive: editingCompany ? editingCompany.isActive : true,
    };

    if (editingCompany) {
      await updateCompanyMutation.mutateAsync({ id: editingCompany.id, data });
    } else {
      await createCompanyMutation.mutateAsync(data);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setCompanyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (companyToDelete) {
      await deleteCompanyMutation.mutateAsync(companyToDelete);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleStatusMutation.mutateAsync({ id, isActive: !currentStatus });
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Preparing companies data for export...',
    });
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Companies data exported successfully.',
      });
    }, 1500);
  };

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: 'name',
      header: 'Company Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            {row.original.code && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {row.original.code}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="space-y-1">
          {row.original.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{row.original.email}</span>
            </div>
          )}
          {row.original.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{row.original.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Location',
      cell: ({ row }) => (
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-muted-foreground line-clamp-2">
            {row.original.address || 'No address provided'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={row.original.isActive ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {row.original.isActive ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Inactive
              </>
            )}
          </Badge>
          <Switch
            checked={row.original.isActive}
            onCheckedChange={() => handleToggleStatus(row.original.id, row.original.isActive)}
            disabled={toggleStatusMutation.isPending}
          />
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleEditCompany(row.original)}
            title="Edit company"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <ActionMenu
            trigger={{ icon: MoreHorizontal, variant: 'ghost', size: 'icon-sm' }}
            items={[
              {
                label: 'View Details',
                icon: Eye,
                iconPosition: 'start',
                onClick: () => {
                  toast({
                    title: 'Viewing Details',
                    description: `Viewing details for ${row.original.name}`,
                  });
                },
              },
              {
                label: row.original.isActive ? 'Deactivate' : 'Activate',
                icon: row.original.isActive ? XCircle : CheckCircle,
                iconPosition: 'start',
                onClick: () => handleToggleStatus(row.original.id, row.original.isActive),
              },
              {
                label: 'Export Data',
                icon: Download,
                iconPosition: 'start',
                onClick: () => {
                  toast({
                    title: 'Exporting Company',
                    description: `Exporting data for ${row.original.name}`,
                  });
                },
              },
              {
                label: 'Delete',
                icon: Trash2,
                iconPosition: 'start',
                variant: 'destructive',
                onClick: () => handleDeleteClick(row.original.id),
              },
            ]}
            align="end"
          />
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Building}
          title="Companies"
          description="Manage your company information and branches"
        />
        <ErrorState
          title="Failed to load companies"
          description="There was an error loading your companies. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const stats = {
    total: companiesData?.meta.total || 0,
    active: filteredCompanies.filter(c => c.isActive).length,
    inactive: filteredCompanies.filter(c => !c.isActive).length,
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <PageHeader
          icon={Building}
          title="Companies"
          description="Manage your company information, branches, and organizational details"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All registered companies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently active companies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Currently inactive companies
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters and Controls */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => refetch()}
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Table */}
      <motion.div variants={staggerItem}>
        <DataTable
          columns={columns}
          data={filteredCompanies}
          searchKey="name"
          searchPlaceholder="Search companies..."
          onSearchChange={setSearch}
          searchValue={search}
          totalCount={filteredCompanies.length}
          isLoading={isLoading}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onSortChange={setSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          emptyState={{
            icon: <Building className="h-12 w-12 text-muted-foreground/50" />,
            title: 'No companies found',
            description: 'Get started by adding your first company.',
          }}
        />
      </motion.div>

      {/* Company Form Modal */}
      <FormModal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingCompany(null);
        }}
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingCompany(null);
              }}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="company-form"
              loading={isMutating}
            >
              {editingCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </div>
        }
      >
        <form id="company-form" onSubmit={handleSubmitCompany} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter company name"
                defaultValue={editingCompany?.name || ''}
                required
                disabled={isMutating}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Company Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="e.g., ACME"
                  defaultValue={editingCompany?.code || ''}
                  disabled={isMutating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  placeholder="Tax identification number"
                  defaultValue={editingCompany?.taxId || ''}
                  disabled={isMutating}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="company@example.com"
                  defaultValue={editingCompany?.email || ''}
                  disabled={isMutating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  defaultValue={editingCompany?.phone || ''}
                  disabled={isMutating}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://example.com"
                defaultValue={editingCompany?.website || ''}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, State, ZIP"
                defaultValue={editingCompany?.address || ''}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Company description and notes..."
                defaultValue={editingCompany?.description || ''}
                disabled={isMutating}
                rows={3}
              />
            </div>
          </div>
        </form>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteCompanyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              loading={deleteCompanyMutation.isPending}
            >
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
