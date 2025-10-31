import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Order } from './order.model';
import { OrderItemTopping } from './order_item_topping.model';
import { Product } from './product.model';
import { ProductVariant } from './product_variant.model';

@Table
export class OrderItem extends Model<OrderItem> {
  @ForeignKey(() => Order)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare orderId: number;

  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare productId: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  declare quantity: number;

  @ForeignKey(() => ProductVariant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare variantId: number;

  @BelongsTo(() => Order)
  declare order: Order;

  @BelongsTo(() => Product)
  declare product: Product;

  @BelongsTo(() => ProductVariant)
  declare variant: ProductVariant;

  @HasMany(() => OrderItemTopping)
  declare orderItemToppings: OrderItemTopping[];
}
