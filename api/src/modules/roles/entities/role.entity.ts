export class RoleEntity {
  id!: string;
  name!: string;
  description?: string;
  isSystem!: boolean;
  isDefault!: boolean;
  priority!: number;
  parentRoleId?: string;
  parentRole?: RoleEntity;
  childRoles!: RoleEntity[];
  permissions!: PermissionEntity[];
  userCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class PermissionEntity {
  id!: string;
  key!: string;
  name!: string;
  description?: string;
  type!: string;
  effect!: string;
  module!: string;
  resource?: string;
  action?: string;
  scope?: string;
  isSystem!: boolean;
  version!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
