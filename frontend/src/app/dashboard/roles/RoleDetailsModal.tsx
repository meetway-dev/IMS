'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  Users,
  Settings,
  Calendar,
  Hash,
  ArrowUp,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Role } from '@/types';

interface RoleDetailsModalProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

export function RoleDetailsModal({ open, onClose, role }: RoleDetailsModalProps) {
  if (!role) return null;

  const getPermissionEffectIcon = (effect: string) => {
    switch (effect) {
      case 'ALLOW':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DENY':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPermissionTypeColor = (type: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-semibold">{role.name}</div>
              <div className="text-sm text-muted-foreground">Role Details</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role Name</label>
                    <p className="text-sm font-medium">{role.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <p className="text-sm font-medium">{role.priority}</p>
                  </div>
                </div>

                {role.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{role.description}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {role.isSystem && (
                    <Badge variant="secondary">System Role</Badge>
                  )}
                  {role.isDefault && (
                    <Badge variant="outline">Default Role</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hierarchy */}
            {(role.parentRole || role.childRoles?.length) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Role Hierarchy</CardTitle>
                </CardHeader>
                <CardContent>
                  {role.parentRole && (
                    <div className="flex items-center gap-2 mb-4">
                      <ArrowUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Parent:</span>
                      <Badge variant="outline">{role.parentRole.name}</Badge>
                    </div>
                  )}

                  {role.childRoles && role.childRoles.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowUp className="h-4 w-4 text-muted-foreground rotate-180" />
                        <span className="text-sm text-muted-foreground">Children:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {role.childRoles.map((child) => (
                          <Badge key={child.id} variant="outline">
                            {child.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{role.userCount}</p>
                      <p className="text-xs text-muted-foreground">Assigned Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-2xl font-bold">{role.permissions?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Permissions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(role.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Created</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Permissions */}
            {role.permissions && role.permissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Permissions ({role.permissions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {role.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getPermissionEffectIcon(permission.effect)}
                          <div>
                            <div className="font-medium font-mono text-sm">
                              {permission.key}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {permission.name}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPermissionTypeColor(permission.type)}>
                            {permission.type}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-xs">
                            {permission.module}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Role ID:</span>
                    <div className="font-mono text-xs mt-1">{role.id}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <div className="mt-1">{new Date(role.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <div className="mt-1">{new Date(role.updatedAt).toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}