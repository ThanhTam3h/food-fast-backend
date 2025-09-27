import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Merchant } from './merchant.model';
import { Role } from './role.model';
import { User } from './user.model';

@Table
export class UserRole extends Model<UserRole> {
  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  userId: number;

  @ForeignKey(() => Role)
  @Column({ allowNull: false, type: DataType.INTEGER })
  roleId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  merchantId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Role)
  role: Role;

  @BelongsTo(() => Merchant)
  merchant: Merchant;
}
