import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CartItem } from './cart_item.model';
import { Topping } from './topping.model';

@Table
export class CartItemTopping extends Model<CartItemTopping> {
  @ForeignKey(() => CartItem)
  @Column({ allowNull: false, type: DataType.INTEGER })
  cartItemId: number;

  @ForeignKey(() => Topping)
  @Column({ allowNull: false, type: DataType.INTEGER })
  toppingId: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  quantity: number;

  @BelongsTo(() => CartItem)
  cartItem: CartItem;

  @BelongsTo(() => Topping)
  topping: Topping;
}
