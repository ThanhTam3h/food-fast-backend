import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Role } from './role.model';
import { Permission } from './permission.model';

@Table
export class RolePermission extends Model<RolePermission> {
  @ForeignKey(() => Role)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare roleId: number;

  @ForeignKey(() => Permission)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare permissionId: number;
}