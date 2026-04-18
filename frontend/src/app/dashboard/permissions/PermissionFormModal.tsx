'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { permissionService } from '@/services/role-permission.service';
import { Permission } from '@/types';
import { toast } from '@/components/ui/use-toast';

const permissionFormSchema = z.object({
  key: z.string().min(1, 'Permission key is required').regex(/^[a-zA-Z0-9_\-\.]+$/, 'Key must contain only letters, numbers, dots, hyphens, and underscores'),
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  type: z.enum(['API', 'UI', 'DATA']),
  effect: z.enum(['ALLOW', 'DENY']),
  module: z.string().min(1, 'Module is required'),
  resource: z.string().optional(),
  action: z.string().optional(),
  scope: z.string().optional(),
  isSystem: z.boolean().default(false),
});

type PermissionFormData = z.infer<typeof permissionFormSchema>;

interface PermissionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  permission?: Permission | null;
}

export function PermissionFormModal({ open, onClose, onSuccess, permission }: PermissionFormModalProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      key: '',
      name: '',
      description: '',
      type: 'API',
      effect: 'ALLOW',
      module: '',
      resource: '',
      action: '',
      scope: '',
      isSystem: false,
    },
  });

  React.useEffect(() => {
    if (permission && open) {
      form.reset({
        key: permission.key,
        name: permission.name,
        description: permission.description || '',
        type: permission.type as 'API' | 'UI' | 'DATA',
        effect: permission.effect as 'ALLOW' | 'DENY',
        module: permission.module,
        resource: permission.resource || '',
        action: permission.action || '',
        scope: permission.scope || '',
        isSystem: permission.isSystem,
      });
    } else if (!permission && open) {
      form.reset({
        key: '',
        name: '',
        description: '',
        type: 'API',
        effect: 'ALLOW',
        module: '',
        resource: '',
        action: '',
        scope: '',
        isSystem: false,
      });
    }
  }, [permission, open, form]);

  const onSubmit = async (data: PermissionFormData) => {
    setLoading(true);
    try {
      if (permission) {
        await permissionService.updatePermission(permission.id, data);
        toast({
          title: 'Success',
          description: 'Permission updated successfully',
        });
      } else {
        await permissionService.createPermission(data);
        toast({
          title: 'Success',
          description: 'Permission created successfully',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save permission',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{permission ? 'Edit Permission' : 'Create New Permission'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Key *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., users.create, products.read"
                        {...field}
                        disabled={!!permission} // Can't edit key after creation
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Create Users, Read Products" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this permission allows"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="API">API</SelectItem>
                        <SelectItem value="UI">UI</SelectItem>
                        <SelectItem value="DATA">DATA</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effect *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select effect" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ALLOW">ALLOW</SelectItem>
                        <SelectItem value="DENY">DENY</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="module"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., users, products, orders" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="resource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., user, product, order" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., create, read, update, delete" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., own, all, department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isSystem"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">System Permission</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Cannot be deleted or modified by users. Used for core system functionality.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {permission ? 'Update Permission' : 'Create Permission'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}