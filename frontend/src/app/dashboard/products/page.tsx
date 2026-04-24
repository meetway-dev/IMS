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
  Package,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/tables/data-table';
import { FormModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { ErrorState } from '@/components/ui/states';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { productTypeService } from '@/services/product-type.service';
import { unitOfMeasureService } from '@/services/unit-of-measure.service';
import { Product, Category } from '@/types';
import type { ProductType } from '@/services/product-type.service';
import type { UnitOfMeasure } from '@/services/unit-of-measure.service';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { ActionMenu } from '@/components/ui/action-menu';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function ProductsPage() {
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      sku: formData.get('sku') as string,
      barcode: formData.get('barcode') as string || undefined,
      categoryId: formData.get('categoryId') as string,
      typeId: formData.get('typeId') as string,
      unitId: formData.get('unitId') as string,
      price: Number(formData.get('price')),
      cost: Number(formData.get('cost')),
      minStockLevel: Number(formData.get('minStockLevel')),
    };

    if (editingProduct) {
      await updateProductMutation.mutateAsync({ id: editingProduct.id, data });
    } else {
      await createProductMutation.mutateAsync(data);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.sku}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.category?.name || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.unit}
        </span>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {formatCurrency(row.original.price)}
        </div>
      ),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const stock = row.original.stock ?? 0;
        const minStock = row.original.minStockLevel;
        const isLow = stock < minStock;
        return (
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', isLow && 'text-destructive')}>
              {stock}
            </span>
            {isLow && (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Low
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
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
              onClick: () => handleEditProduct(row.original),
            },
            {
              label: 'Delete',
              icon: Trash2,
              iconPosition: 'start',
              variant: 'destructive',
              onClick: () => handleDeleteProduct(row.original.id),
            },
          ]}
          align="end"
        />
      ),
    },
  ];

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productService.getProducts({
      page: queryParams.page,
      limit: queryParams.limit,
      search: queryParams.search || undefined,
      sortBy: queryParams.sortBy || undefined,
      sortOrder: queryParams.sortOrder || undefined,
    }),
  });

  // Fetch categories for the form
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories({ page: 1, limit: 100 }),
  });

  // Fetch product types for the form
  const { data: productTypesData } = useQuery({
    queryKey: ['product-types', 'active'],
    queryFn: () => productTypeService.getActiveProductTypes(),
  });

  // Fetch units of measure for the form
  const { data: unitOfMeasuresData } = useQuery({
    queryKey: ['unit-of-measures', 'active'],
    queryFn: () => unitOfMeasureService.getActiveUnitOfMeasures(),
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product created successfully.' });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create product.',
        variant: 'destructive',
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product updated successfully.' });
      setIsDialogOpen(false);
      setEditingProduct(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product.',
        variant: 'destructive',
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product.',
        variant: 'destructive',
      });
    },
  });

  const isMutating = createProductMutation.isPending || updateProductMutation.isPending;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Package}
          title="Products"
          description="Manage your product inventory"
        />
        <ErrorState
          title="Failed to load products"
          description="There was an error loading your products. Please try again."
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
          icon={Package}
          title="Products"
          description="Manage your product inventory"
          actions={
            <Button
              onClick={() => {
                setEditingProduct(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <DataTable
          columns={columns}
          data={productsData?.data || []}
          searchKey="name"
          searchPlaceholder="Search products..."
          onSearchChange={setSearch}
          searchValue={search}
          totalCount={productsData?.meta.total}
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
          emptyState={{
            icon: <Package className="h-12 w-12 text-muted-foreground/50" />,
            title: 'No products found',
            description: 'Get started by adding your first product.',
          }}
        />
      </motion.div>

      <FormModal
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingProduct(null);
              }}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-form"
              loading={isMutating}
            >
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        }
      >
        <form
          id="product-form"
          key={editingProduct?.id || 'create'}
          onSubmit={handleSubmitProduct}
          className="space-y-4"
        >
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter product name"
                defaultValue={editingProduct?.name || ''}
                required
                disabled={isMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                placeholder="Enter SKU"
                defaultValue={editingProduct?.sku || ''}
                required
                disabled={isMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (Optional)</Label>
              <Input
                id="barcode"
                name="barcode"
                placeholder="Enter barcode"
                defaultValue={editingProduct?.barcode || ''}
                disabled={isMutating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select name="categoryId" required disabled={isMutating} defaultValue={editingProduct?.categoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeId">Product Type</Label>
                <Select name="typeId" required disabled={isMutating} defaultValue={editingProduct?.typeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypesData?.map((type: ProductType) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitId">Unit of Measure</Label>
                <Select name="unitId" required disabled={isMutating} defaultValue={editingProduct?.unitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOfMeasuresData?.map((unit: UnitOfMeasure) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Sale Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={editingProduct?.price || ''}
                  required
                  disabled={isMutating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Purchase Cost</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={editingProduct?.cost || ''}
                  required
                  disabled={isMutating}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                placeholder="10"
                defaultValue={editingProduct?.minStockLevel || ''}
                required
                disabled={isMutating}
              />
            </div>
          </div>
        </form>
      </FormModal>
    </motion.div>
  );
}
