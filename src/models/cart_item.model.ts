import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Cart } from './cart.model';
import { CartItemTopping } from './cart_item_topping.model';
import { Product } from './product.model';

@Table
export class CartItem extends Model<CartItem> {
  @ForeignKey(() => Cart)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare cartId: number;

  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare productId: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  declare quantity: number;

  @BelongsTo(() => Cart)
  declare cart: Cart;

  @BelongsTo(() => Product)
  declare product: Product;

  @HasMany(() => CartItemTopping)
  declare cartItemToppings: CartItemTopping[];
}
