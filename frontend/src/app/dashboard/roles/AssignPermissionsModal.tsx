'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { roleService } from '@/services/role-permission.service';
import { Permission } from '@/types';
import {
  AlertTriangle,
  CheckCircle,
  Search,
  Shield,
  XCircle
} from 'lucide-react';
import * as React from 'react';

interface AssignPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  roleId: string;
  currentPermissions: string[];
  allPermissions: Permission[];
  onSuccess: () => void;
}

export function AssignPermissionsModal({
  open,
  onClose,
  roleId,
  currentPermissions,
  allPermissions,
  onSuccess
}: AssignPermissionsModalProps) {
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(currentPermissions);

  React.useEffect(() => {
    if (open) {
      setSelectedPermissions(currentPermissions);
      setSearch('');
    }
  }, [open, currentPermissions]);

  const filteredPermissions = allPermissions.filter(permission =>
    permission.key.toLowerCase().includes(search.toLowerCase()) ||
    permission.name.toLowerCase().includes(search.toLowerCase()) ||
    permission.module.toLowerCase().includes(search.toLowerCase())
  );

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await roleService.assignPermissionsToRole(roleId, selectedPermissions);
      toast({
        title: 'Success',
        description: 'Permissions assigned successfully',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getEffectIcon = (effect: string) => {
    switch (effect) {
      case 'ALLOW':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DENY':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'API':
        return 'bg-blue-100 text-blue-800';
      case 'UI':
        return 'bg-green-100 text-green-800';
      case 'DATA':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addedPermissions = selectedPermissions.filter(id => !currentPermissions.includes(id));
  const removedPermissions = currentPermissions.filter(id => !selectedPermissions.includes(id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            Manage Permissions for Role
          </DialogTitle>
          <p className="text-muted-foreground">
            Assign or remove permissions from this role. Changes will affect all users with this role.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search permissions by key, name, or module..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Summary */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Total:</span>
              <Badge variant="outline">{allPermissions.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Selected:</span>
              <Badge variant="default">{selectedPermissions.length}</Badge>
            </div>
            {addedPermissions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-sm">Adding:</span>
                <Badge className="bg-green-100 text-green-800">{addedPermissions.length}</Badge>
              </div>
            )}
            {removedPermissions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-red-600 text-sm">Removing:</span>
                <Badge className="bg-red-100 text-red-800">{removedPermissions.length}</Badge>
              </div>
            )}
          </div>

          {/* Permissions List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            <div className="p-4 space-y-2">
              {filteredPermissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No permissions found matching "{search}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : (
                filteredPermissions.map((permission) => {
                  const isSelected = selectedPermissions.includes(permission.id);
                  const isCurrentlyAssigned = currentPermissions.includes(permission.id);
                  const willBeAdded = isSelected && !isCurrentlyAssigned;
                  const willBeRemoved = !isSelected && isCurrentlyAssigned;

                  return (
                    <div
                      key={permission.id}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-all hover:shadow-sm cursor-pointer ${
                        willBeAdded ? 'bg-green-50 border-green-200' :
                        willBeRemoved ? 'bg-red-50 border-red-200' :
                        isSelected ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handlePermissionToggle(permission.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {getEffectIcon(permission.effect)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium font-mono text-sm truncate">
                            {permission.key}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {permission.name}
                          </div>
                          {permission.description && (
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {permission.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(permission.type)}>
                          {permission.type}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {permission.module}
                        </Badge>
                        {permission.isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {filteredPermissions.length} permissions shown
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={loading}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}