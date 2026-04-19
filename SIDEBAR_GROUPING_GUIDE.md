# Sidebar Grouping System - IMS Dashboard

## Overview
The sidebar has been redesigned with a scalable grouping system to accommodate future expansion. The new structure supports collapsible groups, permission-based visibility, and better organization for multiple pages and links.

## Key Features

### 1. **Collapsible Groups**
- Groups can be expanded/collapsed by users
- State is maintained per user session
- Default expanded/collapsed state configurable per group

### 2. **Permission-Based Filtering**
- Each navigation item includes `permissions` array
- Placeholder implementation ready for RBAC integration
- Items can be hidden based on user permissions

### 3. **Flexible Navigation Structure**
- Two types of navigation items:
  - **Single items**: Direct links (e.g., Dashboard)
  - **Groups**: Collapsible containers with multiple items
- Support for nested items within groups

### 4. **Enhanced UI Elements**
- Badges for status indicators (Beta, Coming Soon, etc.)
- Item descriptions for better context
- Active state indicators
- Responsive design for collapsed/expanded sidebar

## Navigation Structure Definition

The navigation is defined in `frontend/src/components/layout/sidebar.tsx` as `navigationGroups` array:

```typescript
const navigationGroups = [
  {
    id: 'dashboard',           // Unique identifier
    title: 'Dashboard',        // Display name
    icon: LayoutDashboard,     // Lucide React icon component
    href: '/dashboard',        // Route path
    type: 'single',           // 'single' or 'group'
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    icon: Package,
    type: 'group',
    defaultExpanded: true,    // Initial expanded state
    items: [
      {
        name: 'Products',
        href: '/dashboard/products',
        icon: Package,
        description: 'Manage product catalog',
        permissions: ['products:read'],  // RBAC permissions
        badge: 'Beta'                    // Optional badge
      },
      // ... more items
    ],
  },
  // ... more groups
];
```

## Adding New Navigation Items

### 1. **Adding a New Single Page**
```typescript
{
  id: 'new-page',
  title: 'New Page',
  icon: YourIconComponent,
  href: '/dashboard/new-page',
  type: 'single',
}
```

### 2. **Adding a New Group**
```typescript
{
  id: 'new-group',
  title: 'New Group',
  icon: YourIconComponent,
  type: 'group',
  defaultExpanded: false,
  items: [
    {
      name: 'Item 1',
      href: '/dashboard/item-1',
      icon: ItemIcon,
      description: 'Item description',
      permissions: ['item1:read'],
    },
    // ... more items
  ],
}
```

### 3. **Adding to Existing Group**
Simply add a new item to the `items` array of an existing group.

## Permission Integration

The current implementation includes a placeholder for permission checking. To implement full RBAC:

1. **Update the permission check** in `NavigationGroup` component:
```typescript
// Replace placeholder with actual permission check
const hasPermission = checkUserPermissions(user, item.permissions);
```

2. **Define permission constants** in a shared location
3. **Integrate with backend RBAC system**

## UI Customization

### Badges
Available badge types:
- `'Beta'` - For experimental features
- `'Coming Soon'` - For planned features
- `'New'` - For recently added features
- Custom text for other statuses

### Icons
- Use Lucide React icons (import from 'lucide-react')
- Ensure icons are imported at the top of the file
- Consistent sizing: h-5 w-5 for group icons, h-4 w-4 for item icons

## Responsive Behavior

### Expanded Sidebar (w-72)
- Shows group titles and item descriptions
- Full text labels visible
- Collapsible group headers with chevron indicators

### Collapsed Sidebar (w-20)
- Shows only icons
- Group expansion shows items as icon-only
- Tooltips on hover for item names

### Mobile View
- Sidebar slides in/out as overlay
- Backdrop for closing
- Maintains same grouping structure

## Backward Compatibility

All existing navigation items have been preserved:
- ✅ Dashboard
- ✅ Products
- ✅ Categories  
- ✅ Inventory
- ✅ Suppliers
- ✅ Orders
- ✅ Users
- ✅ Roles
- ✅ Permissions
- ✅ Companies
- ✅ Audit Logs
- ✅ Analytics

New "Coming Soon" pages are clearly marked and won't break navigation.

## Future Enhancements

### Planned Features
1. **Persistent Group State** - Save expanded/collapsed state to localStorage
2. **Favorites/Pinned Items** - Allow users to pin frequently used items
3. **Search Navigation** - Quick search within sidebar items
4. **Custom Ordering** - Allow users to reorder groups/items
5. **Theming Support** - Different icon styles based on theme

### Integration Points
1. **RBAC System** - Connect with backend permission system
2. **Feature Flags** - Show/hide items based on feature flags
3. **Analytics** - Track navigation usage patterns
4. **User Preferences** - Store sidebar preferences per user

## Maintenance Guidelines

1. **Keep IDs Unique** - Ensure all `id` values are unique across groups
2. **Consistent Naming** - Use kebab-case for hrefs, Title Case for display names
3. **Permission Strings** - Follow `resource:action` format (e.g., `products:read`)
4. **Icon Selection** - Choose semantically appropriate icons
5. **Descriptions** - Keep item descriptions concise but informative

## Troubleshooting

### Common Issues

1. **Missing Pages**
   - Ensure the page route exists in `app/dashboard/`
   - Check href paths match Next.js routing

2. **TypeScript Errors**
   - Verify all icons are imported
   - Check for missing required properties
   - Ensure proper TypeScript types

3. **Permission Issues**
   - Test with placeholder `hasPermission = true`
   - Verify permission strings match backend

4. **UI Rendering Problems**
   - Check console for React errors
   - Verify Tailwind classes are correct
   - Test both expanded and collapsed states

## Conclusion

The new sidebar grouping system provides a scalable foundation for future growth. It maintains backward compatibility while offering enhanced organization, better user experience, and ready integration points for advanced features like RBAC and user preferences.

For questions or issues, refer to this documentation or contact the frontend team.