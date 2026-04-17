# Enhanced RBAC Migration Strategy

## Overview
This document outlines the migration strategy from the current RBAC schema to the enhanced production-grade RBAC schema. The enhanced schema includes:
- Permission type classification (CRUD, PAGE, ACTION, RESOURCE, SYSTEM)
- Role hierarchy and precedence
- Resource-level permission scoping
- Enhanced audit logging with standardized actions
- Performance optimizations (caching, precomputed permissions)

## Migration Steps

### Step 1: Backup Current Database
```bash
# Create a backup of your current database
pg_dump -U postgres -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Enhanced Schema
1. **Option A: Generate new migration**
   ```bash
   cd api
   npx prisma migrate dev --name enhanced_rbac_schema
   ```

2. **Option B: Apply schema changes manually**
   - Create a new migration file in `api/prisma/migrations/`
   - Include all changes from `schema.enhanced.prisma`

### Step 3: Data Migration Script
Create and run a data migration script to:
1. Migrate existing permissions to new structure
2. Add missing fields with default values
3. Create system roles and default permissions

### Step 4: Update Application Code
1. **Update imports** to use new services:
   - Replace `RbacService` with `EnhancedRbacService`
   - Replace `RbacGuard` with `EnhancedRbacGuard`

2. **Update decorators**:
   - Use new decorators from `enhanced-permission.factory.ts`
   - Update permission keys to new format if needed

3. **Update JWT strategy** to use enhanced permission resolution

### Step 5: Testing
1. **Unit tests**: Update existing tests for new services
2. **Integration tests**: Test RBAC flows with new schema
3. **Performance tests**: Verify caching improves response times

## Detailed Schema Changes

### New Enums Added
```prisma
enum PermissionType {
  CRUD      // Standard CRUD operations
  PAGE      // Page-level access
  ACTION    // Action-level permissions
  RESOURCE  // Resource-specific permissions
  SYSTEM    // System-level permissions
}

enum PermissionEffect {
  ALLOW
  DENY
}

enum AuditAction {
  // User actions
  USER_CREATED
  USER_UPDATED
  USER_DELETED
  USER_ROLE_ASSIGNED
  USER_ROLE_REVOKED
  // ... more actions
}
```

### Modified Models

#### 1. User Model
**Added fields:**
- `lastPasswordChangeAt: DateTime?`
- `failedLoginAttempts: Int @default(0)`
- `lockedUntil: DateTime?`
- `permissionCache: UserPermissionCache?`

#### 2. Role Model
**Added fields:**
- `priority: Int @default(0)` - Role precedence
- `parentRoleId: String? @db.Uuid` - Role hierarchy
- `createdByUserId: String? @db.Uuid` - Audit trail

#### 3. Permission Model
**Added fields:**
- `name: String` - Human-readable name
- `type: PermissionType @default(CRUD)`
- `effect: PermissionEffect @default(ALLOW)`
- `scope: String?` - e.g., "own", "all", "team"
- `groupId: String? @db.Uuid` - Permission grouping

#### 4. New Models
- `PermissionGroup` - For organizing permissions
- `UserPermissionCache` - Performance optimization
- Enhanced `AuditLog` with standardized actions

## Data Migration Details

### 1. Permission Migration
```sql
-- Migrate existing permissions to new structure
UPDATE "Permission" 
SET 
  "type" = 'CRUD',
  "effect" = 'ALLOW',
  "name" = COALESCE("description", "key")
WHERE "deletedAt" IS NULL;
```

### 2. Role Hierarchy Setup
```sql
-- Set up role hierarchy (example)
UPDATE "Role" 
SET "priority" = 
  CASE "name"
    WHEN 'SUPER_ADMIN' THEN 100
    WHEN 'ADMIN' THEN 90
    WHEN 'MANAGER' THEN 80
    WHEN 'STAFF' THEN 70
    WHEN 'USER' THEN 60
    ELSE 50
  END;
```

### 3. Default Permission Groups
```sql
-- Create permission groups for each module
INSERT INTO "PermissionGroup" ("id", "name", "description", "module", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'User Management', 'Permissions for managing users', 'users', NOW(), NOW()),
  (gen_random_uuid(), 'Product Management', 'Permissions for managing products', 'products', NOW(), NOW()),
  (gen_random_uuid(), 'Inventory Management', 'Permissions for managing inventory', 'inventory', NOW(), NOW());
```

## Rollback Plan

### 1. Soft Rollback (If issues detected)
- Keep new schema but disable enhanced features
- Use feature flags to toggle between old/new implementations
- Revert to using original `RbacService` and `RbacGuard`

### 2. Hard Rollback (If critical issues)
1. Restore database from backup
2. Revert schema changes
3. Roll back application code to previous version

### 3. Rollback Commands
```bash
# If using Prisma migrations
npx prisma migrate resolve --rolled-back <migration_name>

# If manual migration
# Restore from backup file
psql -U postgres -d your_database < backup_file.sql
```

## Performance Considerations

### 1. Caching Strategy
- **UserPermissionCache**: TTL of 5 minutes
- **Redis integration**: Ready structure for future implementation
- **Cache invalidation**: On role/permission changes

### 2. Query Optimization
- **Indexes**: Added for frequently queried fields
- **N+1 prevention**: Preload permissions in user queries
- **Pagination**: All list endpoints support pagination

## Testing Strategy

### 1. Unit Tests
```typescript
// Test enhanced RBAC service
describe('EnhancedRbacService', () => {
  it('should resolve role hierarchy correctly', async () => {
    // Test implementation
  });
  
  it('should cache user permissions', async () => {
    // Test caching logic
  });
});
```

### 2. Integration Tests
- Test permission checking with resource scope
- Test audit logging for sensitive actions
- Test role assignment and revocation

### 3. Load Tests
- Simulate 10k+ users with permission checks
- Measure cache hit rates
- Monitor database query performance

## Deployment Checklist

### Pre-Deployment
- [ ] Database backup completed
- [ ] Migration script tested in staging
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### During Deployment
- [ ] Apply schema migration
- [ ] Run data migration script
- [ ] Deploy updated application code
- [ ] Verify services start correctly

### Post-Deployment
- [ ] Monitor error rates
- [ ] Verify audit logs are being created
- [ ] Test permission checks in production
- [ ] Monitor performance metrics

## Monitoring and Alerting

### Key Metrics to Monitor
1. **Permission cache hit rate**
2. **Audit log creation rate**
3. **Permission check latency**
4. **Database query performance**

### Alerts to Configure
1. **High error rate** in permission checks
2. **Cache miss rate** above threshold
3. **Audit log failures**
4. **Database connection issues**

## Future Enhancements

### 1. Microservices Integration
- Permission service as standalone microservice
- Event-driven permission updates
- Distributed caching with Redis

### 2. Advanced Features
- Time-based permissions (e.g., "access from 9 AM to 5 PM")
- Location-based permissions
- Conditional permissions based on data attributes

### 3. Performance Optimizations
- Permission precomputation for all users
- Background cache warming
- Query result caching

## Support and Troubleshooting

### Common Issues
1. **Permission cache not updating**
   - Check cache invalidation logic
   - Verify TTL settings

2. **Role hierarchy not working**
   - Verify parentRoleId relationships
   - Check priority field values

3. **Audit logs missing**
   - Verify audit service is injected
   - Check database connection

### Escalation Path
1. Check application logs for errors
2. Verify database connectivity
3. Check permission cache status
4. Contact development team if issue persists

## Conclusion
This migration strategy provides a comprehensive plan for transitioning to the enhanced RBAC system. The new schema addresses all identified gaps and provides a solid foundation for scalable, production-grade access control.

**Key Benefits:**
- Granular permission control with resource scoping
- Role hierarchy for flexible access management
- Enhanced audit logging for compliance
- Performance optimizations for scale
- Future-ready architecture for microservices