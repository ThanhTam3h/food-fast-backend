import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { Permission } from './permission.model';
import { RolePermission } from './role_permission.model';
import { User } from './user.model';
import { UserRole } from './user_role.model';

@Table
export class Role extends Model<Role> {
  @Column({ allowNull: false, unique: true, type: DataType.STRING })
  declare name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string;

  // @HasMany(() => User)
  // users: User[]

  @BelongsToMany(() => User, () => UserRole)
  declare users: User[];

  // @BelongsToMany(() => User, () => UserRole)
  // users: User[];

  @BelongsToMany(() => Permission, () => RolePermission)
  declare permissions: Permission[];

  // @HasMany(() => Permission)
  // permissions: Permission[];
}
