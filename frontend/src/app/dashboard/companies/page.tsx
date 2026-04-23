'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { FormModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { companyService } from '@/services/company.service';
import { Company } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function CompaniesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Fetch companies
  const {
    data: companiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getCompanies({ page: 1, limit: 100 }),
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: companyService.createCompany,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Company created successfully.' });
      setIsDialogOpen(false);
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

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Company deleted successfully.' });
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

  const isMutating = createCompanyMutation.isPending;

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };
    await createCompanyMutation.mutateAsync(data);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsDialogOpen(true);
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteCompanyMutation.mutateAsync(id);
    }
  };

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: 'name',
      header: 'Company Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{row.original.email || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{row.original.phone || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="max-w-[200px] truncate text-muted-foreground">
            {row.original.address || '-'}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionMenu
          trigger={{ icon: MoreHorizontal, variant: 'ghost', size: 'icon-sm' }}
          items={[
            {
              label: 'Edit',
              icon: Edit,
              iconPosition: 'start',
              onClick: () => handleEditCompany(row.original),
            },
            {
              label: 'Delete',
              icon: Trash2,
              iconPosition: 'start',
              variant: 'destructive',
              onClick: () => handleDeleteCompany(row.original.id),
            },
          ]}
          align="end"
        />
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
          description="Manage your company information and branches"
          actions={
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <DataTable
          columns={columns}
          data={companiesData?.data || []}
          searchKey="name"
          searchPlaceholder="Search companies..."
          isLoading={isLoading}
          emptyState={{
            icon: <Building className="h-12 w-12 text-muted-foreground/50" />,
            title: 'No companies found',
            description: 'Get started by adding your first company.',
          }}
        />
      </motion.div>

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
        <form id="company-form" onSubmit={handleCreateCompany} className="space-y-4">
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, State"
                defaultValue={editingCompany?.address || ''}
                disabled={isMutating}
              />
            </div>
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
}
