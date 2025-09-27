import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { CartItem } from './cart_item.model';
import { Merchant } from './merchant.model';
import { User } from './user.model';

@Table
export class Cart extends Model<Cart> {
  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  userId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  merchantId: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Merchant)
  merchant: Merchant;

  @HasMany(() => CartItem)
  cartItems: CartItem[];
}
