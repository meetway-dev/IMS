import * as React from 'react';
import { DetailModal } from '@/components/ui/responsive-modal';
import { User } from '@/types';

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailsModal({ open, onClose, user }: UserDetailsModalProps) {
  if (!user) return null;
  return (
    <DetailModal
      open={open}
      onClose={onClose}
      title="User Details"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Name</div>
            <div className="text-base">{user.name}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Email</div>
            <div className="text-base">{user.email}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <div className="text-base">{user.status}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Roles</div>
            <div className="text-base">{user.roles?.join(', ') || 'No roles assigned'}</div>
          </div>
        </div>
        {/* Add more fields as needed */}
      </div>
    </DetailModal>
  );
}
