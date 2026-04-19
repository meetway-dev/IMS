'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleAssignRolesModal } from './SimpleAssignRolesModal';
import { ResponsiveModal, DataRichModal, FormModal, DetailModal } from '@/components/ui/responsive-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ModalTestPage() {
  const [simpleModalOpen, setSimpleModalOpen] = React.useState(false);
  const [responsiveModalOpen, setResponsiveModalOpen] = React.useState(false);
  const [formModalOpen, setFormModalOpen] = React.useState(false);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  const [size, setSize] = React.useState<'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto'>('auto');

  // Mock data for testing
  const mockUser = {
    id: 'test-user-123',
    name: 'John Doe',
    roles: ['MANAGER'],
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Modal Responsiveness Test</h1>
        <p className="text-muted-foreground">
          Test the new responsive modal components with different screen sizes and content volumes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Test Card 1: SimpleAssignRolesModal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">Role Assignment Modal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tests the updated SimpleAssignRolesModal with responsive design.
            </p>
            <Button onClick={() => setSimpleModalOpen(true)} className="w-full">
              Open Role Assignment Modal
            </Button>
          </CardContent>
        </Card>

        {/* Test Card 2: ResponsiveModal with configurable size */}
        <Card>
          <CardHeader>
            <CardTitle>Responsive Modal (Configurable)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Modal Size</Label>
              <div className="flex flex-wrap gap-2">
                {(['sm', 'md', 'lg', 'xl', '2xl', 'auto'] as const).map((s) => (
                  <Button
                    key={s}
                    variant={size === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSize(s)}
                  >
                    {s.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={() => setResponsiveModalOpen(true)} className="w-full">
              Open Responsive Modal ({size})
            </Button>
          </CardContent>
        </Card>

        {/* Test Card 3: Form Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Form Modal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pre-configured form modal with optimal sizing for forms.
            </p>
            <Button onClick={() => setFormModalOpen(true)} className="w-full">
              Open Form Modal
            </Button>
          </CardContent>
        </Card>

        {/* Test Card 4: Detail Modal */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Modal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pre-configured detail modal with scrollable content area.
            </p>
            <Button onClick={() => setDetailModalOpen(true)} className="w-full">
              Open Detail Modal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal Instances */}
      <SimpleAssignRolesModal
        open={simpleModalOpen}
        onClose={() => setSimpleModalOpen(false)}
        userId={mockUser.id}
        userName={mockUser.name}
        currentRoles={mockUser.roles}
        onSuccess={() => console.log('Success!')}
      />

      <ResponsiveModal
        open={responsiveModalOpen}
        onClose={() => setResponsiveModalOpen(false)}
        title={`Responsive Modal (${size})`}
        description="This modal adapts to screen size and content. Resize your browser window to see the effect."
        size={size}
        maxHeight="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input placeholder="Enter first name" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input placeholder="Enter last name" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="Enter email" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <textarea
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Enter a long message to test scrolling..."
            />
          </div>
          
          {/* Generate lots of content to test scrolling */}
          <div className="space-y-2">
            <Label>Test Items (Scrollable Content)</Label>
            <div className="space-y-1 max-h-[200px] overflow-y-auto border rounded-md p-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="p-2 border-b last:border-b-0">
                  Item {i + 1} - Lorem ipsum dolor sit amet
                </div>
              ))}
            </div>
          </div>
        </div>
      </ResponsiveModal>

      <FormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="User Registration Form"
        description="Please fill out all required fields to create a new user account."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input id="username" placeholder="Enter username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" placeholder="Enter email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" placeholder="Enter password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password *</Label>
            <Input id="confirm" type="password" placeholder="Confirm password" />
          </div>
        </div>
      </FormModal>

      <DetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="User Details"
        description="Detailed view of user information with scrollable content area."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Personal Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span>Johnathan Michael Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>john.doe@example.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span>January 15, 1985</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Account Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span>jdoe85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since:</span>
                  <span>March 12, 2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Login:</span>
                  <span>Today, 10:30 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Assigned Roles</h3>
            <div className="space-y-2">
              {['Administrator', 'Content Manager', 'Support Specialist', 'Report Viewer'].map((role, i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded">
                  <span>{role}</span>
                  <span className="text-sm text-muted-foreground">Assigned on Jan {i + 10}, 2024</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Recent Activity</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="p-2 border-b last:border-b-0">
                  <div className="flex justify-between">
                    <span>Logged in from Chrome on Windows</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DetailModal>

      {/* Responsive Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-1">1. Test Responsive Behavior:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Open browser developer tools (F12)</li>
                <li>Switch to responsive design mode</li>
                <li>Test different screen sizes (mobile, tablet, desktop)</li>
                <li>Observe how modals adapt to available space</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">2. Test Scroll Behavior:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Open modals with large content</li>
                <li>Verify scrolling works correctly within modal bounds</li>
                <li>Check that modal header/footer remain fixed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">3. Test Performance:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Open modals with 50+ items</li>
                <li>Verify smooth scrolling and rendering</li>
                <li>Check memory usage doesn't spike</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}