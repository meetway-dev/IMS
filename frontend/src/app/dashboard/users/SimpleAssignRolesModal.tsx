'use client';

import * as React from 'react';
import { DataRichModal } from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Shield, Key, Eye, CheckCircle, Info } from 'lucide-react';
import { userService } from '@/services/user.service';
import { roleService, permissionService } from '@/services/role-permission.service';

interface SimpleAssignRolesModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentRoles: string[];
  onSuccess: () => void;
}

interface RoleWithPermissions {
  id: string;
  name: string;
  description?: string;
  permissions: Array<{
    key: string;
    name: string;
    description?: string;
  }>;
}

export function SimpleAssignRolesModal({
  open,
  onClose,
  userId,
  userName,
  currentRoles,
  onSuccess,
}: SimpleAssignRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(currentRoles);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roles, setRoles] = React.useState<RoleWithPermissions[]>([]);
  const [expandedRole, setExpandedRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setSelectedRoles(currentRoles);
      loadRoles();
    }
  }, [currentRoles, open]);

  const loadRoles = async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        roleService.getAllRoles(),
        permissionService.getAllPermissions(),
      ]);
      
      const permissionsMap = new Map(
        permissionsRes.data.map((p: any) => [p.id, { key: p.key, name: p.name, description: p.description }])
      );
      
      const rolesWithPermissions: RoleWithPermissions[] = [];
      
      for (const role of rolesRes.data) {
        try {
          const roleDetail = await roleService.getRole(role.id);
          // Ensure roleDetail exists and has permissions
          if (!roleDetail) {
            throw new Error('Role detail not found');
          }
          const rolePermissions = ((roleDetail as any)?.permissions || []).map((perm: any) => {
            // perm could be a permission object with id, or just an ID string
            const permId = typeof perm === 'string' ? perm : perm?.id;
            const permDetail = permissionsMap.get(permId);
            return permDetail || {
              key: permId || 'unknown',
              name: perm?.name || permId || 'Unknown Permission',
              description: perm?.description || 'Permission details not available'
            };
          });
          
          rolesWithPermissions.push({
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: rolePermissions,
          });
        } catch (error) {
          console.error(`Failed to load details for role ${role.id}:`, error);
          rolesWithPermissions.push({
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: [],
          });
        }
      }
      
      setRoles(rolesWithPermissions);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.assignRoles(userId, selectedRoles);
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.permissions.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.key.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const toggleExpand = (roleId: string) => {
    setExpandedRole(prev => prev === roleId ? null : roleId);
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STAFF':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">{selectedRoles.length}</span> role{selectedRoles.length !== 1 ? 's' : ''} selected
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );

  return (
    <DataRichModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Assign Roles to {userName}
        </div>
      }
      description="Select roles to assign. Each role includes specific permissions that will be granted to the user."
      footer={footer}
      contentClassName="p-0"
    >
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles or permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Selected Roles Summary */}
        {selectedRoles.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {selectedRoles.length} role{selectedRoles.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRoles([])}
                  className="h-7 text-xs"
                >
                  Clear all
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedRoles.map(roleId => {
                  const role = roles.find(r => r.id === roleId);
                  return (
                    <Badge
                      key={roleId}
                      variant="outline"
                      className={`${getRoleColor(role?.name || '')} border`}
                    >
                      {role?.name || roleId}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roles List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {filteredRoles.map(role => {
            const isSelected = selectedRoles.includes(role.id);
            const isExpanded = expandedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'border-primary ring-1 ring-primary/20' : ''
                }`}
                onClick={() => toggleRole(role.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleRole(role.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{role.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getRoleColor(role.name)}`}
                          >
                            {role.permissions?.length ?? 0} permission{role.permissions?.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        {role.description && (
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(role.id);
                      }}
                    >
                      {isExpanded ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Permissions View */}
                  {isExpanded && role.permissions?.length > 0 && (
                    <div className="mt-4 pl-7 border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Included Permissions</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {role.permissions?.map(permission => (
                          <div
                            key={permission.key}
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
                          >
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{permission.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {permission.key}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {filteredRoles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No roles found matching "{searchTerm}"</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </DataRichModal>
  );
}