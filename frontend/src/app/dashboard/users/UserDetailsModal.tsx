import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '@/types';

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailsModal({ open, onClose, user }: UserDetailsModalProps) {
  if (!user) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div><span className="font-semibold">Name:</span> {user.name}</div>
          <div><span className="font-semibold">Email:</span> {user.email}</div>
          <div><span className="font-semibold">Status:</span> {user.status}</div>
          <div><span className="font-semibold">Roles:</span> {user.roles?.join(', ')}</div>
          {/* Add more fields as needed */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
