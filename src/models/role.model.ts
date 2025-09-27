import {
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Permission } from './permission.model';
import { UserRole } from './user_role.model';
import { RolePermission } from './role_permission.model';

@Table
export class Role extends Model<Role> {
  @Column({ allowNull: false, unique: true, type: DataType.STRING })
  name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  description: string;

  // @HasMany(() => User)
  // users: User[]

  @BelongsToMany(() => User, () => UserRole)
  users: User[];

  // @BelongsToMany(() => User, () => UserRole)
  // users: User[];

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];

  // @HasMany(() => Permission)
  // permissions: Permission[];
}
