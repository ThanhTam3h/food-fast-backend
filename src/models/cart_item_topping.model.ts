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
  declare cartItemId: number;

  @ForeignKey(() => Topping)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare toppingId: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  declare quantity: number;

  @BelongsTo(() => CartItem)
  declare cartItem: CartItem;

  @BelongsTo(() => Topping)
  declare topping: Topping;
}
