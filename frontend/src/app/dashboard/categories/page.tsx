'use client';

import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoryService } from '@/services/category.service';
import { Category } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu, menuItem, menuSeparator } from '@/components/ui/action-menu';

const columns: ColumnDef<Category>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.original.description || '-',
  },
  {
    accessorKey: 'parent',
    header: 'Parent',
    cell: ({ row }) => row.original.parent?.name || '-',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionMenu
        trigger={{
          icon: MoreHorizontal,
          variant: 'ghost',
          size: 'icon',
        }}
        items={[
          {
            label: 'Edit',
            icon: Edit,
            iconPosition: 'start',
            onClick: () => console.log('Edit category', row.original),
          },
          {
            label: 'Delete',
            icon: Trash2,
            iconPosition: 'start',
            variant: 'destructive',
            onClick: () => console.log('Delete category', row.original),
          },
        ]}
        align="end"
      />
    ),
  },
];

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories({ page: 1, limit: 100 }),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Category created successfully.',
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      parentId: formData.get('parentId') as string || undefined,
    };
    await createCategoryMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Enter description (optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentId">Parent Category</Label>
                  <Select name="parentId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.data.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCategoryMutation.isPending}>
                  {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        columns={columns}
        data={categoriesData?.data || []}
        searchKey="name"
        searchPlaceholder="Search categories..."
      />
    </div>
  );
}