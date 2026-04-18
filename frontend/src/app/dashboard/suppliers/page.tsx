'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, MoreHorizontal, Mail, Phone, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supplierService } from '@/services/supplier.service';
import { Supplier } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';

export default function SuppliersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch suppliers
  const { data: suppliersData, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierService.getSuppliers({ page: 1, limit: 100 }),
  });

  // Create supplier mutation
  const createSupplierMutation = useMutation({
    mutationFn: supplierService.createSupplier,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Supplier created successfully.',
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create supplier.',
        variant: 'destructive',
      });
    },
  });

  const handleEditSupplier = (supplier: Supplier) => {
    // TODO: Implement edit functionality
    toast({
      title: 'Edit Supplier',
      description: `Editing supplier: ${supplier.name}`,
    });
    console.log('Edit supplier', supplier);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      await deleteSupplierMutation.mutateAsync(id);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string | undefined,
      phone: formData.get('phone') as string | undefined,
      address: formData.get('address') as string | undefined,
      contactPerson: formData.get('contactPerson') as string | undefined,
      notes: formData.get('notes') as string | undefined,
    };
    await createSupplierMutation.mutateAsync(data);
  };

  // Delete supplier mutation
  const deleteSupplierMutation = useMutation({
    mutationFn: supplierService.deleteSupplier,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Supplier deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete supplier.',
        variant: 'destructive',
      });
    },
  });

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.email || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.phone || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.contactPerson || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[200px] truncate">{row.original.address || '-'}</span>
        </div>
      ),
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
              onClick: () => handleEditSupplier(row.original)
            },
            {
              label: 'Delete',
              icon: Trash2,
              iconPosition: 'start',
              variant: 'destructive',
              onClick: () => handleDeleteSupplier(row.original.id)
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
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your suppliers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@supplier.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St, City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSupplierMutation.isPending}
                >
                  {createSupplierMutation.isPending ? 'Creating...' : 'Create Supplier'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={suppliersData?.data || []}
        searchKey="name"
        searchPlaceholder="Search suppliers..."
      />
    </div>
  );
}
