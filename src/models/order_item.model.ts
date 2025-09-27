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
  orderId: number;

  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  productId: number;

  @Column({ allowNull: false, type: DataType.INTEGER })
  quantity: number;

  @ForeignKey(() => ProductVariant)
  @Column({ allowNull: false, type: DataType.INTEGER })
  variantId: number;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => ProductVariant)
  variant: ProductVariant;

  @HasMany(() => OrderItemTopping)
  orderItemToppings: OrderItemTopping[];
}
