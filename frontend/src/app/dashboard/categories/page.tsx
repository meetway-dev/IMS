'use client';

import * as React from 'react';
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
  FolderTree,
  Folder,
  FolderOpen,
  Download,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormModal } from '@/components/ui/responsive-modal';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { categoryService } from '@/services/category.service';
import { Category } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';
import { formatDate } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    search,
    debouncedSearch,
    setSearch,
    page,
    pageSize,
    setPage,
    setPageSize,
    sortBy,
    sortOrder,
    setSort,
    queryParams,
    resetPagination,
  } = useServerSearch();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedRows, setSelectedRows] = useState<Category[]>([]);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories', queryParams],
    queryFn: () => categoryService.getCategories({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search || undefined,
      sortBy: queryParams.sortBy || undefined,
      sortOrder: queryParams.sortOrder || undefined,
    }),
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Category created successfully.', variant: 'success' });
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category.',
        variant: 'error',
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Category updated successfully.', variant: 'success' });
      setIsEditModalOpen(false);
      setEditingCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update category.',
        variant: 'error',
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Category deleted successfully.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category.',
        variant: 'error',
      });
    },
  });

  const isCreateMutating = createCategoryMutation.isPending;
  const isUpdateMutating = updateCategoryMutation.isPending;

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const parentId = formData.get('parentId') as string;
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      parentId: parentId === 'root' ? undefined : parentId || undefined,
    };
    await createCategoryMutation.mutateAsync(data);
  };

  const handleUpdateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCategory) return;

    const formData = new FormData(e.currentTarget);
    const parentId = formData.get('parentId') as string;
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      parentId: parentId === 'root' ? undefined : parentId || undefined,
    };

    await updateCategoryMutation.mutateAsync({ id: editingCategory.id, data });
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedRows.length} categories?`)) {
      Promise.all(
        selectedRows.map((category) => deleteCategoryMutation.mutateAsync(category.id))
      ).then(() => {
        toast({
          title: 'Success',
          description: `${selectedRows.length} categories deleted successfully.`,
        });
        setSelectedRows([]);
      });
    }
  };

  const handleBulkExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Slug', 'Description', 'Parent', 'Created At'],
      ...selectedRows.map((row) => [
        row.id,
        row.name,
        row.slug,
        row.description || '',
        row.parent?.name || 'Root',
        formatDate(row.createdAt),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: 'Export Complete',
      description: `${selectedRows.length} categories exported successfully.`,
    });
  };

  const bulkActions = [
    {
      label: 'Export Selected',
      action: handleBulkExport,
      icon: <Download className="h-4 w-4" />,
    },
    {
      label: 'Delete Selected',
      action: handleBulkDelete,
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
    },
  ];

  const filters = [
    {
      column: 'parentId',
      label: 'Parent Category',
      options: [
        { label: 'All Categories', value: '' },
        { label: 'Root Categories', value: 'root' },
        ...(categoriesData?.data
          .filter((cat: Category) => !cat.parentId)
          .map((cat: Category) => ({
            label: cat.name,
            value: cat.id,
          })) || []),
      ],
    },
  ];

  const columns: ColumnDef<Category>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(value) => table.toggleAllPageRowsSelected(!!value.target.checked)}
          aria-label="Select all"
          className="h-4 w-4 rounded border-border"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(value) => row.toggleSelected(!!value.target.checked)}
          aria-label="Select row"
          className="h-4 w-4 rounded border-border"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Category Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            {row.original.parentId ? (
              <FolderOpen className="h-4 w-4 text-primary" />
            ) : (
              <Folder className="h-4 w-4 text-primary" />
            )}
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.slug}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {row.original.description || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'parent',
      header: 'Parent Category',
      cell: ({ row }) => (
        <div>
          {row.original.parent ? (
            <Badge variant="info">{row.original.parent.name}</Badge>
          ) : (
            <Badge variant="success">Root Category</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'children',
      header: 'Subcategories',
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.children && row.original.children.length > 0 ? (
            <Badge variant="secondary">
              {row.original.children.length} sub
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.createdAt, 'MMM dd, yyyy')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const { toast } = useToast();
        const queryClient = useQueryClient();

        const deleteMutation = useMutation({
          mutationFn: () => categoryService.deleteCategory(row.original.id),
          onSuccess: () => {
            toast({ title: 'Success', description: 'Category deleted successfully.' });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          },
          onError: (error: any) => {
            toast({
              title: 'Error',
              description: error.message || 'Failed to delete category.',
              variant: 'destructive',
            });
          },
        });

        const handleDelete = () => {
          if (confirm('Are you sure you want to delete this category?')) {
            deleteMutation.mutate();
          }
        };

        return (
          <ActionMenu
            trigger={{
              icon: MoreHorizontal,
              variant: 'ghost',
              size: 'icon-sm',
            }}
            items={[
              {
                label: 'View Details',
                icon: Eye,
                iconPosition: 'start' as const,
                onClick: () => console.log('View category', row.original),
              },
              {
                label: 'Edit',
                icon: Edit,
                iconPosition: 'start' as const,
                onClick: () => {
                  setEditingCategory(row.original);
                  setIsEditModalOpen(true);
                },
              },
              {
                label: 'Delete',
                icon: Trash2,
                iconPosition: 'start' as const,
                variant: 'destructive' as const,
                onClick: handleDelete,
              },
            ]}
            align="end"
          />
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={FolderTree}
          title="Categories"
          description="Manage product categories and organize your inventory hierarchy"
        />
        <ErrorState
          title="Failed to load categories"
          description="There was an error loading your categories. Please try again."
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
          icon={FolderTree}
          title="Categories"
          description="Manage product categories and organize your inventory hierarchy"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => refetch()}
                disabled={isLoading}
                aria-label="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>
                  {categoriesData?.data.length || 0} total categories
                  {selectedRows.length > 0 && ` · ${selectedRows.length} selected`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={columns}
              data={categoriesData?.data || []}
              searchPlaceholder="Search categories by name..."
              searchKey="name"
              onSearchChange={setSearch}
              searchValue={search}
              totalCount={categoriesData?.meta.total}
              enableSelection={true}
              enableBulkActions={selectedRows.length > 0}
              bulkActions={bulkActions?.map(action => ({
                label: action.label,
                onClick: action.action,
              }))}
              isLoading={isLoading}
              // Server-side pagination props
              currentPage={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              // Server-side sorting props
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={setSort}
              filters={filters}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Category Modal */}
      <FormModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Category"
        description="Create a new product category to organize your inventory"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreateMutating}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-category-form" loading={isCreateMutating}>
              Create Category
            </Button>
          </div>
        }
      >
        <form id="create-category-form" onSubmit={handleCreateCategory}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter category name"
                required
                disabled={isCreateMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter description (optional)"
                rows={3}
                disabled={isCreateMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Parent Category</Label>
              <Select name="parentId" disabled={isCreateMutating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">None (Root Category)</SelectItem>
                  {categoriesData?.data.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </FormModal>

      {/* Edit Category Modal */}
      <FormModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
        }}
        title="Edit Category"
        description="Update category details"
        footer={
          editingCategory && (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategory(null);
                }}
                disabled={isUpdateMutating}
              >
                Cancel
              </Button>
              <Button type="submit" form="edit-category-form" loading={isUpdateMutating}>
                Update Category
              </Button>
            </div>
          )
        }
      >
        {editingCategory && (
          <form id="edit-category-form" onSubmit={handleUpdateCategory}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Enter category name"
                  required
                  defaultValue={editingCategory.name}
                  disabled={isUpdateMutating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  placeholder="Enter description (optional)"
                  rows={3}
                  defaultValue={editingCategory.description || ''}
                  disabled={isUpdateMutating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-parentId">Parent Category</Label>
                <Select
                  name="parentId"
                  defaultValue={editingCategory.parentId || 'root'}
                  disabled={isUpdateMutating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">None (Root Category)</SelectItem>
                    {categoriesData?.data
                      .filter((cat: Category) => cat.id !== editingCategory.id)
                      .map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        )}
      </FormModal>
    </motion.div>
  );
}
