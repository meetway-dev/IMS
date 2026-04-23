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
  Key,
  Settings,
  Calendar,
  Hash,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Permission } from '@/types';

interface PermissionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  permission: Permission | null;
}

export function PermissionDetailsModal({ open, onClose, permission }: PermissionDetailsModalProps) {
  if (!permission) return null;

  const getEffectIcon = (effect: string) => {
    switch (effect) {
      case 'ALLOW':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'DENY':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/10">
              <Key className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-xl font-semibold font-mono">{permission.key}</div>
              <div className="text-sm text-muted-foreground">Permission Details</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Permission Key</label>
                  <p className="text-sm font-medium font-mono">{permission.key}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Display Name</label>
                  <p className="text-sm font-medium">{permission.name}</p>
                </div>
              </div>

              {permission.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{permission.description}</p>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getEffectIcon(permission.effect)}
                  <span className={`font-medium ${
                    permission.effect === 'ALLOW' ? 'text-green-600' :
                    permission.effect === 'DENY' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {permission.effect}
                  </span>
                </div>
                <Badge className={getTypeColor(permission.type)}>
                  {permission.type}
                </Badge>
                {permission.isSystem && (
                  <Badge variant="secondary">System</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Permission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Module</label>
                  <p className="text-sm font-mono font-medium">{permission.module}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Version</label>
                  <p className="text-sm font-medium">{permission.version}</p>
                </div>
                {permission.resource && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resource</label>
                    <p className="text-sm font-mono">{permission.resource}</p>
                  </div>
                )}
                {permission.action && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Action</label>
                    <p className="text-sm font-mono">{permission.action}</p>
                  </div>
                )}
                {permission.scope && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scope</label>
                    <p className="text-sm font-mono">{permission.scope}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Permission ID:</span>
                  <div className="font-mono text-xs mt-1">{permission.id}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <div className="mt-1">{new Date(permission.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="mt-1">{new Date(permission.updatedAt).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}