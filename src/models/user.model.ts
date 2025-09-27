import {
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  Table,
  BelongsToMany,
} from 'sequelize-typescript';
import { Address } from './address.model';
import { UserRole } from './user_role.model';
import { Cart } from './cart.model';
import { Role } from './role.model';

@Table
export class User extends Model<User> {
  @Column({ allowNull: false, unique: true, type: DataType.STRING })
  email: string;

  @Column({ allowNull: false, type: DataType.STRING })
  password: string;

  @Column({ allowNull: true, type: DataType.STRING })
  avatar: string;

  @Column({ allowNull: true, type: DataType.STRING })
  phone: string;

  @Column({ allowNull: true, type: DataType.STRING })
  provider: string;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  isActive: boolean;

  @Column({ allowNull: true, type: DataType.STRING })
  code_id: string;

  @Column({ allowNull: true, type: DataType.STRING })
  code_expired: string;

  @Column({ allowNull: true, type: DataType.STRING })
  reset_id: string;

  @Column({ allowNull: true, type: DataType.STRING })
  reset_expired: string;

  // Relationship
  @HasMany(() => Address)
  addresses: Address[];

  // @HasMany(() => UserRole)
  // userRoles: UserRole[];

  @BelongsToMany(() => Role, () => UserRole)
  roles: Role[];

  @HasOne(() => Cart)
  cart: Cart;

}
