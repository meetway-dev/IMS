import * as React from 'react';
import { FormModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user.service';

interface AssignRolesPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentRoles: string[];
  currentPermissions: string[];
  allRoles: { id: string; name: string }[];
  allPermissions: { id: string; key: string; name: string }[];
  onSuccess: () => void;
}

export function AssignRolesPermissionsModal({
  open,
  onClose,
  userId,
  currentRoles,
  currentPermissions,
  allRoles,
  allPermissions,
  onSuccess,
}: AssignRolesPermissionsModalProps) {
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(currentRoles);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(currentPermissions);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setSelectedRoles(currentRoles);
    setSelectedPermissions(currentPermissions);
  }, [currentRoles, currentPermissions, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.assignRoles(userId, selectedRoles);
      await userService.assignPermissions(userId, selectedPermissions);
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Assign Roles & Permissions"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} loading={loading}>
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="font-semibold mb-2">Roles</div>
          <div className="flex flex-wrap gap-2">
            {allRoles.map((role) => (
              <label key={role.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => {
                    setSelectedRoles((prev) =>
                      prev.includes(role.id)
                        ? prev.filter((id) => id !== role.id)
                        : [...prev, role.id]
                    );
                  }}
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Permissions</div>
          <div className="max-h-40 overflow-y-auto border rounded p-2">
            {allPermissions.map((perm) => (
              <label key={perm.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={() => {
                    setSelectedPermissions((prev) =>
                      prev.includes(perm.id)
                        ? prev.filter((id) => id !== perm.id)
                        : [...prev, perm.id]
                    );
                  }}
                />
                {perm.key} <span className="text-xs text-muted-foreground">({perm.name})</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </FormModal>
  );
}
