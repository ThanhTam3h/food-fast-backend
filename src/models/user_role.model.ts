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
  declare userId: number;

  @ForeignKey(() => Role)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare roleId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: true, type: DataType.INTEGER })
  declare merchantId: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Role)
  declare role: Role;

  @BelongsTo(() => Merchant)
  declare merchant: Merchant;
}
