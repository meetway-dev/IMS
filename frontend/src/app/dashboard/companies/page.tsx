'use client';

'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, MoreHorizontal, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { companyService } from '@/services/company.service';
import { Company } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';

export default function CompaniesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch companies
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getCompanies({ page: 1, limit: 100 }),
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: companyService.createCompany,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Company created successfully.',
      });
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
    // TODO: Implement edit functionality
    toast({
      title: 'Edit Company',
      description: `Editing company: ${company.name}`,
    });
    console.log('Edit company', company);
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteCompanyMutation.mutateAsync(id);
    }
  };

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: companyService.deleteCompany,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Company deleted successfully.',
      });
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

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: 'name',
      header: 'Company Name',
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => row.original.address || '-',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionMenu
          trigger={{ icon: MoreHorizontal, variant: 'ghost', size: 'icon' }}
          items={[
            {
              label: 'Edit',
              icon: Edit,
              iconPosition: 'start',
              onClick: () => handleEditCompany(row.original)
            },
            {
              label: 'Delete',
              icon: Trash2,
              iconPosition: 'start',
              variant: 'destructive',
              onClick: () => handleDeleteCompany(row.original.id)
            },
          ]}
          align="end"
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8" />
            Companies
          </h1>
          <p className="text-muted-foreground">
            Manage your company information and branches
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="company@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCompanyMutation.isPending}>
                  {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={companiesData?.data || []}
        searchKey="name"
        searchPlaceholder="Search companies..."
      />
    </div>
  );
}