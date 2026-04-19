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
  groupId?: string;
  group?: PermissionGroupEntity;
  isSystem!: boolean;
  version!: number;
  roleCount!: number;
  userCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class PermissionGroupEntity {
  id!: string;
  name!: string;
  description?: string;
  module!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
