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
import { ProductVariant } from './product_variant.model';

@Table
export class CartItem extends Model<CartItem> {
  @ForeignKey(() => Cart)
  @Column({ allowNull: false, type: DataType.INTEGER })
  cartId: number;

  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  productId: number;

  @ForeignKey(() => ProductVariant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  variantId: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  quantity: number;

  @BelongsTo(() => Cart)
  cart: Cart;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => ProductVariant)
  variant: ProductVariant;

  @HasMany(() => CartItemTopping)
  cartItemToppings: CartItemTopping[];
}
