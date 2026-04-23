'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormModal } from '@/components/ui/responsive-modal';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { roleService, permissionService } from '@/services/role-permission.service';
import { Role, Permission } from '@/types';
import { toast } from '@/components/ui/use-toast';

const roleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
  isSystem: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  priority: z.number().min(0).default(0),
  parentRoleId: z.string().optional(),
  permissionIds: z.array(z.string()).default([]),
});

type RoleFormData = z.infer<typeof roleFormSchema>;

interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: Role | null;
}

export function RoleFormModal({ open, onClose, onSuccess, role }: RoleFormModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isSystem: false,
      isDefault: false,
      priority: 0,
      parentRoleId: '',
      permissionIds: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      // Load permissions and roles for selection
      permissionService.getAllPermissions().then(res => setPermissions(res.data));
      roleService.getAllRoles().then(res => setRoles(res.data.filter(r => r.id !== role?.id)));
    }
  }, [open, role?.id]);

  React.useEffect(() => {
    if (role && open) {
      form.reset({
        name: role.name,
        description: role.description || '',
        isSystem: role.isSystem,
        isDefault: role.isDefault,
        priority: role.priority,
        parentRoleId: role.parentRoleId || '',
        permissionIds: role.permissions?.map(p => p.id) || [],
      });
    } else if (!role && open) {
      form.reset({
        name: '',
        description: '',
        isSystem: false,
        isDefault: false,
        priority: 0,
        parentRoleId: '',
        permissionIds: [],
      });
    }
  }, [role, open, form]);

  const onSubmit = async (data: RoleFormData) => {
    setLoading(true);
    try {
      // Convert "none" to undefined for parentRoleId
      const payload = {
        ...data,
        parentRoleId: data.parentRoleId === 'none' ? undefined : data.parentRoleId,
      };
      
      if (role) {
        await roleService.updateRole(role.id, payload);
        toast({
          title: 'Success',
          description: 'Role updated successfully',
        });
      } else {
        await roleService.createRole(payload);
        toast({
          title: 'Success',
          description: 'Role created successfully',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save role',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPermissions = permissions.filter(p =>
    form.watch('permissionIds').includes(p.id)
  );

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={role ? 'Edit Role' : 'Create New Role'}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="role-form" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id="role-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Admin, Manager, Staff" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
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
                      placeholder="Describe the role's purpose and responsibilities"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parentRoleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent role (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No parent</SelectItem>
                        {roles.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="isSystem"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">System Role</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Cannot be deleted or modified by users
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

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Default Role</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Assigned to new users automatically
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
              </div>
            </div>

            <FormField
              control={form.control}
              name="permissionIds"
              render={() => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedPermissions.map((permission) => (
                        <Badge key={permission.id} variant="secondary" className="gap-1">
                          {permission.key}
                          <button
                            type="button"
                            onClick={() => {
                              const current = form.getValues('permissionIds');
                              form.setValue('permissionIds', current.filter(id => id !== permission.id));
                            }}
                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <Select
                      onValueChange={(value) => {
                        const current = form.getValues('permissionIds');
                        if (!current.includes(value)) {
                          form.setValue('permissionIds', [...current, value]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add permissions..." />
                      </SelectTrigger>
                      <SelectContent>
                        {permissions
                          .filter(p => !form.watch('permissionIds').includes(p.id))
                          .map((permission) => (
                            <SelectItem key={permission.id} value={permission.id}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{permission.key}</span>
                                <span className="text-muted-foreground">-</span>
                                <span className="text-sm">{permission.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </FormModal>
  );
}