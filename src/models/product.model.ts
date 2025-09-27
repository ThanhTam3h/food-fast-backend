import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Category } from './category.model';
import { Merchant } from './merchant.model';
import { OrderItem } from './order_item.model';
import { ProductTopping } from './product_topping.model';
import { ProductVariant } from './product_variant.model';

import { CartItem } from './cart_item.model';

@Table
export class Product extends Model<Product> {
  @Column({ allowNull: false, type: DataType.STRING })
  name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  description: string;

  @Column({ allowNull: false, type: DataType.FLOAT })
  basePrice: number;

  @Column({ allowNull: false, type: DataType.STRING })
  image: string;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  isActive: boolean;

  @ForeignKey(() => Category)
  @Column({ allowNull: false, type: DataType.INTEGER })
  categoryId: number;

  @ForeignKey(() => Merchant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  merchantId: number;

  @BelongsTo(() => Category)
  category: Category[];

  @BelongsTo(() => Merchant)
  merchant: Merchant[];

  @HasMany(() => ProductTopping)
  productToppings: ProductTopping[];

  @HasMany(() => ProductVariant)
  productVariants: ProductVariant[];

  @HasMany(() => OrderItem)
  orderItem: OrderItem[];

  @HasMany(() => CartItem)
  cartItems: CartItem[];
}
