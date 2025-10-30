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
  declare userId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare merchantId: number;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Merchant)
  declare merchant: Merchant;

  @HasMany(() => CartItem)
  declare cartItems: CartItem[];
}
