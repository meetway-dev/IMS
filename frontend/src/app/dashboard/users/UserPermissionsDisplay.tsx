import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { userService } from '@/services/user.service';
import { roleService, permissionService } from '@/services/role-permission.service';

interface UserPermissionsDisplayProps {
  userId: string;
}

export function UserPermissionsDisplay({ userId }: UserPermissionsDisplayProps) {
  const [loading, setLoading] = React.useState(true);
  const [userDetails, setUserDetails] = React.useState<any>(null);
  const [roles, setRoles] = React.useState<any[]>([]);
  const [directPermissions, setDirectPermissions] = React.useState<any[]>([]);
  const [inheritedPermissions, setInheritedPermissions] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (userId) {
      loadUserPermissions();
    }
  }, [userId]);

  const loadUserPermissions = async () => {
    setLoading(true);
    try {
      // Load user details
      const user = await userService.getUser(userId);
      setUserDetails(user);

      // Load roles
      const rolesData = await Promise.all(
        (user.roles || []).map((roleId: string) => roleService.getRole(roleId).catch(() => null))
      );
      const validRoles = rolesData.filter((role): role is any => role !== null);
      setRoles(validRoles);

      // Extract all permissions from roles
      const allRolePermissions: any[] = [];
      validRoles.forEach(role => {
        if (role.permissions) {
          allRolePermissions.push(...role.permissions);
        }
      });
      
      // Remove duplicates
      const uniqueRolePermissions = Array.from(
        new Map(allRolePermissions.map(p => [p.id, p])).values()
      );
      setInheritedPermissions(uniqueRolePermissions);

      // TODO: Load direct permissions from user
      // For now, we'll show empty array
      setDirectPermissions([]);

    } catch (error) {
      console.error('Failed to load user permissions:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            Loading permissions...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPermissions = [...directPermissions, ...inheritedPermissions].length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Roles</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {roles.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                ) : (
                  roles.map(role => (
                    <Badge key={role.id} variant="secondary" className="text-sm">
                      {role.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Direct Permissions</span>
              </div>
              <div className="text-2xl font-bold">{directPermissions.length}</div>
              <p className="text-xs text-muted-foreground">
                Explicitly assigned to user
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Permissions</span>
              </div>
              <div className="text-2xl font-bold">{totalPermissions}</div>
              <p className="text-xs text-muted-foreground">
                From roles + direct assignments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Direct Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Direct Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {directPermissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No direct permissions assigned
            </div>
          ) : (
            <div className="space-y-3">
              {directPermissions.map(permission => (
                <div key={permission.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getPermissionIcon(permission)}
                      <span className="font-medium">{permission.key}</span>
                      {getPermissionTypeBadge(permission)}
                      <Badge variant={permission.effect === 'DENY' ? 'destructive' : 'default'}>
                        {permission.effect}
                      </Badge>
                    </div>
                    <p className="text-sm">{permission.name}</p>
                    {permission.description && (
                      <p className="text-sm text-muted-foreground">{permission.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Module: {permission.module}</span>
                      {permission.resource && <span>• Resource: {permission.resource}</span>}
                      {permission.action && <span>• Action: {permission.action}</span>}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Direct
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inherited Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Inherited Permissions (from Roles)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inheritedPermissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No permissions inherited from roles
            </div>
          ) : (
            <div className="space-y-4">
              {roles.map(role => (
                <div key={role.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{role.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {role.permissions?.length || 0} permissions
                      </Badge>
                    </div>
                    {role.description && (
                      <span className="text-sm text-muted-foreground">{role.description}</span>
                    )}
                  </div>
                  
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="ml-6 space-y-2">
                      {role.permissions.map((permission: any) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 border-l-2 border-muted pl-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getPermissionIcon(permission)}
                              <span className="font-medium text-sm">{permission.key}</span>
                              {getPermissionTypeBadge(permission)}
                            </div>
                            <p className="text-sm text-muted-foreground">{permission.name}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            From {role.name}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Conflicts */}
      {(directPermissions.length > 0 && inheritedPermissions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Permission Resolution Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p className="font-medium">How permissions are evaluated:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <span className="font-medium">Direct permissions override role permissions</span>
                  <p className="text-muted-foreground">
                    If a user has a direct permission that conflicts with a role permission, 
                    the direct permission takes precedence.
                  </p>
                </li>
                <li>
                  <span className="font-medium">DENY permissions override ALLOW permissions</span>
                  <p className="text-muted-foreground">
                    DENY effects always take precedence over ALLOW effects, regardless of source.
                  </p>
                </li>
                <li>
                  <span className="font-medium">Higher priority permissions override lower priority</span>
                  <p className="text-muted-foreground">
                    Direct permissions have higher priority than role permissions by default.
                  </p>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}