'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { roleService } from '@/services/role-permission.service';
import { Permission } from '@/types';
import { toast } from '@/components/ui/use-toast';

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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            Assign Permissions to Role
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <Badge variant="outline">{allPermissions.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Selected:</span>
              <Badge variant="default">{selectedPermissions.length}</Badge>
            </div>
            {addedPermissions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-green-600">Adding:</span>
                <Badge className="bg-green-100 text-green-800">{addedPermissions.length}</Badge>
              </div>
            )}
            {removedPermissions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-red-600">Removing:</span>
                <Badge className="bg-red-100 text-red-800">{removedPermissions.length}</Badge>
              </div>
            )}
          </div>

          {/* Permissions List */}
          <div className="h-96 overflow-y-auto border rounded-lg">
            <div className="p-4 space-y-2">
              {filteredPermissions.map((permission) => {
                const isSelected = selectedPermissions.includes(permission.id);
                const isCurrentlyAssigned = currentPermissions.includes(permission.id);
                const willBeAdded = isSelected && !isCurrentlyAssigned;
                const willBeRemoved = !isSelected && isCurrentlyAssigned;

                return (
                  <div
                    key={permission.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      willBeAdded ? 'bg-green-50 border-green-200' :
                      willBeRemoved ? 'bg-red-50 border-red-200' :
                      isSelected ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      {getEffectIcon(permission.effect)}
                      <div className="flex-1">
                        <div className="font-medium font-mono text-sm">
                          {permission.key}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {permission.name}
                        </div>
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
              })}
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
              <Button onClick={handleSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}