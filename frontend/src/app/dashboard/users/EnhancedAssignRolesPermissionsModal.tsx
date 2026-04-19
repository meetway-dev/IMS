import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Filter, Shield, Key, Users, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { userService } from '@/services/user.service';
import { roleService, permissionService } from '@/services/role-permission.service';

interface EnhancedAssignRolesPermissionsModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentRoles: string[];
  currentPermissions: string[];
  onSuccess: () => void;
}

interface PermissionGroup {
  module: string;
  resource: string;
  permissions: any[];
}

export function EnhancedAssignRolesPermissionsModal({
  open,
  onClose,
  userId,
  userName,
  currentRoles,
  currentPermissions,
  onSuccess,
}: EnhancedAssignRolesPermissionsModalProps) {
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>(currentRoles);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>(currentPermissions);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterModule, setFilterModule] = React.useState<string>('all');
  
  const [roles, setRoles] = React.useState<{ id: string; name: string; description?: string; permissionCount?: number }[]>([]);
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set());
  const [roleDetails, setRoleDetails] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (open) {
      setSelectedRoles(currentRoles);
      setSelectedPermissions(currentPermissions);
      loadData();
    }
  }, [currentRoles, currentPermissions, open]);

  const loadData = async () => {
    try {
      const [rolesRes, permissionsRes] = await Promise.all([
        roleService.getAllRoles(),
        permissionService.getAllPermissions(),
      ]);
      
      setRoles(rolesRes.data);
      setPermissions(permissionsRes.data);
      
      // Load role details for preview
      const roleDetailsMap: Record<string, any> = {};
      for (const role of rolesRes.data) {
        try {
          const roleDetail = await roleService.getRole(role.id);
          roleDetailsMap[role.id] = roleDetail;
        } catch (error) {
          console.error(`Failed to load details for role ${role.id}:`, error);
        }
      }
      setRoleDetails(roleDetailsMap);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

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

  // Group permissions by module and resource
  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, PermissionGroup> = {};
    
    permissions.forEach(permission => {
      const module = permission.module || 'other';
      const resource = permission.resource || 'general';
      const key = `${module}:${resource}`;
      
      if (!groups[key]) {
        groups[key] = {
          module,
          resource,
          permissions: [],
        };
      }
      
      groups[key].permissions.push(permission);
    });
    
    return Object.values(groups);
  }, [permissions]);

  // Filter permissions based on search and module filter
  const filteredGroups = React.useMemo(() => {
    return groupedPermissions.filter(group => {
      // Module filter
      if (filterModule !== 'all' && group.module !== filterModule) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const hasMatchingPermission = group.permissions.some(perm => 
          perm.key.toLowerCase().includes(searchLower) ||
          perm.name.toLowerCase().includes(searchLower) ||
          perm.description?.toLowerCase().includes(searchLower)
        );
        return hasMatchingPermission;
      }
      
      return true;
    });
  }, [groupedPermissions, searchTerm, filterModule]);

  // Get unique modules for filter
  const uniqueModules = React.useMemo(() => {
    const modules = new Set(groupedPermissions.map(g => g.module));
    return Array.from(modules).sort();
  }, [groupedPermissions]);

  const toggleModule = (module: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
    } else {
      newExpanded.add(module);
    }
    setExpandedModules(newExpanded);
  };

  const getRolePermissionCount = (roleId: string) => {
    const role = roleDetails[roleId];
    return role?.permissions?.length || 0;
  };

  const viewRolePermissions = (roleId: string) => {
    const role = roleDetails[roleId];
    if (role?.permissions) {
      alert(`Role "${role.name}" has ${role.permissions.length} permissions:\n\n` +
        role.permissions.map((p: any) => `• ${p.key}: ${p.name}`).join('\n'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Roles & Permissions to {userName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Manage user access by assigning roles and direct permissions
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Roles */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Roles
                </div>
                <Badge variant="outline">
                  {selectedRoles.length} selected
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Roles bundle multiple permissions together
              </p>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded p-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={(checked) => {
                          setSelectedRoles(prev =>
                            checked
                              ? [...prev, role.id]
                              : prev.filter(id => id !== role.id)
                          );
                        }}
                      />
                      <div>
                        <Label htmlFor={`role-${role.id}`} className="font-medium cursor-pointer">
                          {role.name}
                        </Label>
                        {role.description && (
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getRolePermissionCount(role.id)} permissions
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => viewRolePermissions(role.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Role Assignment Tips:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Assign roles instead of individual permissions when possible</li>
                <li>Users can have multiple roles</li>
                <li>Permissions from roles are combined</li>
                <li>Direct permissions override role permissions in case of conflict</li>
              </ul>
            </div>
          </div>
          
          {/* Right Column - Permissions */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Direct Permissions
                </div>
                <Badge variant="outline">
                  {selectedPermissions.length} selected
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Assign specific permissions directly to the user
              </p>
              
              {/* Search and Filter */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={filterModule}
                    onChange={(e) => setFilterModule(e.target.value)}
                  >
                    <option value="all">All Modules</option>
                    {uniqueModules.map(module => (
                      <option key={module} value={module}>
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Permission Groups */}
              <ScrollArea className="h-[300px] border rounded">
                <div className="p-2">
                  {filteredGroups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No permissions found matching your criteria
                    </div>
                  ) : (
                    filteredGroups.map((group) => (
                      <div key={`${group.module}:${group.resource}`} className="mb-4 last:mb-0">
                        <button
                          type="button"
                          className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded"
                          onClick={() => toggleModule(group.module)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedModules.has(group.module) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <div className="text-left">
                              <div className="font-medium">
                                {group.module.charAt(0).toUpperCase() + group.module.slice(1)}
                                {group.resource !== 'general' && ` • ${group.resource}`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {group.permissions.length} permission(s)
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {group.permissions.filter(p => selectedPermissions.includes(p.id)).length} selected
                          </Badge>
                        </button>
                        
                        {expandedModules.has(group.module) && (
                          <div className="ml-6 mt-2 space-y-2">
                            {group.permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center justify-between p-2 hover:bg-muted/30 rounded">
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    id={`perm-${permission.id}`}
                                    checked={selectedPermissions.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      setSelectedPermissions(prev =>
                                        checked
                                          ? [...prev, permission.id]
                                          : prev.filter(id => id !== permission.id)
                                      );
                                    }}
                                  />
                                  <div>
                                    <Label htmlFor={`perm-${permission.id}`} className="font-medium cursor-pointer text-sm">
                                      {permission.key}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">{permission.name}</p>
                                    {permission.description && (
                                      <p className="text-xs text-muted-foreground/70 mt-1">{permission.description}</p>
                                    )}
                                  </div>
                                </div>
                                <Badge
                                  variant={permission.effect === 'DENY' ? 'destructive' : 'default'}
                                  className="text-xs"
                                >
                                  {permission.effect}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Permission Notes:</p>
              <ul className="list-disc pl-4 space-y-1 mt-1">
                <li>Direct permissions override role permissions</li>
                <li>DENY permissions take precedence over ALLOW permissions</li>
                <li>Use DENY permissions to explicitly block access</li>
                <li>Permissions are evaluated in order of priority</li>
              </ul>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Total: {selectedRoles.length} roles, {selectedPermissions.length} direct permissions
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} loading={loading}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}