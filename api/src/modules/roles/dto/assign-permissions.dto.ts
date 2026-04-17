import { IsArray, IsUUID } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  permissionIds!: string[];
}