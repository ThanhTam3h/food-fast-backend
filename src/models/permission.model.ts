import {
  Column,
  DataType,
  BelongsToMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { RolePermission } from './role_permission.model';
import { Role } from './role.model';

@Table
export class Permission extends Model<Permission> {
  @Column({ allowNull: false, unique: true, type: DataType.STRING })
  declare name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string;

  // @HasMany(() => RolePermission)
  // rolePermissions: RolePermission[];

  @BelongsToMany(() => Role, () => RolePermission)
  declare roles: Role[];
}
