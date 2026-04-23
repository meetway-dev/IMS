import * as React from 'react';
import { DetailModal } from '@/components/ui/responsive-modal';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, CheckCircle, XCircle, AlertTriangle, Users, FileText } from 'lucide-react';

interface RolePermissionPreviewProps {
  open: boolean;
  onClose: () => void;
  role: {
    id: string;
    name: string;
    description?: string;
    permissions?: Array<{
      id: string;
      key: string;
      name: string;
      description?: string;
      type: string;
      effect: 'ALLOW' | 'DENY';
      module: string;
      resource?: string;
      action?: string;
    }>;
  };
}

export function RolePermissionPreview({ open, onClose, role }: RolePermissionPreviewProps) {
  if (!role) return null;

  const permissions = role.permissions || [];
  
  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    const module = permission.module || 'other';
    if (!acc[module]) {
      acc[module] = [];
    }
    acc[module].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const getPermissionIcon = (permission: any) => {
    switch (permission.effect) {
      case 'ALLOW':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DENY':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPermissionTypeBadge = (permission: any) => {
    const type = permission.type || 'CRUD';
    const variant = type === 'SYSTEM' ? 'destructive' : 
                   type === 'PAGE' ? 'default' :
                   type === 'ACTION' ? 'secondary' : 'outline';
    
    return (
      <Badge variant={variant} className="text-xs">
        {type}
      </Badge>
    );
  };

  return (
    <DetailModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Permission Preview: {role.name}
        </div>
      }
      description={role.description}
    >
      <div className="flex-1 overflow-hidden">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="border rounded p-4 text-center">
            <div className="text-2xl font-bold">{permissions.length}</div>
            <div className="text-sm text-muted-foreground">Total Permissions</div>
          </div>
          <div className="border rounded p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {permissions.filter(p => p.effect === 'ALLOW').length}
            </div>
            <div className="text-sm text-muted-foreground">Allow Permissions</div>
          </div>
          <div className="border rounded p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {permissions.filter(p => p.effect === 'DENY').length}
            </div>
            <div className="text-sm text-muted-foreground">Deny Permissions</div>
          </div>
          <div className="border rounded p-4 text-center">
            <div className="text-2xl font-bold">
              {Object.keys(permissionsByModule).length}
            </div>
            <div className="text-sm text-muted-foreground">Modules</div>
          </div>
        </div>

        {/* Module Groups */}
        <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2">
          {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
            <div key={module} className="border rounded">
              <div className="p-4 bg-muted/50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <h3 className="font-semibold">
                      {module.charAt(0).toUpperCase() + module.slice(1)}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {modulePermissions.length} permission(s)
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {modulePermissions.filter(p => p.effect === 'ALLOW').length} ALLOW,
                    {' '}{modulePermissions.filter(p => p.effect === 'DENY').length} DENY
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {modulePermissions.map(permission => (
                  <div key={permission.id} className="flex items-start justify-between p-3 border rounded">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getPermissionIcon(permission)}
                        <span className="font-medium">{permission.key}</span>
                        {getPermissionTypeBadge(permission)}
                        <Badge
                          variant={permission.effect === 'DENY' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {permission.effect}
                        </Badge>
                      </div>
                      
                      <p className="text-sm">{permission.name}</p>
                      
                      {permission.description && (
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {permission.resource && (
                          <span className="inline-flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            Resource: {permission.resource}
                          </span>
                        )}
                        {permission.action && (
                          <span className="inline-flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Action: {permission.action}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {permissions.length === 0 && (
          <div className="text-center py-12 border rounded">
            <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No Permissions Assigned</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This role doesn't have any permissions assigned yet.
              Assign permissions to define what users with this role can do.
            </p>
          </div>
        )}
      </div>

      {/* Footer Notes */}
      <div className="mt-6 pt-4 border-t">
        <div className="space-y-3 text-sm">
          <p className="font-medium">How role permissions work:</p>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li>Users assigned this role inherit all these permissions</li>
            <li>DENY permissions override ALLOW permissions from other roles</li>
            <li>Direct user permissions override role permissions</li>
            <li>Permissions are evaluated in order of priority</li>
          </ul>
        </div>
      </div>
    </DetailModal>
  );
}