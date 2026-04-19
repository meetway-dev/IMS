# Accessing the Enhanced Role & Permission Assignment UI

## Prerequisites
1. **Frontend server** is running at `http://localhost:3000`
2. **Backend API** is running (should be running on port 3001 or similar)
3. **Browser** with admin user logged in (SUPER_ADMIN or ADMIN role)

## Steps to See the Enhanced UI

### 1. Navigate to Users Page
- Open browser to: `http://localhost:3000/dashboard/users`
- You should see the user management table

### 2. Access Enhanced Role Assignment Modal
- Find any user in the table
- Click the three dots (⋮) in the "Actions" column
- Select "Assign roles/permissions" from the dropdown menu
- **The enhanced modal should appear** with:
  - Left panel: Roles with permission counts
  - Right panel: Grouped permissions with search/filter
  - Expandable module sections
  - Visual badges for ALLOW/DENY effects

### 3. Key Features to Test

#### Role Panel (Left)
- ✓ Checkboxes to select roles
- ✓ "View" button to see role permissions
- ✓ Permission count badges
- ✓ Role descriptions (if available)

#### Permission Panel (Right)
- ✓ Search box for permissions
- ✓ Module filter dropdown
- ✓ Expand/collapse module sections (click module headers)
- ✓ Individual permission checkboxes
- ✓ ALLOW/DENY effect badges
- ✓ Permission type badges (CRUD, PAGE, ACTION, etc.)

#### Bottom Section
- ✓ Selection counters (X roles, Y permissions selected)
- ✓ Save Changes button
- ✓ Cancel button

## Troubleshooting

### If Modal Doesn't Appear:
1. **Check browser console** (F12 → Console tab) for errors
2. **Hard refresh** the page (Ctrl+F5 or Cmd+Shift+R)
3. **Clear browser cache** or try incognito mode
4. **Check network tab** for API call failures

### If Data Doesn't Load:
1. Ensure backend API is running (`http://localhost:3001`)
2. Check if you're logged in with admin privileges
3. Verify API endpoints are accessible:
   - `GET /api/roles` - Should return role list
   - `GET /api/permissions` - Should return permission list

### Common Issues:
- **"Checkbox component not found"**: Make sure `@/components/ui/checkbox` exists
- **TypeScript errors**: Run `npx tsc --noEmit` in frontend directory
- **Build errors**: Run `npm run build` in frontend directory

## Alternative Access Methods

### 1. Direct URL for Testing
You can't directly open the modal via URL, but you can:
1. Go to Users page
2. Open browser console
3. Run: `document.querySelector('[data-testid="assign-roles-button"]')?.click()`

### 2. Programmatic Testing
Create a test component that directly renders the modal:

```tsx
import { EnhancedAssignRolesPermissionsModal } from '@/app/dashboard/users/EnhancedAssignRolesPermissionsModal';

function TestModal() {
  return (
    <EnhancedAssignRolesPermissionsModal
      open={true}
      onClose={() => console.log('close')}
      userId="test-user-id"
      userName="Test User"
      currentRoles={[]}
      currentPermissions={[]}
      onSuccess={() => console.log('success')}
    />
  );
}
```

## Expected Behavior

### Successful Load:
1. Modal opens with fade-in animation
2. Roles load in left panel (may show loading state briefly)
3. Permissions load in right panel, grouped by module
4. Search and filter controls are functional
5. Checkboxes respond to clicks
6. Module sections expand/collapse on click
7. Save button becomes enabled when changes are made

### Error States:
- **Network error**: Shows error message with retry option
- **Empty state**: Shows "No data available" messages
- **Loading state**: Shows spinners/loading indicators

## Verification Checklist

- [ ] Modal opens when clicking "Assign roles/permissions"
- [ ] Roles are displayed in left panel
- [ ] Permissions are grouped by module in right panel
- [ ] Search box filters permissions
- [ ] Module filter dropdown works
- [ ] Module sections expand/collapse
- [ ] Checkboxes can be checked/unchecked
- [ ] Selection counters update correctly
- [ ] Save button works (makes API calls)
- [ ] Cancel button closes modal

## Getting Help

If you still can't see the updated UI:
1. Check the terminal where frontend is running for compilation errors
2. Look at browser console for runtime errors
3. Verify file paths are correct:
   - `frontend/src/app/dashboard/users/EnhancedAssignRolesPermissionsModal.tsx` exists
   - `frontend/src/app/dashboard/users/page.tsx` imports it correctly

The enhanced UI replaces the old `AssignRolesPermissionsModal` with a more feature-rich interface while maintaining the same API integration.