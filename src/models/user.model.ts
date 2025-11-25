import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Address } from './address.model';
import { Cart } from './cart.model';
import { Role } from './role.model';
import { UserRole } from './user_role.model';
import { Merchant } from './merchant.model';

@Table
export class User extends Model<User> {
  @Column({ allowNull: false, unique: true, type: DataType.STRING })
  declare email: string;

  @Column({ allowNull: true, unique: true, type: DataType.STRING })
  declare username: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare password: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare avatar: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare phone: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare provider: string;

  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  declare isActive: boolean;

  @Column({ allowNull: true, type: DataType.STRING })
  declare code_id: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare code_expired: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare reset_id: string;

  @Column({ allowNull: true, type: DataType.STRING })
  declare reset_expired: string;

  // Relationship
  @HasMany(() => Address)
  declare addresses: Address[];

  @HasMany(() => UserRole)
  declare userRoles: UserRole[];

  @HasOne(() => Merchant, 'ownerId')
  declare merchant: Merchant;

  // @HasMany(() => UserRole)
  // userRoles: UserRole[];

  @BelongsToMany(() => Role, () => UserRole)
  declare roles: Role[];

  @HasOne(() => Cart)
  declare cart: Cart;
}
