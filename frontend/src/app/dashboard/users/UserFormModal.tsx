'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormModal } from '@/components/ui/responsive-modal';
import { toast } from '@/components/ui/use-toast';
import { userService } from '@/services/user.service';
import { User } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Match the interfaces from user.service.ts
type CreateUserData = {
  email: string;
  password: string;
  name: string;
  roleIds?: string[];
};

type UpdateUserData = Partial<CreateUserData> & {
  password?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roleIds?: string[];
  permissionIds?: string[];
};

const userFormSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  roleIds: z.array(z.string()).default([]),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

export function UserFormModal({ open, onClose, onSuccess, user }: UserFormModalProps) {
  const [loading, setLoading] = React.useState(false);
  const isEdit = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      roleIds: [],
    },
  });

  React.useEffect(() => {
    if (user && open) {
      form.reset({
        email: user.email,
        name: user.name,
        password: '',
        roleIds: user.roles || [],
      });
    } else if (!user && open) {
      form.reset({
        email: '',
        name: '',
        password: '',
        roleIds: [],
      });
    }
  }, [user, open, form]);

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      if (isEdit && user) {
        // For update, password is optional
        const updatePayload: UpdateUserData = {
          email: data.email,
          name: data.name,
          roleIds: data.roleIds,
        };
        if (data.password) {
          updatePayload.password = data.password;
        }
        await userService.updateUser(user.id, updatePayload);
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // For create, password is required
        if (!data.password) {
          toast({
            title: 'Error',
            description: 'Password is required for new user',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        const createPayload: CreateUserData = {
          email: data.email,
          name: data.name,
          password: data.password,
          roleIds: data.roleIds,
        };
        await userService.createUser(createPayload);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Add User'}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="user-form" loading={loading}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    {...field}
                    disabled={isEdit}
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
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!isEdit && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {/* TODO: Add role selection UI here */}
        </form>
      </Form>
    </FormModal>
  );
}
