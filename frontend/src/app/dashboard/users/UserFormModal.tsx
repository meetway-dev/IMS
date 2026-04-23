import * as React from 'react';
import { FormModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';
import { User } from '@/types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
}

export function UserFormModal({ open, onClose, onSuccess, user }: UserFormModalProps) {
  const [form, setForm] = React.useState({
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    roleIds: user?.roles || [],
  });
  const [loading, setLoading] = React.useState(false);
  const isEdit = !!user;

  React.useEffect(() => {
    setForm({
      email: user?.email || '',
      name: user?.name || '',
      password: '',
      roleIds: user?.roles || [],
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && user) {
        await userService.updateUser(user.id, form);
      } else {
        await userService.createUser(form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      // TODO: show error
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
      <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          disabled={isEdit}
        />
        <Input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        {!isEdit && (
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        )}
        {/* TODO: Add role selection UI here */}
      </form>
    </FormModal>
  );
}
